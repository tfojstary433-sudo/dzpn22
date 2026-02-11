import { NextRequest, NextResponse } from 'next/server';
import { teams, clubToFirebaseKey } from '@/lib/data';
import { getAllUserClubs, getPlayerStats, getMatchHistory } from '@/lib/firebase';
import { API_ENDPOINTS, REPLIT_API_BASE_URL } from '@/lib/constants';
import { fetchWithTimeout, mapPositionToPolish } from '@/lib/utils';

function calculateRatingAndResult(match: { 
  homeScore: number; 
  awayScore: number; 
  playerTeam?: string; 
  homeTeam: string; 
  awayTeam: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}, position?: string) {
  let result: 'W' | 'L' | 'D' = 'D';
  const pTeam = match.playerTeam?.toLowerCase();
  const hTeam = match.homeTeam?.toLowerCase();
  const aTeam = match.awayTeam?.toLowerCase();

  if (pTeam === hTeam) {
    if (match.homeScore > match.awayScore) result = 'W';
    else if (match.homeScore < match.awayScore) result = 'L';
  } else if (pTeam === aTeam) {
    if (match.awayScore > match.homeScore) result = 'W';
    else if (match.awayScore < match.homeScore) result = 'L';
  }

  let rating = 6.5;
  rating += (match.goals || 0) * 2.0;
  rating += (match.assists || 0) * 1.0;
  rating -= (match.yellowCards || 0) * 1.5;
  rating -= (match.redCards || 0) * 4.0;

  if (result === 'W') rating += 1.0;
  if (result === 'L') rating -= 1.0;

  const isCleanSheet = (pTeam === hTeam && match.awayScore === 0) || 
                       (pTeam === aTeam && match.homeScore === 0);
  
  if (position === 'GK' || position === 'DF') {
    if (isCleanSheet) rating += 1.5;
  } else if (position === 'FW' || position === 'ST' || position === 'ATT') {
    if ((match.goals || 0) === 0) rating -= 0.5;
  }

  return {
    result,
    rating: Math.max(1.0, Math.min(10.0, rating))
  };
}

// Cache for Roblox usernames
const usernameCache = new Map<string, { username: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache for Roblox IDs
const userIdCache = new Map<string, { userId: string; timestamp: number }>();

async function getRobloxUserId(username: string): Promise<string | null> {
  const cached = userIdCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.userId;
  }

  try {
    const response = await fetchWithTimeout('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      next: { revalidate: 3600 },
      timeout: 3000
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const userId = data.data[0].id.toString();
      userIdCache.set(username, { userId, timestamp: Date.now() });
      return userId;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Roblox userId:', error);
    return null;
  }
}

async function getRobloxUsername(userId: string): Promise<string | null> {
  const cached = usernameCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.username;
  }

  try {
    const response = await fetchWithTimeout(`https://users.roblox.com/v1/users/${userId}`, {
      next: { revalidate: 3600 },
      timeout: 3000
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const username = data.name;

    usernameCache.set(userId, { username, timestamp: Date.now() });
    return username;
  } catch (error) {
    console.error('Error fetching Roblox username:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  console.log(`[API] Fetching data for: ${username}`);

  let userId = 'unknown';
  let resolvedUsername = username;
  let currentClub = '---';
  let verified = false;
  let playerStats = {
    matches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0
  };
  let position = '---';
  let value = 0;
  let lastMatchNumber: number | undefined = undefined;
  let country: string | undefined = undefined;

  // Resolve userId if not numeric
  if (/^\d+$/.test(username)) {
    userId = username;
    const resolved = await getRobloxUsername(username);
    if (resolved) {
      resolvedUsername = resolved;
    }
  } else {
    const resolved = await getRobloxUserId(username);
    if (resolved) {
      userId = resolved;
    }
  }

  // Known players fallback for userId if still unknown
  const knownPlayers: { [username: string]: string } = {
    'Pako7u7lol': '4674039540',
    'MichaelAmeyaw': '261499483',
  };

  if (userId === 'unknown' && knownPlayers[username]) {
    userId = knownPlayers[username];
  }

  console.log(`[API] Resolved Identity: ${resolvedUsername} (${userId})`);

  // --- NEW: Fetch players-history.json once and find player data ---
  let historyData: any = null;
  let playerHistoryData: any = null;
  try {
    const historyResponse = await fetchWithTimeout(API_ENDPOINTS.PLAYERS_HISTORY, { timeout: 3000 });
    if (historyResponse.ok) {
      historyData = await historyResponse.json();
      if (historyData?.players) {
        // Resolve userId if unknown
        if (userId === 'unknown') {
          const playerEntry = Object.entries(historyData.players).find(([_, p]: [string, any]) => 
            p.name?.toLowerCase().trim() === resolvedUsername.toLowerCase().trim()
          );
          if (playerEntry) userId = playerEntry[0];
        }
        
        // Get player data from history
        playerHistoryData = historyData.players[userId];
        if (!playerHistoryData) {
          playerHistoryData = Object.values(historyData.players).find((p: any) => 
            p.name?.toLowerCase().trim() === resolvedUsername.toLowerCase().trim() ||
            p.robloxId?.toString() === userId
          );
        }
      }
    }
  } catch (e) {
    console.error('Error fetching/processing players-history.json:', e);
  }
  // -----------------------------------------------------------------

  // Fetch user clubs from Firebase
  let userClubs: Record<string, string> = {};
  try {
    userClubs = await getAllUserClubs();
  } catch (error) {
    console.error('Error fetching user clubs:', error);
  }

  // Find club from Firebase
  if (userId !== 'unknown') {
    const firebaseClub = userClubs[userId];
    if (firebaseClub) {
      // Find team by name or ID
      const team = teams.find(t => 
        t.name.toLowerCase() === firebaseClub.toLowerCase() || 
        t.id.toLowerCase() === firebaseClub.toLowerCase() ||
        (clubToFirebaseKey[t.id] && clubToFirebaseKey[t.id].toLowerCase() === firebaseClub.toLowerCase())
      );
      currentClub = team?.name || firebaseClub;
    }
  }

  // 1. Fetch from Firebase stats as baseline
  if (userId !== 'unknown') {
    try {
      const firebaseStats = await getPlayerStats(userId);
      if (firebaseStats) {
        playerStats = {
          matches: firebaseStats.matches || 0,
          goals: firebaseStats.goals || 0,
          assists: firebaseStats.assists || 0,
          yellowCards: firebaseStats.yellowCards || 0,
          redCards: firebaseStats.redCards || 0,
          cleanSheets: firebaseStats.cleanSheets || 0
        };
        position = firebaseStats.position || position;
        value = firebaseStats.value || value;
        lastMatchNumber = firebaseStats.number;
        verified = true;
      }
    } catch (error) {
      console.error('Error fetching player stats from Firebase:', error);
    }
  }

  // 2. Fetch stats from external API and merge/override
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.STATS, { timeout: 2000 });
    if (response.ok) {
      const data = await response.json();
      const playersData = Array.isArray(data) ? data : (data.players || []);
      if (Array.isArray(playersData)) {
        // Find player by username or userId
        const player = playersData.find((p: any) =>
          p.username?.toLowerCase() === resolvedUsername.toLowerCase() || 
          p.userId === userId || 
          p.robloxId?.toString() === userId ||
          p.name?.toLowerCase() === resolvedUsername.toLowerCase()
        );
        if (player) {
          userId = player.userId || player.robloxId?.toString() || userId;
          resolvedUsername = player.username || player.name || resolvedUsername;
          
          // Update position if stats has a better one
          if (player.position && player.position !== '---') {
            position = player.position;
          }
          
          if (player.value) value = player.value;
          
          // Use whichever source has higher numbers (assuming they are cumulative)
          playerStats = {
            matches: Math.max(playerStats.matches, player.matches || player.matchesPlayed || 0),
            goals: Math.max(playerStats.goals, player.goals || 0),
            assists: Math.max(playerStats.assists, player.assists || 0),
            yellowCards: Math.max(playerStats.yellowCards, player.yellowCards || 0),
            redCards: Math.max(playerStats.redCards, player.redCards || 0),
            cleanSheets: Math.max(playerStats.cleanSheets, player.cleanSheets || player.cs || 0)
          };
          verified = true;
          
          // Use club from stats if available
          if (player.team || player.teamId) {
             const team = teams.find(t => t.name === (player.team || player.teamId) || t.id === (player.team || player.teamId));
             currentClub = team?.name || player.team || player.teamId;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching external stats:', error);
  }

  // 3. Use pre-fetched players history data for stats aggregation
  if (playerHistoryData && playerHistoryData.matches) {
    try {
      const historyMatches = playerHistoryData.matches;
      
      // Update basic info from history if available
      if (playerHistoryData.country) country = playerHistoryData.country;
      if (playerHistoryData.position) {
        position = playerHistoryData.position;
      } else if (historyMatches.length > 0) {
        // Fallback to most recent match position if top-level is missing
        const lastMatchWithPos = [...historyMatches].reverse().find(m => m.position);
        if (lastMatchWithPos) position = lastMatchWithPos.position;
      }
      if (playerHistoryData.team && currentClub === '---') currentClub = playerHistoryData.team;

      // Aggregate stats from history matches
      const historyStats = historyMatches.reduce((acc: any, m: any) => {
        acc.matches++;
        acc.goals += (m.goals?.length || 0);
        acc.yellowCards += (m.cards?.filter((c: any) => c.type === 'yellow').length || 0);
        acc.redCards += (m.cards?.filter((c: any) => c.type === 'red').length || 0);
        acc.assists += (m.assists || 0);
        
        // Clean sheet calculation
        const pTeam = m.playerTeam || currentClub;
        const isHome = pTeam === m.teamA;
        const isAway = pTeam === m.teamB;
        if ((isHome && m.scoreB === 0) || (isAway && m.scoreA === 0)) {
          acc.cleanSheets++;
        }
        
        return acc;
      }, { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0 });

      // Merge with existing stats
      playerStats = {
        matches: Math.max(playerStats.matches, historyStats.matches),
        goals: Math.max(playerStats.goals, historyStats.goals),
        assists: Math.max(playerStats.assists, historyStats.assists),
        yellowCards: Math.max(playerStats.yellowCards, historyStats.yellowCards),
        redCards: Math.max(playerStats.redCards, historyStats.redCards),
        cleanSheets: Math.max(playerStats.cleanSheets, historyStats.cleanSheets)
      };

      // Update last match number from the most recent match in history
      if (historyMatches.length > 0) {
        const mostRecentMatch = historyMatches[historyMatches.length - 1];
        if (mostRecentMatch.number) lastMatchNumber = mostRecentMatch.number;
      }
    } catch (e) {
      console.error('Error processing players history stats:', e);
    }
  }

  let recentMatches: any[] = [];
  let previousClubs: string[] = [];
  try {
    // 1. Fetch history from Firebase
    const history = await getMatchHistory();
    const firebaseRecentMatches = history
      .filter((m: any) => {
        const isScorer = m.scorers?.some((s: any) => s.playerId?.toString() === userId || s.playerName?.toLowerCase() === resolvedUsername.toLowerCase());
        const inExtra = m.extraStats?.some((s: any) => s.playerId?.toString() === userId || s.playerName?.toLowerCase() === resolvedUsername.toLowerCase());
        const inLineup = m.lineup?.some((p: any) => p.playerId?.toString() === userId || p.playerName?.toLowerCase() === resolvedUsername.toLowerCase() || p.username?.toLowerCase() === resolvedUsername.toLowerCase());
        return isScorer || inExtra || inLineup;
      })
      .map((m: any) => {
        const playerMatchStats = m.scorers?.find((s: any) => s.playerId?.toString() === userId || s.playerName?.toLowerCase() === resolvedUsername.toLowerCase());
        const extraMatchStats = m.extraStats?.find((s: any) => s.playerId?.toString() === userId || s.playerName?.toLowerCase() === resolvedUsername.toLowerCase());
        const lineupMatchStats = m.lineup?.find((p: any) => p.playerId?.toString() === userId || p.playerName?.toLowerCase() === resolvedUsername.toLowerCase() || p.username?.toLowerCase() === resolvedUsername.toLowerCase());
        
        const goals = playerMatchStats?.goals || lineupMatchStats?.goals || 0;
        const assists = playerMatchStats?.assists || lineupMatchStats?.assists || 0;
        const yellowCards = extraMatchStats?.yellowCards || lineupMatchStats?.yellowCards || 0;
        const redCards = extraMatchStats?.redCards || lineupMatchStats?.redCards || 0;
        const playerTeam = playerMatchStats?.teamId || extraMatchStats?.teamId || lineupMatchStats?.teamId || lineupMatchStats?.team || currentClub;

        const { result, rating } = calculateRatingAndResult({
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          playerTeam,
          homeTeam: m.homeTeamId,
          awayTeam: m.awayTeamId,
          goals,
          assists,
          yellowCards,
          redCards
        }, extraMatchStats?.position || lineupMatchStats?.position || position);

        return {
          id: m.matchId || m.uuid || null,
          date: m.timestamp ? new Date(m.timestamp).toLocaleDateString('pl-PL') : '---',
          timestamp: m.timestamp ? new Date(m.timestamp).getTime() : 0,
          homeTeam: m.homeTeamId,
          awayTeam: m.awayTeamId,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          playerTeam,
          result,
          goals,
          assists,
          yellowCards: yellowCards,
          redCards: redCards,
          rating,
          minutes: extraMatchStats?.minutes || lineupMatchStats?.minutes || 0,
          role: extraMatchStats?.role || lineupMatchStats?.role || (extraMatchStats?.minutes > 70 ? 'starter' : 'sub'),
          league: m.league || 'LL'
        };
      });
    
    console.log(`[API] Firebase matches found: ${firebaseRecentMatches.length}`);

    // 2. Try to fetch from lineup API and merge/override
    try {
      const lineupResponse = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/match/lineup`, { timeout: 2000 });
      if (lineupResponse.ok) {
        const lineupData = await lineupResponse.json();
        const matchesWithPlayer = lineupData.filter((m: any) =>
          m.lineup?.some((p: any) => p.userId === userId || p.username?.toLowerCase() === resolvedUsername.toLowerCase())
        );

        const apiMatches = matchesWithPlayer.map((m: any) => {
          const playerStats = m.lineup.find((p: any) => p.userId === userId || p.username?.toLowerCase() === resolvedUsername.toLowerCase());
          const goals = playerStats.goals || 0;
          const assists = playerStats.assists || 0;
          const yellowCards = playerStats.yellowCards || 0;
          const redCards = playerStats.redCards || 0;
          const playerTeam = playerStats.team || currentClub;

          const { result, rating } = calculateRatingAndResult({
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            playerTeam,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            goals,
            assists,
            yellowCards,
            redCards
          }, playerStats.position || position);

          return {
            id: m.matchId || m.id || null,
            date: m.date || '---',
            timestamp: m.date ? parsePolishDate(m.date) : 0,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            playerTeam,
            result,
            goals,
            assists,
            yellowCards,
            redCards,
            rating,
            minutes: playerStats.minutes || 0,
            role: playerStats.role || (playerStats.minutes > 70 ? 'starter' : 'sub'),
            league: m.league || 'LL',
            number: playerStats.number
          };
        });

        recentMatches = [...apiMatches, ...firebaseRecentMatches];
      } else {
        recentMatches = firebaseRecentMatches;
      }
      console.log(`[API] After Lineup API: ${recentMatches.length} matches`);
    } catch (e) {
      recentMatches = firebaseRecentMatches;
    }

    // 3. Use pre-fetched players history data for recent matches list
    if (playerHistoryData && playerHistoryData.matches) {
      try {
        console.log(`[API] Players History JSON: Found ${playerHistoryData.matches.length} matches`);
        const historyJsonMatches = playerHistoryData.matches.map((m: any) => {
          const goals = m.goals?.length || 0;
          const yellowCards = m.cards?.filter((c: any) => c.type === 'yellow').length || 0;
          const redCards = m.cards?.filter((c: any) => c.type === 'red').length || 0;
          const playerTeam = m.playerTeam || currentClub;
          
          const { result, rating } = calculateRatingAndResult({
            homeScore: m.scoreA,
            awayScore: m.scoreB,
            playerTeam,
            homeTeam: m.teamA,
            awayTeam: m.teamB,
            goals,
            assists: 0,
            yellowCards,
            redCards
          }, m.position || position);

          // Calculate minutes
          const MATCH_DURATION = 90;
          let minutes = m.minutes;
          if (!minutes) {
            const start = m.role === 'starter' ? 0 : (m.substitutionIn ?? 0);
            const end = m.substitutionOut ?? MATCH_DURATION;
            minutes = Math.max(0, end - start);
          }

          return {
            id: m.matchUuid || null,
            date: m.playedAt ? new Date(m.playedAt).toLocaleDateString('pl-PL') : '---',
            homeTeam: m.teamA,
            awayTeam: m.teamB,
            homeScore: m.scoreA,
            awayScore: m.scoreB,
            playerTeam,
            result,
            goals,
            assists: 0,
            yellowCards,
            redCards,
            rating,
            minutes,
            role: m.role || (minutes > 10 ? 'starter' : 'sub'),
            jerseyNumber: m.number,
            league: 'LALIGA',
            timestamp: m.playedAt ? new Date(m.playedAt).getTime() : 0
          };
        });
        
        recentMatches = [...historyJsonMatches, ...recentMatches];
      } catch (e) {
        console.error('Error processing players history JSON for matches:', e);
      }
    }

    // Merge, unique and sort
    const uniqueMatchesMap = new Map();
    for (const match of recentMatches) {
      const uniqueId = match.id || `${match.date}-${match.homeTeam}-${match.awayTeam}-${match.homeScore}-${match.awayScore}`;
      if (!uniqueMatchesMap.has(uniqueId)) {
        uniqueMatchesMap.set(uniqueId, match);
      }
    }

    const parsePolishDate = (dateStr: string) => {
      if (!dateStr || dateStr === '---') return 0;
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        // DD.MM.YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
      }
      return new Date(dateStr).getTime() || 0;
    };

    recentMatches = Array.from(uniqueMatchesMap.values())
      .sort((a: any, b: any) => {
        const timeA = parsePolishDate(a.date);
        const timeB = parsePolishDate(b.date);
        return timeB - timeA;
      })
      .slice(0, 15); // Increased to 15

    // Calculate clean sheets and previous clubs from merged matches
    const clubsSet = new Set<string>();
    let csCount = 0;
    
    for (const m of recentMatches) {
      if (m.playerTeam && m.playerTeam !== '---') {
        const teamName = teams.find(t => t.id === m.playerTeam || t.name === m.playerTeam)?.id || m.playerTeam;
        clubsSet.add(teamName);
      }
      
      const isHome = m.playerTeam === m.homeTeam;
      const isAway = m.playerTeam === m.awayTeam;
      if ((isHome && m.awayScore === 0) || (isAway && m.homeScore === 0)) {
        csCount++;
      }
    }
    
    // Update clean sheets if it's higher than what we might have had
    playerStats.cleanSheets = Math.max(playerStats.cleanSheets || 0, csCount);
    
    // Track all clubs and their first appearance date
    const clubHistory: Array<{ id: string; name: string; joinedAt: string | null; timestamp: number }> = [];
    const processedClubs = new Set<string>();

    // Identify parent club strictly from the earliest match in players-history.json
    let parentClub: { name: string; joinedAt: string } | null = null;
    if (playerHistoryData?.matches?.length > 0) {
      // Find match with earliest playedAt
      const earliestMatch = [...playerHistoryData.matches].sort((a: any, b: any) => {
        const timeA = a.playedAt ? new Date(a.playedAt).getTime() : Infinity;
        const timeB = b.playedAt ? new Date(b.playedAt).getTime() : Infinity;
        return timeA - timeB;
      })[0];

      if (earliestMatch) {
        const team = teams.find(t => t.id === earliestMatch.playerTeam || t.name === earliestMatch.playerTeam);
        parentClub = {
          name: team?.name || earliestMatch.playerTeam || '---',
          joinedAt: earliestMatch.playedAt ? new Date(earliestMatch.playedAt).toLocaleDateString('pl-PL') : '---'
        };
      }
    }

    // Sort ALL available matches by date ascending to build club history
    const allKnownMatches = Array.from(uniqueMatchesMap.values()).sort((a: any, b: any) => {
      const timeA = a.timestamp || parsePolishDate(a.date);
      const timeB = b.timestamp || parsePolishDate(b.date);
      return timeA - timeB;
    });

    for (const m of allKnownMatches) {
      if (m.playerTeam && m.playerTeam !== '---') {
        const team = teams.find(t => t.id === m.playerTeam || t.name === m.playerTeam);
        const teamId = team?.id || m.playerTeam;
        const teamName = team?.name || m.playerTeam;

        if (!processedClubs.has(teamId)) {
          processedClubs.add(teamId);
          clubHistory.push({
            id: teamId,
            name: teamName,
            joinedAt: m.date,
            timestamp: parsePolishDate(m.date)
          });
        }
      }
    }

    // Sort clubHistory descending for transfers display (latest first)
    const currentClubId = teams.find(t => t.name === currentClub || t.id === currentClub)?.id || currentClub;
    
    // Previous clubs for the UI. Include parent club even if it is current.
    previousClubs = clubHistory
      .filter(c => c.id !== currentClubId || c.name === parentClub?.name)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(c => `${c.name}|${c.joinedAt}`); 

    console.log(`[API] Parent Club: ${JSON.stringify(parentClub)}`);
    console.log(`[API] Previous Clubs: ${previousClubs.length}`);

    // Calculate market value based on stats
    // Base 500k, +50k per match, +200k per goal, +100k per assist
    // PENALTIES: -150k per yellow card, -500k per red card
    const calculatedValue = Math.min(
      12000000, 
      Math.max(500000, 500000 + 
        (playerStats.matches * 50000) + 
        (playerStats.goals * 200000) + 
        (playerStats.assists * 100000) -
        (playerStats.yellowCards * 150000) -
        (playerStats.redCards * 500000)
      )
    );
    value = calculatedValue;

    return NextResponse.json({
      userId,
      username: resolvedUsername,
      avatarUrl: null, // Use RobloxAvatar component
      currentClub,
      position: mapPositionToPolish(position),
      value,
      lastMatchNumber,
      country,
      previousClubs,
      parentClub: parentClub ? { name: parentClub.name, joinedAt: parentClub.joinedAt } : null,
      verified,
      stats: playerStats,
      recentMatches
    });
  } catch (error) {
    console.error('Error in player API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
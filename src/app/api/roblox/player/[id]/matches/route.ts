import { NextRequest, NextResponse } from 'next/server';
import { teams } from '@/lib/data';
import { getMatchHistory, getAllUserClubs, getPlayerStats } from '@/lib/firebase';
import { REPLIT_API_BASE_URL, API_ENDPOINTS } from '@/lib/constants';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 0. Fetch user clubs and stats for identification
    const [userClubs, playerStats] = await Promise.all([
      getAllUserClubs(),
      getPlayerStats(id)
    ]);
    const playerCurrentClub = userClubs[id];
    const playerGeneralPosition = playerStats?.position || '---';

    // 1. Fetch history from Firebase
    const history = await getMatchHistory();
    const firebaseRecentMatches = history
      .filter((m: any) => {
        return m.scorers?.some((s: any) => s.playerId?.toString() === id) || 
               m.extraStats?.some((s: any) => s.playerId?.toString() === id);
      })
      .map((m: any) => {
        const playerMatchStats = m.scorers?.find((s: any) => s.playerId?.toString() === id);
        const extraMatchStats = m.extraStats?.find((s: any) => s.playerId?.toString() === id);
        
        const goals = playerMatchStats?.goals || 0;
        const assists = playerMatchStats?.assists || 0;
        const yellowCards = extraMatchStats?.yellowCards || 0;
        const redCards = extraMatchStats?.redCards || 0;
        const playerTeam = playerMatchStats?.teamId || extraMatchStats?.teamId || playerCurrentClub;

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
        }, extraMatchStats?.position || playerGeneralPosition);

        return {
          id: m.matchId || m.uuid || null,
          date: m.timestamp ? new Date(m.timestamp).toLocaleDateString('pl-PL') : '---',
          homeTeam: m.homeTeamId,
          awayTeam: m.awayTeamId,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          playerTeam,
          result,
          goals,
          assists,
          yellowCards,
          redCards,
          rating,
          minutes: extraMatchStats?.minute || extraMatchStats?.minutes || 0,
          role: extraMatchStats?.role || (extraMatchStats?.minutes > 70 ? 'starter' : 'sub'),
          league: m.league || 'LALIGA'
        };
      });

    // 2. Try to fetch from lineup API
    let apiMatches = [];
    try {
      const lineupResponse = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/match/lineup`, { timeout: 2000 });
      if (lineupResponse.ok) {
        const lineupData = await lineupResponse.json();
        const matchesWithPlayer = lineupData.filter((m: any) =>
          m.lineup?.some((p: any) => p.userId?.toString() === id)
        );

        apiMatches = matchesWithPlayer.map((m: any) => {
          const playerStats = m.lineup.find((p: any) => p.userId?.toString() === id);
          const goals = playerStats.goals || 0;
          const assists = playerStats.assists || 0;
          const yellowCards = playerStats.yellowCards || 0;
          const redCards = playerStats.redCards || 0;
          const playerTeam = playerStats.team || playerCurrentClub;

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
          }, playerStats.position || playerGeneralPosition);

          return {
            id: m.matchId || m.id || null,
            date: m.date || '---',
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
            minutes: playerStats.minute || playerStats.minutes || 0,
            role: playerStats.role || (playerStats.minutes > 70 ? 'starter' : 'sub'),
            league: m.league || 'LALIGA'
          };
        });
      }
    } catch (e) {
      console.error('Error fetching lineups:', e);
    }

    // 3. Try to fetch from players-history.json
    let historyJsonMatches = [];
    try {
      const historyResponse = await fetchWithTimeout(API_ENDPOINTS.PLAYERS_HISTORY, { timeout: 2000 });
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        let playerData = historyData.players?.[id];

        if (!playerData && historyData.players) {
          playerData = Object.values(historyData.players).find((p: any) => 
            p.name?.toLowerCase() === id.toLowerCase() ||
            p.robloxId?.toString() === id
          );
        }

        if (playerData && playerData.matches) {
          historyJsonMatches = playerData.matches.map((m: any) => {
            const goals = m.goals?.length || 0;
            const yellowCards = m.cards?.filter((c: any) => c.type === 'yellow').length || 0;
            const redCards = m.cards?.filter((c: any) => c.type === 'red').length || 0;
            const playerTeam = m.playerTeam || playerCurrentClub;
            
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
            }, m.position || playerGeneralPosition);

            // Calculate minutes (Roblox matches are usually ~15 mins, but goals happen later)
            const MATCH_DURATION = 90;
            let minutes = m.minute || m.minutes;
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
              league: 'LALIGA'
            };
          });
        }
      }
    } catch (e) {
      console.error('Error fetching players history JSON:', e);
    }

    // Merge and sort
    const allMatches = [...historyJsonMatches, ...apiMatches, ...firebaseRecentMatches];
    
    // Improved unique matches logic
    const uniqueMatchesMap = new Map();
    for (const match of allMatches) {
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

    const sortedMatches = Array.from(uniqueMatchesMap.values())
      .sort((a: any, b: any) => {
        const timeA = parsePolishDate(a.date);
        const timeB = parsePolishDate(b.date);
        return timeB - timeA;
      })
      .slice(0, 20);

    return NextResponse.json(sortedMatches);
  } catch (error) {
    console.error('Error in player matches API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

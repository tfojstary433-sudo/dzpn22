import { NextRequest, NextResponse } from 'next/server';
import { getAllUserClubs, getAllPlayerStats } from '@/lib/firebase';
import { teams, clubToFirebaseKey } from '@/lib/data';
import { API_ENDPOINTS } from '@/lib/constants';
import { fetchWithTimeout } from '@/lib/utils';

// Cache for players
let playersCache: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Cache for Roblox usernames
const usernameCache = new Map<string, { username: string; timestamp: number }>();
const USERNAME_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function getRobloxUsername(userId: string): Promise<string | null> {
  const cached = usernameCache.get(userId);
  if (cached && Date.now() - cached.timestamp < USERNAME_CACHE_DURATION) {
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

async function fetchAllPlayers(): Promise<any[]> {
  if (playersCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return playersCache;
  }

  try {
    // Fetch from Firebase users_clubs (keys are usernames)
    let data;
    let firebaseStats: Record<string, any> = {};
    try {
      [data, firebaseStats] = await Promise.all([
        getAllUserClubs(),
        getAllPlayerStats()
      ]);
      
      if (Object.keys(data).length === 0) {
        throw new Error('Firebase returned empty data');
      }
    } catch (firebaseError) {
      console.error('Firebase failed, using mock data:', firebaseError);
      // Use mock data if Firebase fails
      data = {
        'Pako7u7lol': 'Club 1',
        'MichaelAmeyaw': 'Club 2',
        'RandomPlayer': 'Club 9',
        'TestPlayer': 'Club 3',
        'AnotherPlayer': 'Club 4',
      };
    }

    const allPlayers: any[] = [];
    const playerMap = new Map<string, any>();

    // 1. Fetch from external stats API (has better username mapping)
    try {
      const statsResponse = await fetchWithTimeout(API_ENDPOINTS.STATS, { timeout: 3000 });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const playersData = Array.isArray(statsData) ? statsData : (statsData.players || []);
        if (Array.isArray(playersData)) {
          playersData.forEach((p: any) => {
            const username = p.username || p.name;
            if (username) {
              const team = teams.find(t => t.name === p.team || t.id === p.team || t.id === p.teamId);
              playerMap.set(username.toLowerCase(), {
                userId: p.userId || p.robloxId || 'unknown',
                username,
                clubId: team?.id || p.team || p.teamId || '---',
                clubName: team?.name || p.team || p.teamId || '---',
                position: p.position || '---',
                avatarUrl: null,
                verified: true,
                stats: {
                  goals: p.goals || 0,
                  assists: p.assists || 0,
                  matches: p.matches || p.matchesPlayed || 0
                }
              });
            }
          });
        }
      }
    } catch (statsError) {
      console.error('Stats API failed:', statsError);
    }

    // 2. Fetch from Firebase and merge/add
    // Data structure: { id: roleKey or clubName }
    const playerEntries = Object.entries(data);
    
    for (const [id, roleValue] of playerEntries) {
      const roleKey = typeof roleValue === 'string' ? roleValue : '---';
      const stats = firebaseStats[id] || {};
      
      // Try to find club
      const club = teams.find(t => 
        t.id === roleKey || 
        t.name === roleKey || 
        (clubToFirebaseKey[t.id] && clubToFirebaseKey[t.id] === roleKey)
      );

      // If id is numeric, it's a userId. If not, it's a username.
      if (/^\d+$/.test(id)) {
        // It's a userId. We might already have it from stats.
        const existingPlayer = Array.from(playerMap.values()).find(p => p.userId === id);
        if (existingPlayer) {
          if (club) {
            existingPlayer.clubId = club.id;
            existingPlayer.clubName = club.name;
          }
          if (stats.position && (!existingPlayer.position || existingPlayer.position === '---')) {
            existingPlayer.position = stats.position;
          }
          continue;
        }

        // For new UserIDs, we'd need to resolve username, but we'll do it lazily or skip for now to keep it fast
        // Let's add them with the ID as username if they aren't in stats
        playerMap.set(id, {
          userId: id,
          username: id, // Will show ID if username not known
          clubId: club?.id || roleKey,
          clubName: club?.name || roleKey,
          position: stats.position || '---',
          avatarUrl: null,
          verified: true,
          stats: { 
            goals: stats.goals || 0, 
            assists: stats.assists || 0, 
            matches: stats.matches || 0 
          }
        });
      } else {
        // It's a username
        const lowerName = id.toLowerCase();
        if (playerMap.has(lowerName)) {
          const p = playerMap.get(lowerName);
          if (club) {
            p.clubId = club.id;
            p.clubName = club.name;
          }
          if (stats.position && (!p.position || p.position === '---')) {
            p.position = stats.position;
          }
        } else {
          playerMap.set(lowerName, {
            userId: 'unknown',
            username: id,
            clubId: club?.id || roleKey,
            clubName: club?.name || roleKey,
            position: stats.position || '---',
            avatarUrl: null,
            verified: true,
            stats: { 
              goals: stats.goals || 0, 
              assists: stats.assists || 0, 
              matches: stats.matches || 0 
            }
          });
        }
      }
    }

    // 3. Fetch from players-history.json to get country and additional info
    try {
      const historyResponse = await fetchWithTimeout(API_ENDPOINTS.PLAYERS_HISTORY, { timeout: 3000 });
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.players) {
          Object.entries(historyData.players).forEach(([pId, p]: [string, any]) => {
            const username = p.name;
            if (username) {
              const lowerName = username.toLowerCase();
              const player = playerMap.get(lowerName) || playerMap.get(pId);
              
              if (player) {
                if (p.country) player.country = p.country;
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('History API failed in search:', e);
    }

    allPlayers.push(...Array.from(playerMap.values()));

    // 3. Resolve usernames for numeric IDs that are still numeric usernames (batch resolution)
    const playersToResolve = allPlayers.filter(p => p.username === p.userId && /^\d+$/.test(p.userId));
    if (playersToResolve.length > 0) {
      console.log(`Resolving ${playersToResolve.length} usernames from Roblox...`);
      const userIds = playersToResolve.map(p => parseInt(p.userId));
      
      // Roblox API supports up to 100 IDs per request
      for (let i = 0; i < userIds.length; i += 100) {
        const batch = userIds.slice(i, i + 100);
        try {
          const response = await fetchWithTimeout('https://users.roblox.com/v1/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: batch, excludeBannedUsers: false }),
            next: { revalidate: 3600 },
            timeout: 5000
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              data.data.forEach((user: any) => {
                const player = playersToResolve.find(p => p.userId === user.id.toString());
                if (player) {
                  player.username = user.name;
                  // Also update cache for other uses
                  usernameCache.set(user.id.toString(), { username: user.name, timestamp: Date.now() });
                }
              });
            }
          }
        } catch (error) {
          console.error('Error batch resolving usernames:', error);
        }
      }
    }

    playersCache = allPlayers;
    cacheTimestamp = Date.now();
    return allPlayers;
  } catch (error) {
    console.error('Error fetching players:', error);
    // Return mock data on error
    return [
      { userId: 'unknown', username: 'Pako7u7lol', clubId: 'ZAW', clubName: teams.find(t => t.id === 'ZAW')?.name || 'ZAW', position: '---', avatarUrl: null, verified: true, stats: { goals: 0, assists: 0, matches: 0 } },
      { userId: 'unknown', username: 'MichaelAmeyaw', clubId: 'ARK', clubName: teams.find(t => t.id === 'ARK')?.name || 'ARK', position: '---', avatarUrl: null, verified: true, stats: { goals: 0, assists: 0, matches: 0 } },
      { userId: 'unknown', username: 'TestPlayer', clubId: 'LEG', clubName: teams.find(t => t.id === 'LEG')?.name || 'LEG', position: '---', avatarUrl: null, verified: true, stats: { goals: 0, assists: 0, matches: 0 } },
      { userId: 'unknown', username: 'AnotherPlayer', clubId: 'LPO', clubName: teams.find(t => t.id === 'LPO')?.name || 'LPO', position: '---', avatarUrl: null, verified: true, stats: { goals: 0, assists: 0, matches: 0 } }
    ];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    console.log('Player search query:', query);

    const allPlayers = await fetchAllPlayers();
    console.log('Total players fetched:', allPlayers.length);
    const filteredPlayers = allPlayers
      .filter(player =>
        player.username.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10); // Increase limit to 10 results for better UX

    return NextResponse.json(filteredPlayers);
  } catch (error) {
    console.error('Error searching players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
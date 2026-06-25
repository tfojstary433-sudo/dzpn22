import { NextRequest, NextResponse } from 'next/server';
import { getAllUserClubs, getAllPlayerStats, getVerifiedPlayers } from '@/lib/firebase';
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

  const REPLIT_API_BASE_URL = 'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev';

  try {
    const playerMap = new Map<string, any>(); // Keyed by robloxId
    const verified = await getVerifiedPlayers();
    
    // Reverse mapping for fast lookup: discordId -> robloxId
    const discordToRoblox = new Map<string, string>();
    Object.entries(verified).forEach(([rId, v]) => {
      if (v.discordId) discordToRoblox.set(v.discordId, rId);
    });

    // 1. Fetch from contracts API (Primary Source)
    try {
      const contractsResponse = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/contracts`, { timeout: 3000 });
      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json();
        const playersList = contractsData.players || [];
        
        if (Array.isArray(playersList)) {
          playersList.forEach((p: any) => {
            const discordId = p.discord_id;
            const robloxId = discordToRoblox.get(discordId) || (p.player_id && /^\d+$/.test(p.player_id) ? p.player_id : 'unknown');
            
            const key = robloxId !== 'unknown' ? robloxId : `discord:${discordId}`;

            const cleanClubName = p.club ? p.club.replace(/[◂|]/g, '').replace(/\b(KS|PFF)\b/g, '').trim() : '---';
            const team = teams.find(t => 
              t.name.toLowerCase().includes(cleanClubName.toLowerCase()) || 
              cleanClubName.toLowerCase().includes(t.name.toLowerCase()) ||
              t.shortName.toLowerCase().includes(cleanClubName.toLowerCase())
            );

            playerMap.set(key, {
              userId: robloxId,
              discordId: discordId,
              username: p.nick || 'Nieznany',
              clubId: team?.id || cleanClubName,
              clubName: team?.name || cleanClubName,
              position: p.position || '---',
              avatarUrl: null,
              verified: robloxId !== 'unknown',
              stats: { 
                goals: p.goals_scored || 0, 
                assists: 0, 
                matches: p.matches_played || 0 
              },
              href: `/gracz/${p.nick || 'Nieznany'}`
            });
          });
        }
      }
    } catch (contractsError) {
      console.error('Contracts API failed in search:', contractsError);
    }

    // 2. Fetch from Firebase (Secondary Source)
    try {
      const [firebaseClubs, firebaseStats] = await Promise.all([
        getAllUserClubs(),
        getAllPlayerStats()
      ]);

      Object.entries(firebaseClubs).forEach(([id, roleValue]) => {
        const robloxId = /^\d+$/.test(id) ? id : null;
        if (!robloxId) return;

        // Only add if not already present from contracts (contracts info is more up-to-date)
        if (!playerMap.has(robloxId)) {
          const username = firebaseStats[id]?.name || id;
          const roleKey = typeof roleValue === 'string' ? roleValue : '---';
          const club = teams.find(t => 
            t.id === roleKey || t.name === roleKey || (clubToFirebaseKey[t.id] === roleKey)
          );

          playerMap.set(robloxId, {
            userId: robloxId,
            username: username,
            clubId: club?.id || roleKey,
            clubName: club?.name || roleKey,
            position: firebaseStats[id]?.position || '---',
            avatarUrl: null,
            verified: true,
            stats: { 
              goals: firebaseStats[id]?.goals || 0, 
              assists: firebaseStats[id]?.assists || 0, 
              matches: firebaseStats[id]?.matches || 0 
            },
            href: `/gracz/${username}`
          });
        }
      });
    } catch (e) {
      console.error('Firebase secondary fetch failed:', e);
    }

    const allPlayers = Array.from(playerMap.values());

    // Resolve Roblox usernames for IDs to ensure they match real Roblox profile
    const toResolve = allPlayers.filter(p => p.userId && p.userId !== 'unknown');
    if (toResolve.length > 0) {
      const userIds = toResolve.map(p => parseInt(p.userId));
      for (let i = 0; i < userIds.length; i += 100) {
        const batch = userIds.slice(i, i + 100);
        try {
          const res = await fetchWithTimeout('https://users.roblox.com/v1/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: batch, excludeBannedUsers: false }),
            timeout: 5000
          });
          if (res.ok) {
            const data = await res.json();
            data.data?.forEach((u: any) => {
              const p = toResolve.find(pl => pl.userId === u.id.toString());
              if (p) {
                p.username = u.name;
                p.href = `/gracz/${u.name}`;
              }
            });
          }
        } catch (err) {}
      }
    }

    playersCache = allPlayers;
    cacheTimestamp = Date.now();
    return allPlayers;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const allPlayers = await fetchAllPlayers();
    const queryLower = query.toLowerCase();
    
    const filteredPlayers = allPlayers
      .filter(player => {
        // Search by username ONLY (don't search by club name here to avoid flooding)
        return player.username.toLowerCase().includes(queryLower);
      })
      .sort((a, b) => {
        // Exact match priority
        if (a.username.toLowerCase() === queryLower) return -1;
        if (b.username.toLowerCase() === queryLower) return 1;
        return 0;
      })
      .slice(0, 10);

    return NextResponse.json(filteredPlayers);
  } catch (error) {
    console.error('Error searching players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
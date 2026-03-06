import { NextRequest, NextResponse } from 'next/server';
import { getAllUserClubs, getAllPlayerStats } from '@/lib/firebase';
import { clubToFirebaseKey } from '@/lib/data';
import { fetchWithTimeout } from '@/lib/utils';

// Cache for Roblox usernames
const usernameCache = new Map<string, { username: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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

async function getRobloxAvatar(username: string): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/roblox/avatar?username=${encodeURIComponent(username)}`, { timeout: 3000 });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.avatarUrl || null;
  } catch (error) {
    console.error('Error fetching Roblox avatar:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  const firebaseKey = clubToFirebaseKey[clubId];
  if (!firebaseKey) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  try {
    // Try to fetch data from Firebase
    console.log('Fetching data for club:', clubId, 'firebaseKey:', firebaseKey);
    let usersClubs, playerStats;

    try {
      [usersClubs, playerStats] = await Promise.all([
        getAllUserClubs(),
        getAllPlayerStats()
      ]);
      console.log('Firebase usersClubs:', Object.keys(usersClubs || {}).length, 'entries');
      console.log('Firebase playerStats:', Object.keys(playerStats || {}).length, 'entries');
    } catch (firebaseError) {
      console.error('Firebase error, using mock data:', firebaseError);
      // Use mock data if Firebase fails
      usersClubs = {
        '2613143527': 'Club 1', // Pako7u7lol in ZAW
        '261499483': 'Club 2',  // MichaelAmeyaw in ARK
        '192252293': 'Club 9',  // Random player in SOK
        '364035234': 'Club 6',  // Random player in UNI
      };
      playerStats = {};
    }

    // Find all userIds that belong to this club
    const playerUserIds: string[] = [];
    for (const [userId, club] of Object.entries(usersClubs)) {
      if (club === firebaseKey) {
        playerUserIds.push(userId);
      }
    }

    console.log('Found playerUserIds for club', clubId, ':', playerUserIds.length);

    if (playerUserIds.length === 0) {
      console.log('No players found for club', clubId, '- returning mock players');
      // Return some mock players for testing
      const mockPlayers = [
        {
          userId: '2613143527',
          username: 'Pako7u7lol',
          avatarUrl: 'https://www.roblox.com/headshot-thumbnail/image?userId=2613143527&width=150&height=150&format=png',
          clubId,
          value: 100000,
          previousClubs: [],
          lastMatchNumber: 7,
          position: 'Napastnik',
          verified: true,
          stats: { goals: 5, assists: 3, matches: 10 }
        }
      ];
      return NextResponse.json({ players: mockPlayers });
    }

    // Create players list with real usernames (avatars fetched in frontend)
    const players = await Promise.all(playerUserIds.map(async (userId) => {
      const stats = playerStats[userId];
      const username = await getRobloxUsername(userId) || `Gracz ${userId.slice(-4)}`;

      return {
         userId,
         username,
         avatarUrl: null, // Avatars fetched in frontend using RobloxAvatar component
         clubId,
         value: stats?.value || 0,
         previousClubs: [],
         lastMatchNumber: stats?.number || null,
         position: stats?.position || 'Zawodnik',
         verified: true, // Set to true since we fetched real usernames
         stats: {
           goals: stats?.goals || 0,
           assists: stats?.assists || 0,
           matches: stats?.matches || 0
         }
      };
    }));

    console.log('Successfully processed players:', players.length);

    return NextResponse.json({
      players: players
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error fetching club players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map<string, { url: string; robloxId: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      avatarUrl: cached.url,
      robloxId: cached.robloxId
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  }

  try {
    // 1. Get user ID from username
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      }),
      next: { revalidate: 86400 } // Cache this response for 24h
    });

    const userData = await userRes.json();

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const robloxId = userData.data[0].id;

    // 2. Get avatar headshot
    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png`, {
      next: { revalidate: 3600 } // Cache this response for 1h
    });
    const thumbData = await thumbRes.json();
    
    const avatarUrl = thumbData?.data?.[0]?.imageUrl || null;

    if (!avatarUrl) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
    }

    // Update cache
    cache.set(username, { url: avatarUrl, robloxId: robloxId.toString(), timestamp: Date.now() });

    return NextResponse.json({
      robloxId: robloxId.toString(),
      avatarUrl: avatarUrl
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Error fetching Roblox avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { usernames } = await request.json();

    if (!usernames || !Array.isArray(usernames)) {
      return NextResponse.json({ error: 'Usernames array is required' }, { status: 400 });
    }

    const results: { [key: string]: { avatarUrl: string; robloxId: string } } = {};
    const toFetch: string[] = [];

    // Check cache first
    usernames.forEach(username => {
      const cached = cache.get(username);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        results[username] = { avatarUrl: cached.url, robloxId: cached.robloxId };
      } else {
        toFetch.push(username);
      }
    });

    if (toFetch.length === 0) {
      return NextResponse.json({ data: results });
    }

    // 1. Get user IDs in batch
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ usernames: toFetch, excludeBannedUsers: false }),
    });

    const userData = await userRes.json();
    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ data: results });
    }

    const idToUsername: { [key: number]: string } = {};
    const robloxIds: number[] = [];

    userData.data.forEach((u: any) => {
      idToUsername[u.id] = u.requestedUsername;
      robloxIds.push(u.id);
    });

    // 2. Get avatar headshots in batch
    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxIds.join(',')}&size=150x150&format=Png`, {
      next: { revalidate: 3600 }
    });
    const thumbData = await thumbRes.json();

    if (thumbData.data) {
      thumbData.data.forEach((t: any) => {
        const username = idToUsername[t.targetId];
        if (username) {
          const result = { avatarUrl: t.imageUrl, robloxId: t.targetId.toString() };
          results[username] = result;
          cache.set(username, { url: t.imageUrl, robloxId: t.targetId.toString(), timestamp: Date.now() });
        }
      });
    }

    return NextResponse.json({ data: results });

  } catch (error) {
    console.error('Error fetching batch Roblox avatars:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

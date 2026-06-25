import { NextResponse } from 'next/server';

const CLIENT_ID = '8976718339232083701';
const CLIENT_SECRET = 'RBX-9Q7xxduyr0SyvmSDQWOIy0o8EkLsI-PlR2RpmXWieezkRxp3kO-FrQVLNU-F0Gsk';
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Upewniamy się, że redirectUri jest identyczny z tym wysłanym z frontendu
  const redirectUri = `${origin.replace(/\/$/, "")}/robloxcallback`;

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for token
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await fetch('https://apis.roblox.com/oauth/v1/token', {
      method: 'POST',
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Roblox token error:', tokenData);
      return NextResponse.json({ error: tokenData.error_description || 'Failed to exchange code' }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    return NextResponse.json({
        robloxId: userData.sub,
        robloxUsername: userData.preferred_username || userData.name
    });
  } catch (error) {
    console.error('Roblox Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

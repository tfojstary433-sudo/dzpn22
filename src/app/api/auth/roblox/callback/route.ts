import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin
function initFirebase() {
  if (!admin.apps.length) {
    try {
      const serviceAccountPath = path.join(process.cwd(), 'serviceaccount.json');
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://wlpn-roblox-default-rtdb.europe-west1.firebasedatabase.app/'
        });
      }
    } catch (e) {
      console.error('Firebase init error:', e);
    }
  }
  return admin.apps.length ? admin.database() : null;
}

const CLIENT_ID = process.env.ROBLOX_CLIENT_ID || '8976718339232083701';
const CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET || 'RBX-9Q7xxduyr0SyvmSDQWOIy71nItoqZJc3z1jNpuHSBitQCy3zb3XY6mSlB9zSbVpD';

export async function GET(request: Request) {
  const db = initFirebase();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // Pobieramy IP użytkownika (lepsze wykrywanie)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
  const ipKey = clientIp.trim().replace(/\./g, '_').replace(/:/g, '_');

  // Pobieramy origin z nagłówków dla lepszej kompatybilności z proxy (np. Vercel)
  const host = request.headers.get('host') || new URL(request.url).host;
  const protocol = request.headers.get('x-forwarded-proto') || (new URL(request.url).protocol.replace(':', ''));
  const origin = `${protocol}://${host}`;

  // Upewniamy się, że redirectUri jest identyczny z tym zarejestrowanym w Roblox
  const isLocalhost = host.includes('localhost');
  const redirectUri = isLocalhost 
    ? `http://${host}/robloxcallback` 
    : 'https://pff24.pl/robloxcallback';

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for token
    // Używamy najbardziej rygorystycznej metody autoryzacji (Basic Auth)
    const credentials = `${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
    
    const tokenResponse = await fetch('https://apis.roblox.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Roblox token error:', tokenData);
      // Zwracamy czytelny błąd dla użytkownika
      return NextResponse.json({ 
        error: `Błąd Robloxa: ${tokenData.error_description || tokenData.error}`,
        debug: {
          error: tokenData.error,
          description: tokenData.error_description
        }
      }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    const robloxId = userData.sub;

    // Sprawdzenie multikont po IP
    if (db) {
      const ipRef = db.ref('IP_Mappings').child(ipKey);
      const snapshot = await ipRef.once('value');
      const existingRobloxId = snapshot.val();

      if (existingRobloxId && String(existingRobloxId) !== String(robloxId)) {
        console.warn(`Blokada multikonta: IP ${ip} jest już przypisane do Roblox ID ${existingRobloxId}. Próba logowania z ${robloxId}.`);
        return NextResponse.json({ 
          error: 'Wykryto próbę logowania z multikonta. Twoje IP jest już powiązane z innym kontem Roblox.' 
        }, { status: 403 });
      }

      // Zapisujemy/Aktualizujemy mapowanie IP -> Roblox ID
      await ipRef.set(robloxId);
    }

    return NextResponse.json({
        robloxId: robloxId,
        robloxUsername: userData.preferred_username || userData.name
    });
  } catch (error) {
    console.error('Roblox Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

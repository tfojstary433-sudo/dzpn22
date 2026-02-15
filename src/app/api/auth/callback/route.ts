import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin
function initFirebase() {
  if (!admin.apps.length) {
    try {
      // Metoda 1: Zmienna środowiskowa (zalecana na Vercel)
      const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      if (serviceAccountVar) {
        const serviceAccount = JSON.parse(serviceAccountVar);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://wlpn-roblox-default-rtdb.europe-west1.firebasedatabase.app/'
        });
        console.log('Firebase initialized from ENV');
      } else {
        // Metoda 2: Plik (lokalnie)
        const serviceAccountPath = path.join(process.cwd(), 'serviceaccount.json');
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://wlpn-roblox-default-rtdb.europe-west1.firebasedatabase.app/'
          });
          console.log('Firebase initialized from FILE');
        }
      }
    } catch (e) {
      console.error('Firebase init error:', e);
    }
  }
  return admin.apps.length ? admin.database() : null;
}

function getData(fileName: string) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`Loaded ${fileName} with ${Object.keys(data).length} entries`);
      return data;
    } else {
      console.error(`${fileName} NOT FOUND at:`, filePath);
    }
  } catch (e) {
    console.error(`Error reading ${fileName}:`, e);
  }
  return {};
}

const CLIENT_ID = '1448788697653973082';
const CLIENT_SECRET = 'CiW1atPyupU5QO1H2Q2iYzw7hjEvarOW';
const GUILD_ID = '1447302326971793520';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function GET(request: Request) {
  const db = initFirebase();
  const clubsData = getData('clubs.json');
  const adminsData = getData('adminroles.json');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '';
  
  // Pobieramy IP użytkownika (lepsze wykrywanie)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
  const ipKey = clientIp.trim().replace(/\./g, '_').replace(/:/g, '_');

  console.log('Callback received. State:', state, 'IP:', clientIp);

  // Extract robloxId from state if provided (state=discord:ROBLOX_ID)
  let robloxId = '';
  if (state.startsWith('discord:')) {
    robloxId = state.split(':')[1];
    // Zabezpieczenie przed "undefined" jako stringiem
    if (robloxId === 'undefined' || robloxId === 'null') robloxId = '';
    console.log('Extracted Roblox ID:', robloxId);
  }
  
  // Pobieramy origin z nagłówków dla lepszej kompatybilności z proxy (np. Vercel)
  const host = request.headers.get('host') || new URL(request.url).host;
  const isLocalhost = host.includes('localhost');
  const redirectUri = isLocalhost 
    ? `http://${host}/callback` 
    : 'https://pff24.pl/callback';

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        scope: 'identify email guilds guilds.members.read',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Discord token error:', tokenData);
      return NextResponse.json({ error: tokenData.error_description || 'Failed to exchange code' }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: 'no-store'
    });

    const userData = await userResponse.json();
    const discordId = userData.id;

    // Bezwzględne sprawdzenie multikont po IP dla Discorda
    if (!db) {
      console.error('[CRITICAL] Firebase not initialized in Discord callback!');
      return NextResponse.json({ 
        error: 'Błąd systemowy: Brak połączenia z bazą weryfikacji IP.' 
      }, { status: 500 });
    }

    const discordIpRef = db.ref('IP_Mappings_Discord').child(ipKey);
    const snapshot = await discordIpRef.once('value');
    const existingDiscordId = snapshot.val();

    if (existingDiscordId && String(existingDiscordId) !== String(discordId)) {
      console.warn(`[BLOCK DISCORD] IP ${clientIp} already linked to Discord ${existingDiscordId}. Blocked ${discordId}.`);
      return NextResponse.json({ 
        error: '[PFF Blocker] Wykryto multikonto! To IP jest już powiązane z innym kontem Discord. Połączenie zostało przerwane ⚠️' 
      }, { status: 403 });
    }

    // Zapisujemy powiązanie IP -> Discord ID
    await discordIpRef.set(discordId);
    
    // Jeśli robloxId nie ma w state, spróbujmy go wyciągnąć z zapisanego profilu lub innych źródeł
    if (!robloxId) {
      console.log('Roblox ID not in state, checking Firebase for existing link...');
      try {
        if (!db) throw new Error('Baza danych Firebase nie została zainicjalizowana. Sprawdź serviceaccount.json.');
        
        const verifiedSnap = await db.ref('VerifiedPlayers').once('value');
        const allVerified = verifiedSnap.val() || {};
        const entry = Object.entries(allVerified).find(([_, data]: [any, any]) => data.discordId === userData.id);
        if (entry) {
          robloxId = entry[0];
          console.log('Found Roblox ID in Firebase:', robloxId);
        }
      } catch (e: any) {
        console.error('Error searching for Roblox ID:', e);
        return NextResponse.json({ error: `Błąd połączenia z Firebase: ${e.message}` }, { status: 500 });
      }
    }

    if (!robloxId) {
       console.error('ROBLOX ID NOT FOUND after all checks');
       return NextResponse.json({ error: 'Nie odnaleziono Twojego konta Roblox. Zaloguj się najpierw przez Roblox na stronie.' }, { status: 400 });
    }

    userData.robloxId = robloxId; // Include robloxId in response

    // Firebase Sync: VerifiedPlayers (independent of guild membership)
    try {
      if (!db) throw new Error('Firebase DB not initialized');
      
      console.log('Syncing VerifiedPlayers for:', robloxId);
      await db.ref('VerifiedPlayers').child(String(robloxId)).set({
        discordId: userData.id,
        discordUser: userData.discriminator && userData.discriminator !== '0' 
          ? `${userData.username}#${userData.discriminator}`
          : userData.username
      });
      console.log('VerifiedPlayers synced');
    } catch (firebaseError: any) {
      console.error('Firebase VerifiedPlayers sync error:', firebaseError);
      return NextResponse.json({ error: `Błąd zapisu w bazie danych: ${firebaseError.message}` }, { status: 500 });
    }

    // Get member info for roles and further sync
    try {
      const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        const roles = memberData.roles || [];
        userData.discordRoles = roles;
        userData.discordRoleNames = {}; 

        if (BOT_TOKEN) {
          try {
            const rolesResponse = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
              headers: { Authorization: `Bot ${BOT_TOKEN}` }
            });
            
            if (rolesResponse.ok) {
              const guildRoles = await rolesResponse.json();
              
              guildRoles.forEach((r: any) => {
                if (roles.includes(r.id)) {
                  userData.discordRoleNames[r.id] = r.name;
                }
              });

              if (robloxId && db) {
                try {
                  const robloxIdStr = String(robloxId);
                  console.log('Starting sync for RobloxID:', robloxIdStr);
                  console.log('User roles from Discord:', roles);
                  
                  // 2. Sync club role - direct matching by ID
                  const matchingClubRoleId = roles.find((id: string) => clubsData[id]);
                  
                  if (matchingClubRoleId) {
                    const clubId = clubsData[matchingClubRoleId];
                    console.log('MATCH FOUND! RoleID:', matchingClubRoleId, '-> Club:', clubId);
                    await db.ref('users_clubs').child(robloxIdStr).set(clubId);
                    console.log('Successfully saved to users_clubs');
                  } else {
                    console.log('No matching club role found in clubs.json for this user.');
                    await db.ref('users_clubs').child(robloxIdStr).remove();
                  }

                  // 3. Sync admin role
                  const userRoleNames = guildRoles
                    .filter((r: any) => roles.includes(r.id))
                    .map((r: any) => r.name);
                  
                  console.log('User role names:', userRoleNames);
                  const matchingAdminRoleName = userRoleNames.find((name: string) => adminsData[name]);
                  
                  if (matchingAdminRoleName) {
                    const adminRange = adminsData[matchingAdminRoleName];
                    console.log('ADMIN MATCH! Name:', matchingAdminRoleName, '-> Range:', adminRange);
                    await db.ref('Admins').child(robloxIdStr).set(adminRange);
                    console.log('Successfully saved to Admins');
                  } else {
                    console.log('No admin role found for this user.');
                    await db.ref('Admins').child(robloxIdStr).remove();
                  }
                } catch (firebaseError: any) {
                  console.error('CRITICAL Firebase sync error:', firebaseError);
                  return NextResponse.json({ error: `Błąd synchronizacji: ${firebaseError.message}` }, { status: 500 });
                }
              }
            }
          } catch (e) {
            console.error('Role name fetch error:', e);
          }
        }
      }
    } catch (roleError) {
      console.error('Error fetching guild roles:', roleError);
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

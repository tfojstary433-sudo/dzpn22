import { NextResponse } from 'next/server';
import { FIREBASE_BASE_URL } from '@/lib/constants';

// Helper to generate a random code
function generateRandomCode(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getFirebase(path: string) {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/${path}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error(`Firebase fetch error (${path}):`, e);
    return null;
  }
}

async function setFirebase(path: string, data: any) {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.error(`Firebase save error (${path}):`, e);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  // Get tokens from Firebase
  const balance = await getFirebase(`tokens/${userId}`) || 0;
  
  // For UI compatibility, we still return an object with items (even if empty now)
  return NextResponse.json({ balance, items: {} });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, amount, itemId, quantity, products } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (action === 'addTokens') {
      const { regular, bonus } = amount;
      const totalToAdd = (regular || 0) + (bonus || 0);
      
      // Get current balance
      const currentBalance = await getFirebase(`tokens/${userId}`) || 0;
      const newBalance = currentBalance + totalToAdd;
      
      // Save to Firebase
      await setFirebase(`tokens/${userId}`, newBalance);
      
      return NextResponse.json({ 
        success: true, 
        balance: newBalance 
      });
    } else if (action === 'grantProducts') {
      const productsToGrant = products || [];
      if (productsToGrant && Array.isArray(productsToGrant)) {
        for (const productId of productsToGrant) {
          const code = generateRandomCode();
          const normalizedId = productId.toLowerCase();
          
          if (normalizedId === 'unprzerwa') {
            // Save to UnPrzerwaCodes
            await setFirebase(`UnPrzerwaCodes/${code}`, true);
            console.log(`Generated UnPrzerwa code: ${code} for user ${userId}`);
          } else {
            // Save to other_codes
            await setFirebase(`other_codes/${code}`, true);
            console.log(`Generated other_code: ${code} (${productId}) for user ${userId}`);
          }
        }
      }
      return NextResponse.json({ success: true });
    } else if (action === 'removeTokens') {
      // Logic for internal shop purchases (deducting tokens)
      const currentBalance = await getFirebase(`tokens/${userId}`) || 0;
      if (currentBalance < amount) {
        return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });
      }
      
      const newBalance = currentBalance - amount;
      await setFirebase(`tokens/${userId}`, newBalance);
      
      // If items were bought with tokens, also generate codes for them
      const items = body.items || [];
      if (items.length > 0) {
        for (const item of items) {
          const q = item.quantity || 1;
          for (let i = 0; i < q; i++) {
            const code = generateRandomCode();
            const normalizedId = item.id.toLowerCase();
            
            if (normalizedId === 'unprzerwa') {
              await setFirebase(`UnPrzerwaCodes/${code}`, true);
            } else {
              await setFirebase(`other_codes/${code}`, true);
            }
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        balance: newBalance 
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'user_tokens.json');

function readData() {
  if (!fs.existsSync(DATA_PATH)) return { users: {}, purchases: [] };
  try {
    const content = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return { users: {}, purchases: [] };
  }
}

function saveData(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  const data = readData();
  const user = data.users[userId] || { balance: 0, bonusBalance: 0, items: {} };
  
  // Merge bonus and regular balance into one pool
  const totalBalance = user.balance + user.bonusBalance;

  return NextResponse.json({ balance: totalBalance, items: user.items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, amount, itemId, quantity } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const data = readData();
    if (!data.users[userId]) {
      data.users[userId] = { balance: 0, bonusBalance: 0, items: {} };
    }

    const user = data.users[userId];

    if (action === 'addTokens') {
      const { regular, bonus } = amount;
      user.balance += regular || 0;
      user.bonusBalance += bonus || 0;
      
      data.purchases.push({
        userId,
        type: 'token_purchase',
        amount: { regular, bonus },
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'purchase') {
      // Check if user has enough tokens
      const totalTokens = user.balance + user.bonusBalance;
      if (totalTokens < amount) {
        return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });
      }

      // Deduct tokens (use bonus first, then regular)
      let remaining = amount;
      if (user.bonusBalance >= remaining) {
        user.bonusBalance -= remaining;
        remaining = 0;
      } else {
        remaining -= user.bonusBalance;
        user.bonusBalance = 0;
        user.balance -= remaining;
      }

      // Add item to inventory
      if (!user.items[itemId]) {
        user.items[itemId] = 0;
      }
      user.items[itemId] += quantity || 1;

      data.purchases.push({
        userId,
        type: 'item_purchase',
        itemId,
        quantity,
        cost: amount,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'grantProducts') {
      const { products } = body;
      if (products && Array.isArray(products)) {
        products.forEach(productId => {
          if (!user.items[productId]) {
            user.items[productId] = 0;
          }
          user.items[productId] += 1;
        });
      }
    }

    saveData(data);
    const totalBalance = user.balance + user.bonusBalance;
    return NextResponse.json({ 
      success: true, 
      balance: totalBalance,
      items: user.items 
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'user_tokens.json');

function readTokenData() {
  if (!fs.existsSync(DATA_PATH)) return { users: {}, purchases: [] };
  try {
    const content = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return { users: {}, purchases: [] };
  }
}

function saveTokenData(data: any) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving token data:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const userId = session.metadata?.userId;
        const regularTokens = parseInt(session.metadata?.regularTokens || '0');
        const bonusTokens = parseInt(session.metadata?.bonusTokens || '0');
        const vipDays = parseInt(session.metadata?.vipDays || '0');
        const hasVip = session.metadata?.hasVip === 'true';
        const products = session.metadata?.products?.split(',').filter(p => p) || [];

        console.log('Payment successful:', {
          userId,
          regularTokens,
          bonusTokens,
          vipDays,
          hasVip,
          products,
          amount: session.amount_total,
        });

        if (userId) {
          const data = readTokenData();
          
          if (!data.users[userId]) {
            data.users[userId] = { balance: 0, bonusBalance: 0, items: {} };
          }

          const user = data.users[userId];

          // 1. Add tokens directly
          if (regularTokens > 0 || bonusTokens > 0) {
            user.balance += regularTokens;
            user.bonusBalance += bonusTokens;
            console.log(`✅ Added ${regularTokens} regular + ${bonusTokens} bonus tokens to user ${userId}`);
            console.log(`   New balance: ${user.balance} regular, ${user.bonusBalance} bonus`);
          }

          // 2. Handle products (UNBAN, etc.)
          if (products.length > 0) {
            products.forEach(productId => {
              if (!user.items[productId]) {
                user.items[productId] = 0;
              }
              user.items[productId] += 1;
            });
            console.log(`✅ Granted products to user ${userId}:`, products);
          }

          // 3. Log the purchase
          data.purchases.push({
            userId,
            type: 'stripe_payment',
            regularTokens,
            bonusTokens,
            products,
            amount: session.amount_total,
            timestamp: new Date().toISOString(),
            sessionId: session.id,
          });

          // Save all changes
          saveTokenData(data);
        }

        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
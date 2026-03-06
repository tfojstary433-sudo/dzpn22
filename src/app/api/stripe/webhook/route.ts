import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

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
          // 1. Activate VIP if needed
          if (hasVip && vipDays > 0) {
            console.log(`Activating VIP for user ${userId} for ${vipDays} days`);
            // TODO: Implement VIP activation logic in database
          }

          // 2. Add tokens if needed
          if (regularTokens > 0 || bonusTokens > 0) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  action: 'addTokens',
                  amount: {
                    regular: regularTokens,
                    bonus: bonusTokens
                  }
                })
              });

              if (response.ok) {
                console.log(`Added ${regularTokens} regular + ${bonusTokens} bonus tokens to user ${userId}`);
              } else {
                console.error('Failed to add tokens to user account');
              }
            } catch (error) {
              console.error('Error adding tokens:', error);
            }
          }

          // 3. Handle products (UNBAN, etc.)
          if (products.length > 0) {
            console.log(`Granting products to user ${userId}:`, products);
            try {
              // Mark products as owned in the user data
              await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  action: 'grantProducts',
                  products: products
                })
              });
            } catch (error) {
              console.error('Error granting products:', error);
            }
          }
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
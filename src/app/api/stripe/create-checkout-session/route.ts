import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any
    });

    const { userId, cart, customerEmail } = await request.json();

    if (!userId || !cart || !Array.isArray(cart)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const line_items = cart.map(item => {
      const img = item.logo || item.image;
      const product_data: any = {
        name: item.name,
        description: item.description || (item.regularTokens ? `${item.regularTokens} tokenów + ${item.bonusTokens} bonus` : ''),
      };
      
      if (img && typeof img === 'string' && img.startsWith('http')) {
        product_data.images = [img];
      }

      return {
        price_data: {
          currency: 'pln',
          product_data,
          unit_amount: Math.max(1, Math.round(Number(item.price) * 100)),
        },
        quantity: Number(item.quantity) || 1,
      };
    });

    // Aggregate metadata for fulfillment
    let totalRegular = 0;
    let totalBonus = 0;
    let totalVipDays = 0;
    let hasVip = false;
    const itemsList: string[] = [];

    cart.forEach(item => {
      const q = item.quantity || 1;
      if (item.type === 'tokens') {
        totalRegular += (item.regularTokens || 0) * q;
        totalBonus += (item.bonusTokens || 0) * q;
      } else if (item.type === 'vip') {
        totalVipDays += (item.days || 0) * q;
        hasVip = true;
      } else if (item.type === 'pln-product' || item.type === 'product') {
        // Even if it's a token product, if we are in Stripe session, it means it's part of a larger purchase
        for (let i = 0; i < q; i++) {
          itemsList.push(item.id);
        }
      }
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sklep/sukces?session_id={CHECKOUT_SESSION_ID}&type=cart`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sklep`,
      metadata: {
        userId: userId.toString(),
        regularTokens: totalRegular.toString(),
        bonusTokens: totalBonus.toString(),
        vipDays: totalVipDays.toString(),
        hasVip: hasVip.toString(),
        products: itemsList.join(','),
      },
      customer_email: customerEmail,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Sprawdzamy obie możliwe nazwy zmiennych środowiskowych
    const STRIPE_SK = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT;
    
    if (!STRIPE_SK) {
      return NextResponse.json(
        { error: 'Stripe configuration missing (Check STRIPE_SECRET_KEY or PAYMENT in Vercel)' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(STRIPE_SK, {
      apiVersion: '2025-02-24.acacia' as any
    });

    const { userId, cart, customerEmail } = await request.json();

    console.log('📥 Checkout request received:', {
      userId,
      cartCount: cart?.length,
      customerEmail,
    });

    if (!cart || !Array.isArray(cart)) {
      console.error('❌ Invalid cart:', cart);
      return NextResponse.json(
        { error: 'Missing or invalid cart' },
        { status: 400 }
      );
    }

    if (cart.length === 0) {
      console.error('❌ Empty cart');
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const line_items = cart.map((item, idx) => {
      const img = item.logo || item.image;
      const product_data: any = {
        name: item.name,
        description: item.description || (item.regularTokens ? `${item.regularTokens} tokenów + ${item.bonusTokens} bonus` : ''),
      };
      
      if (img && typeof img === 'string' && img.startsWith('http')) {
        product_data.images = [img];
      }

      const unitAmount = Math.max(1, Math.round(Number(item.price) * 100));
      const quantity = Number(item.quantity) || 1;

      console.log(`📦 Line item ${idx}:`, {
        name: item.name,
        price: item.price,
        unitAmount,
        quantity,
      });

      return {
        price_data: {
          currency: 'pln',
          product_data,
          unit_amount: unitAmount,
        },
        quantity,
      };
    });

    console.log('✅ Line items created:', line_items.length);

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
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'blik', 'p24'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sklep/sukces?session_id={CHECKOUT_SESSION_ID}&type=cart`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sklep`,
        metadata: {
          userId: userId ? userId.toString() : 'anonymous',
          regularTokens: totalRegular.toString(),
          bonusTokens: totalBonus.toString(),
          vipDays: totalVipDays.toString(),
          hasVip: hasVip.toString(),
          products: itemsList.join(','),
        },
        customer_email: customerEmail,
      });

      console.log('✅ Stripe session created:', {
        sessionId: session.id,
        url: session.url,
        totalAmount: session.amount_total,
      });

      if (!session.url) {
        console.error('❌ Session created but no URL returned:', session);
        return NextResponse.json(
          { error: 'Session created but checkout URL not available' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (stripeError: any) {
      console.error('❌ Stripe API Error:', {
        message: stripeError.message,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
        type: stripeError.type,
      });
      return NextResponse.json(
        { error: `Stripe error: ${stripeError.message || 'Unknown error'}` },
        { status: stripeError.statusCode || 500 }
      );
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
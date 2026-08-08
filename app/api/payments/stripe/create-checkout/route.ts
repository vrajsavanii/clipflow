import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_stripe_secret_key', {
  apiVersion: '2024-04-10' as any,
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  // 1. Authenticate the user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { priceId } = await req.json();
    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 });
    }

    // 2. Create the checkout session
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_stripesecret' || !process.env.STRIPE_SECRET_KEY) {
      // Mock Stripe checkout for development/testing without real keys
      console.log('Using dummy Stripe keys. Bypassing Stripe and auto-upgrading user...');
      const supabaseAdmin = await createClient();
      await supabaseAdmin.from('profiles').update({
        plan: 'pro',
        credits_limit: 1800,
      }).eq('id', session.user.id);
      
      return NextResponse.json({ url: `${req.nextUrl.origin}/dashboard?checkout=success` });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: `${req.nextUrl.origin}/pricing?checkout=cancel`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

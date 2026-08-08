import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_stripe_secret_key', {
  apiVersion: '2024-04-10' as any,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_stripe_webhook_secret';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !endpointSecret) {
    return new NextResponse('Webhook signature or secret missing', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Stripe webhook verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        if (userId) {
          // Upgrade user to Pro plan: 300 minutes, unlimited/high credits, 1 month expiry
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              plan: 'pro',
              minutes_limit: 300,
              credits_remaining: 9999,
              plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Error updating user plan on stripe checkout:', error);
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          // Downgrade user back to Free
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              plan: 'free',
              minutes_limit: 30,
              credits_remaining: 5,
              plan_expires_at: null
            })
            .eq('id', userId);

          if (error) {
            console.error('Error downgrading user plan on stripe cancellation:', error);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

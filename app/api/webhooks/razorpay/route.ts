import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  if (!signature || !secret) {
    return new NextResponse('Signature or Secret missing', { status: 400 });
  }

  // Verify signature validity
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.error('Razorpay signature verification failed');
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const payload = JSON.parse(body);
  const event = payload.event;

  try {
    switch (event) {
      case 'subscription.charged':
      case 'subscription.activated': {
        const subscription = payload.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          // Upgrade user to Pro plan
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
            console.error('Razorpay webhook DB update error:', error);
          }
        }
        break;
      }
      case 'subscription.cancelled':
      case 'subscription.halted': {
        const subscription = payload.payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (userId) {
          // Downgrade user back to Free tier
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
            console.error('Razorpay webhook DB downgrade error:', error);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

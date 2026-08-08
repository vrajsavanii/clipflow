import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_key_secret',
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  // 1. Authenticate user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { planId } = await req.json();
    if (!planId) {
      return new NextResponse('Plan ID is required', { status: 400 });
    }

    // 2. Create the subscription on Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 1 year of recurring billing
      notes: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error('Razorpay subscription error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase service role client to bypass RLS for quota updates/checks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
);

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  plan: string;
  minutesUsed: number;
  minutesLimit: number;
}

/**
 * Checks if a user has enough minutes/quota to process a video of the given duration.
 */
export async function checkUserQuota(userId: string, durationSec: number): Promise<QuotaCheckResult> {
  const durationMin = Math.ceil(durationSec / 60);

  // 1. Fetch user subscription/usage details
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('plan, minutes_used_this_month, minutes_limit, credits_remaining')
    .eq('id', userId)
    .single();

  if (error || !user) {
    // Default fallback or create new free tier user row
    const defaultLimit = 30; // 30 minutes for free tier
    
    // Attempt to upsert default user row if missing
    await supabaseAdmin.from('users').upsert({
      id: userId,
      plan: 'free',
      minutes_used_this_month: 0,
      minutes_limit: defaultLimit,
      credits_remaining: 5
    });

    return {
      allowed: durationMin <= defaultLimit,
      plan: 'free',
      minutesUsed: 0,
      minutesLimit: defaultLimit,
      reason: durationMin > defaultLimit ? 'Video duration exceeds free limit' : undefined
    };
  }

  const { plan, minutes_used_this_month, minutes_limit, credits_remaining } = user;

  // 2. Check if adding this video exceeds monthly limit
  if (minutes_used_this_month + durationMin > minutes_limit) {
    return {
      allowed: false,
      plan,
      minutesUsed: minutes_used_this_month,
      minutesLimit: minutes_limit,
      reason: `You have used ${minutes_used_this_month} of your ${minutes_limit} minutes. This video requires ${durationMin} minutes.`
    };
  }

  // 3. For Free tier, check if they have credits remaining
  if (plan === 'free' && credits_remaining <= 0) {
    return {
      allowed: false,
      plan,
      minutesUsed: minutes_used_this_month,
      minutesLimit: minutes_limit,
      reason: 'You have run out of free video download credits. Upgrade to Pro to get unlimited credits.'
    };
  }

  return {
    allowed: true,
    plan,
    minutesUsed: minutes_used_this_month,
    minutesLimit: minutes_limit
  };
}

/**
 * Consumes the quota minutes and credits for a processed video.
 */
export async function consumeUserQuota(userId: string, durationSec: number): Promise<boolean> {
  const durationMin = Math.ceil(durationSec / 60);

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('plan, minutes_used_this_month, credits_remaining')
    .eq('id', userId)
    .single();

  if (error || !user) return false;

  const updates: any = {
    minutes_used_this_month: user.minutes_used_this_month + durationMin
  };

  if (user.plan === 'free') {
    updates.credits_remaining = Math.max(0, user.credits_remaining - 1);
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId);

  return !updateError;
}

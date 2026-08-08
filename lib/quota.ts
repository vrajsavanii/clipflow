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
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', userId)
    .single();

  if (error || !user) {
    // Default fallback or create new free tier user row
    const defaultLimit = 120; // 120 minutes for free tier
    
    // Attempt to upsert default user row if missing
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      plan: 'starter',
      credits_used: 0,
      credits_limit: defaultLimit,
    });

    return {
      allowed: durationMin <= defaultLimit,
      plan: 'starter',
      minutesUsed: 0,
      minutesLimit: defaultLimit,
      reason: durationMin > defaultLimit ? 'Video duration exceeds free limit' : undefined
    };
  }

  const { plan, credits_used, credits_limit } = user;

  // 2. Check if adding this video exceeds monthly limit
  if (credits_used + durationMin > credits_limit) {
    return {
      allowed: false,
      plan,
      minutesUsed: credits_used,
      minutesLimit: credits_limit,
      reason: `You have used ${credits_used} of your ${credits_limit} minutes. This video requires ${durationMin} minutes.`
    };
  }

  return {
    allowed: true,
    plan,
    minutesUsed: credits_used,
    minutesLimit: credits_limit
  };
}

/**
 * Consumes the quota minutes and credits for a processed video.
 */
export async function consumeUserQuota(userId: string, durationSec: number): Promise<boolean> {
  const durationMin = Math.ceil(durationSec / 60);

  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('plan, credits_used')
    .eq('id', userId)
    .single();

  if (error || !user) return false;

  const updates: any = {
    credits_used: user.credits_used + durationMin
  };

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  return !updateError;
}

-- ============================================================
-- CLIPFLOW AI — COMPLETE SUPABASE SCHEMA MIGRATION
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Add missing columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stage_label TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency')),
  credits_used INT DEFAULT 0,
  credits_limit INT DEFAULT 120,
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_weekly BOOLEAN DEFAULT FALSE,
  notifications_marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create brand_kits table
CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  primary_font TEXT DEFAULT 'Inter',
  font_size INT DEFAULT 48,
  font_weight TEXT DEFAULT 'ExtraBold',
  text_color TEXT DEFAULT '#FFFFFF',
  highlight_color TEXT DEFAULT '#00FFFF',
  stroke_color TEXT DEFAULT '#000000',
  stroke_width INT DEFAULT 3,
  text_case TEXT DEFAULT 'uppercase',
  logo_url TEXT,
  logo_position TEXT DEFAULT 'top-right',
  logo_opacity FLOAT DEFAULT 0.9,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create user_integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  username TEXT,
  auto_publish BOOLEAN DEFAULT FALSE,
  default_hashtags TEXT[],
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- 5. Create worker_heartbeats table
CREATE TABLE IF NOT EXISTS worker_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'idle',
  current_job_id UUID,
  cpu_pct FLOAT DEFAULT 0,
  memory_mb FLOAT DEFAULT 0,
  jobs_completed_today INT DEFAULT 0,
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Enable RLS on brand_kits
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "brand_kits_own" ON brand_kits;
CREATE POLICY "brand_kits_own" ON brand_kits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Enable RLS on user_integrations
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "integrations_own" ON user_integrations;
CREATE POLICY "integrations_own" ON user_integrations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 10. Backfill profiles for existing users
INSERT INTO profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email,'@',1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 11. Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_clips_project_spark ON clips(project_id, spark_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status_type_created ON jobs(status, type, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_jobs_project ON jobs(project_id);

-- ============================================================
-- DONE! All tables, RLS, triggers, and indexes created.
-- ============================================================

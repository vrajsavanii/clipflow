const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

// Extract project ref from Supabase URL: https://xeumlhqpyueneqpkvefx.supabase.co
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

console.log(`Project Ref: ${PROJECT_REF}`);

async function runSQL(label, sql) {
  console.log(`\n[SQL] Running: ${label}...`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  if (res.ok) {
    console.log(`  [OK] ${label}`);
  } else {
    console.log(`  [ERR ${res.status}] ${text.substring(0, 300)}`);
  }
}

async function main() {
  console.log('======== CLIPFLOW SCHEMA MIGRATION v2 ========');

  await runSQL('Add stage_label + completed_at to jobs', `
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stage_label TEXT;
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
  `);

  await runSQL('Create profiles table', `
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
  `);

  await runSQL('Create brand_kits table', `
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
  `);

  await runSQL('Create user_integrations table', `
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
  `);

  await runSQL('Create worker_heartbeats table', `
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
  `);

  await runSQL('Enable RLS on profiles', `
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
    CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  `);

  await runSQL('Enable RLS on brand_kits', `
    ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "brand_kits_own" ON brand_kits;
    CREATE POLICY "brand_kits_own" ON brand_kits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  `);

  await runSQL('Enable RLS on user_integrations', `
    ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "integrations_own" ON user_integrations;
    CREATE POLICY "integrations_own" ON user_integrations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  `);

  await runSQL('Create auto-profile trigger on user signup', `
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
  `);

  await runSQL('Create performance indexes', `
    CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_clips_project_spark ON clips(project_id, spark_score DESC);
    CREATE INDEX IF NOT EXISTS idx_jobs_status_type_created ON jobs(status, type, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_jobs_project ON jobs(project_id);
  `);

  console.log('\n======== MIGRATION COMPLETE ========\n');
}

main().catch(console.error);

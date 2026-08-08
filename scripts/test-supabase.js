const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: projects, error: pErr } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Projects:", projects, pErr);

  const { data: jobs, error: jErr } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(10);
  console.log("Recent Jobs:", jobs, jErr);

  const { data: clips, error: cErr } = await supabase.from('clips').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Clips:", clips, cErr);

  const { data: users, error: uErr } = await supabase.from('users').select('*').limit(5);
  console.log("Users:", users, uErr);
}

main().catch(console.error);

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearSupabase() {
  console.log("=== CLEARING SUPABASE DATABASE TABLES ===");

  const { error: cErr } = await supabase.from('clips').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (cErr) console.error("Error clearing clips table:", cErr.message);
  else console.log("✓ Clips table cleared.");

  const { error: jErr } = await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (jErr) console.error("Error clearing jobs table:", jErr.message);
  else console.log("✓ Jobs table cleared.");

  const { error: pErr } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (pErr) console.error("Error clearing projects table:", pErr.message);
  else console.log("✓ Projects table cleared.");

  console.log("=== SUPABASE DATABASE CLEANUP COMPLETE ===");
}

clearSupabase().catch(console.error);

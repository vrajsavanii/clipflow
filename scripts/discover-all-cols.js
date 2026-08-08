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

async function discover() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: proj } = await supabase.from('projects').select('id, user_id').limit(1).single();

  const testObj = {
    user_id: proj.user_id,
    project_id: proj.id,
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    start_sec: 0,
    end_sec: 30,
    duration_sec: 30,
    status: 'pending',
    caption_style: 'neon_cyberpunk',
    aspect_ratio: '9:16'
  };

  const { data, error } = await supabase.from('clips').insert(testObj).select();
  console.log("Insert result error:", error);
  if (data && data[0]) {
    console.log("SUCCESS! EXACT CLIPS COLUMNS:", Object.keys(data[0]));
    await supabase.from('clips').delete().eq('id', data[0].id);
  }
}

discover();

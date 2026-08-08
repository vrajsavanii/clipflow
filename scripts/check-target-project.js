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

async function checkTarget() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const projectId = 'ec7e3daa-8777-4c2f-a9b7-35f5b0154d4b';
  
  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
  console.log("PROJECT STATUS:", project?.status);
  console.log("DURATION:", project?.duration_sec);
  console.log("TRANSCRIPT TEXT LENGTH:", project?.transcript_text?.length);
  console.log("TRANSCRIPT SAMPLE:", project?.transcript_text?.substring(0, 200));

  const { data: jobs } = await supabase.from('jobs').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
  console.log("PROJECT JOBS:", jobs);

  const { data: clips } = await supabase.from('clips').select('*').eq('project_id', projectId);
  console.log("PROJECT CLIPS:", clips);
}

checkTarget();

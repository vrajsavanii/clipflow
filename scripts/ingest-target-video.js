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

const targetUrl = 'https://youtu.be/zSkxqtTbEGU?si=FuOB1tCLC_76vCxz';

async function ingestTarget() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Get or create a test user
  let { data: user } = await supabase.from('users').select('*').limit(1).single();
  if (!user) {
    console.log("No user found in users table");
    return;
  }

  console.log(`[IngestScript] Target Video URL: ${targetUrl}`);
  console.log(`[IngestScript] User ID: ${user.id}`);

  // 2. Create project
  const { data: project, error: pError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      source_url: targetUrl,
      status: 'ingesting'
    })
    .select()
    .single();

  if (pError || !project) {
    console.error("Failed to create project:", pError);
    return;
  }

  console.log(`[IngestScript] Project created successfully! ID: ${project.id}`);

  // 3. Create ingest transcribe job
  const { data: job, error: jError } = await supabase
    .from('jobs')
    .insert({
      project_id: project.id,
      user_id: user.id,
      type: 'transcribe',
      status: 'queued'
    })
    .select()
    .single();

  if (jError || !job) {
    console.error("Failed to create job:", jError);
    return;
  }

  console.log(`[IngestScript] Transcribe job queued! Job ID: ${job.id}`);
  console.log(`\n>>> SUCCESS! Project ID: ${project.id} is now queued for worker engine processing.`);
}

ingestTarget();

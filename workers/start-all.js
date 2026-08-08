const { spawn }  = require('child_process');
const path        = require('path');
const fs          = require('fs');
const { createClient } = require('@supabase/supabase-js');

// ── load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const WORKER_ID = `hf-worker-${process.pid}`;
let supabase = null;
let jobsCompletedToday = 0;

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
} catch (e) {
  console.warn('[Orchestrator] Supabase heartbeat init failed (non-fatal)');
}

console.log('=================================================');
console.log('   CLIPFLOW WORKER ENGINE ORCHESTRATOR v2.0      ');
console.log('=================================================');
console.log(`Worker ID: ${WORKER_ID}`);

// ── heartbeat to Supabase worker_heartbeats table ────────────────────────────
async function sendHeartbeat(status = 'online', currentJobId = null) {
  if (!supabase) return;
  try {
    await supabase.from('worker_heartbeats').upsert({
      worker_id: WORKER_ID,
      status,
      current_job_id: currentJobId,
      cpu_pct: process.cpuUsage ? 0 : 0,
      memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      jobs_completed_today: jobsCompletedToday,
      last_heartbeat_at: new Date().toISOString()
    }, { onConflict: 'worker_id' });
  } catch (e) {
    // Non-fatal — worker_heartbeats table may not exist yet
  }
}

// Send heartbeat every 30 seconds
setInterval(() => sendHeartbeat('online'), 30000);
sendHeartbeat('online');

// ── start a worker subprocess with auto-restart ───────────────────────────────
function startWorker(name, scriptPath) {
  console.log(`[Orchestrator] Starting worker: ${name}...`);

  const child = spawn('npx', ['ts-node', scriptPath], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  child.on('exit', (code) => {
    console.warn(`[Orchestrator] Worker ${name} exited (code ${code}). Restarting in 5s…`);
    setTimeout(() => startWorker(name, scriptPath), 5000);
  });

  return child;
}

// ── graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n[Orchestrator] Received ${signal}. Sending offline heartbeat…`);
  await sendHeartbeat('offline');
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── launch all workers ────────────────────────────────────────────────────────
startWorker('transcribe', path.join(__dirname, 'transcribe.worker.ts'));
startWorker('analyze',    path.join(__dirname, 'analyze.worker.ts'));
startWorker('render',     path.join(__dirname, 'render.worker.ts'));

console.log('[Orchestrator] All workers started. Sending heartbeats every 30s.');

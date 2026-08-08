const { spawn } = require('child_process');
const path = require('path');

console.log("=================================================");
console.log("   CLIPFLOW WORKER ENGINE ORCHESTRATOR STARTING   ");
console.log("=================================================");

function startWorker(name, scriptPath) {
  console.log(`[MasterOrchestrator] Starting worker: ${name}...`);
  
  const child = spawn('npx', ['ts-node', scriptPath], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  child.on('exit', (code) => {
    console.warn(`[MasterOrchestrator] Worker ${name} exited with code ${code}. Restarting in 5 seconds...`);
    setTimeout(() => startWorker(name, scriptPath), 5000);
  });

  return child;
}

startWorker('transcribe', path.join(__dirname, 'transcribe.worker.ts'));
startWorker('analyze', path.join(__dirname, 'analyze.worker.ts'));
startWorker('render', path.join(__dirname, 'render.worker.ts'));

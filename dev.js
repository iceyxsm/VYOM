// Dev mode script for Windows compatibility
process.env.NODE_ENV = 'development';
const { exec } = require('child_process');

// Use npx electron instead of requiring it directly
const proc = exec('npx electron .', {
  env: { ...process.env, NODE_ENV: 'development' }
});

proc.stdout.pipe(process.stdout);
proc.stderr.pipe(process.stderr);

proc.on('close', (code) => {
  process.exit(code);
});


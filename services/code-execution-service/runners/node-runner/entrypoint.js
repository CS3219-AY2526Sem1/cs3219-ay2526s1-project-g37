#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

// Get environment variables
const codeB64 = process.env.CODE_B64 || '';
const stdinB64 = process.env.STDIN_B64 || '';
const timeout = parseInt(process.env.TIMEOUT || '10', 10) * 1000;

if (!codeB64) {
  console.error('ERROR: CODE_B64 environment variable not set');
  process.exit(1);
}

// Decode code and stdin
let code, stdinData;
try {
  code = Buffer.from(codeB64, 'base64').toString('utf-8');
  stdinData = stdinB64 ? Buffer.from(stdinB64, 'base64').toString('utf-8') : '';
} catch (e) {
  console.error(`ERROR: Failed to decode input: ${e.message}`);
  process.exit(1);
}

// Write code to temporary file
const tmpFile = '/tmp/code.js';
fs.writeFileSync(tmpFile, code);

// Execute with timeout
const child = exec(`node ${tmpFile}`, { timeout }, (error, stdout, stderr) => {
  // Output with markers so the controller can separate them
  console.log('===STDOUT_START===');
  if (stdout) {
    process.stdout.write(stdout);
  }
  console.log('===STDOUT_END===');
  
  console.log('===STDERR_START===');
  if (error) {
    if (error.killed) {
      console.log('Execution timed out');
      process.exit(124);
    } else {
      // Output the actual error details
      if (stderr) {
        process.stdout.write(stderr);
      } else {
        console.log(error.message);
      }
    }
  } else if (stderr) {
    // Even on success, if there's stderr, output it
    process.stdout.write(stderr);
  }
  console.log('===STDERR_END===');
  
  process.exit(error ? (error.code || 1) : 0);
});

// Provide stdin if available
if (stdinData) {
  child.stdin.write(stdinData);
  child.stdin.end();
}

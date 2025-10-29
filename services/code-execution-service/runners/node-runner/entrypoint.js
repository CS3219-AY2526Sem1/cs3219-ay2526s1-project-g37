#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  if (error) {
    if (error.killed) {
      console.error('Execution timed out');
      process.exit(124);
    } else {
      // Output the actual error details including stderr
      if (stderr) {
        process.stderr.write(stderr);
      } else {
        console.error(error.message);
      }
      process.exit(1);
    }
  }
  
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
});

// Provide stdin if available
if (stdinData) {
  child.stdin.write(stdinData);
  child.stdin.end();
}

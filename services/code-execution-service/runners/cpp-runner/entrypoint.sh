#!/bin/bash

# Get environment variables
CODE_B64="${CODE_B64:-}"
STDIN_B64="${STDIN_B64:-}"
TIMEOUT="${TIMEOUT:-10}"

if [ -z "$CODE_B64" ]; then
  echo "ERROR: CODE_B64 environment variable not set" >&2
  exit 1
fi

# Decode code and stdin
CODE=$(echo "$CODE_B64" | base64 -d)
STDIN_DATA=$(echo "$STDIN_B64" | base64 -d 2>/dev/null || echo "")

# Write code to file
echo "$CODE" > /tmp/code.cpp

# Compile and capture errors separately
timeout "$TIMEOUT" g++ -o /tmp/code /tmp/code.cpp > /tmp/compile_stdout.txt 2> /tmp/compile_stderr.txt
COMPILE_EXIT=$?

if [ $COMPILE_EXIT -ne 0 ]; then
  # Output compilation error with markers
  echo "===STDOUT_START==="
  echo ""
  echo "===STDOUT_END==="
  echo "===STDERR_START==="
  cat /tmp/compile_stderr.txt 2>/dev/null || echo "Compilation failed"
  echo "===STDERR_END==="
  exit 1
fi

# Execute with timeout, capturing stderr separately
echo "$STDIN_DATA" | timeout "$TIMEOUT" /tmp/code > /tmp/stdout.txt 2> /tmp/stderr.txt
EXIT_CODE=$?

# Output with markers so the controller can separate them
echo "===STDOUT_START==="
cat /tmp/stdout.txt 2>/dev/null || echo ""
echo "===STDOUT_END==="

echo "===STDERR_START==="
if [ $EXIT_CODE -eq 124 ]; then
  echo "Execution timed out"
elif [ $EXIT_CODE -ne 0 ]; then
  cat /tmp/stderr.txt 2>/dev/null || echo ""
fi
echo "===STDERR_END==="

exit $EXIT_CODE

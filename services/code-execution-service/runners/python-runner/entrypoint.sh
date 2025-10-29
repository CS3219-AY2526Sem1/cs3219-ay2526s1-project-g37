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
echo "$CODE" > /tmp/code.py

# Execute with timeout and capture output
EXEC_OUTPUT=$(echo "$STDIN_DATA" | timeout "$TIMEOUT" python3 /tmp/code.py 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "Execution timed out" >&2
  exit 124
elif [ $EXIT_CODE -ne 0 ]; then
  # Output the error details
  echo "$EXEC_OUTPUT" >&2
  exit $EXIT_CODE
else
  # Output successful result
  echo "$EXEC_OUTPUT"
  exit 0
fi

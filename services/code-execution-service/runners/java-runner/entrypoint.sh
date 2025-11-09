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
echo "$CODE" > /tmp/Solution.java

# Compile and capture errors
COMPILE_OUTPUT=$(timeout "$TIMEOUT" javac /tmp/Solution.java 2>&1)
COMPILE_EXIT=$?

if [ $COMPILE_EXIT -ne 0 ]; then
  echo "$COMPILE_OUTPUT" >&2
  exit 1
fi

# Execute with timeout (assumes class name is Solution)
cd /tmp
echo "$STDIN_DATA" | timeout "$TIMEOUT" java Solution
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "Execution timed out" >&2
fi

exit $EXIT_CODE

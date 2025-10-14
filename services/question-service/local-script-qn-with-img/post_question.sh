#!/bin/bash

# Directly build the JSON using jq, letting it handle file reading and encoding.
# --rawfile var_name path/to/file: Reads file content into a jq variable.
# --arg var_name value: Passes a simple string value into a jq variable.

JSON=$(jq -n \
  --arg name "FOR_TESTING Question with images" \
  --rawfile description /init-scripts/sample_qn.html \
  --arg difficulty "Easy" \
  --arg topic "FOR_TESTING" \
  '{
    name: $name,
    description: $description,
    difficulty: $difficulty,
    topic: $topic
  }'
)

# Check if jq succeeded
if [ $? -ne 0 ]; then
    echo "Error: jq failed to create the JSON payload."
    exit 1
fi

# Send the API request
curl -X POST http://question-service:8002/questions \
  -H "Content-Type: application/json" \
  -d "$JSON"

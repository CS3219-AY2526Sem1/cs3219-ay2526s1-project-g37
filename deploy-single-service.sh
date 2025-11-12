#!/bin/bash

# ===================================================================
# ECS Deployment Script for Single Service
# ===================================================================
# Usage: ./deploy-single-service.sh <service-name>
# Example: ./deploy-single-service.sh collaboration
# ===================================================================

set -e  # Exit on any error

# Windows compatibility: create aliases for .exe commands
if command -v aws.exe &> /dev/null; then
    aws() { aws.exe "$@"; }
    export -f aws
fi

if command -v docker.exe &> /dev/null; then
    docker() { docker.exe "$@"; }
    export -f docker
fi

# Find jq - check common locations
JQ_CMD=""
if command -v jq &> /dev/null; then
    JQ_CMD="jq"
elif command -v jq.exe &> /dev/null; then
    JQ_CMD="jq.exe"
else
    USERPROFILE_UNIX=$(echo "$USERPROFILE" | sed 's/\\/\//g' | sed 's/C:/\/mnt\/c/g')
    if [ -f "$USERPROFILE_UNIX/jq.exe" ]; then
        JQ_CMD="$USERPROFILE_UNIX/jq.exe"
    elif [ -f "/mnt/c/ProgramData/chocolatey/bin/jq.exe" ]; then
        JQ_CMD="/mnt/c/ProgramData/chocolatey/bin/jq.exe"
    fi
fi

if [ -z "$JQ_CMD" ]; then
    echo "Error: jq is required but not found."
    exit 1
fi

jq() { "$JQ_CMD" "$@"; }
export -f jq

# Configuration
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
ECS_CLUSTER_NAME="${ECS_CLUSTER_NAME:-peerprep-cluster}"
ENV_FILE="${ENV_FILE:-.env.prod}"

# Service configurations
declare -A SERVICES=(
    ["question"]="peerprep-question-service|peerprep-question-service-jc8mlx7a|peerprep-question|question-service|question-service:latest"
    ["user"]="peerprep-user-service|peerprep-user-service-7io9fm4w|peerprep-user|user-service|user-service:latest"
    ["frontend"]="peerprep-frontend|peerprep-frontend-service-q0vi9fg7|peerprep-frontend|peerprep-frontend|peerprep-frontend:latest"
    ["ywebsocket"]="peerprep-y-websocket-server|peerprep-ywebsocket-service-kgoh594z|peerprep-ywebsocket|y-websocket-server|alokinplc/y-websocket:latest"
    ["collaboration"]="peerprep-collaboration-service|peerprep-collaboration-service-3ass1arq|peerprep-collaboration|collaboration-service|collaboration-service:latest"
    ["matching"]="peerprep-matching-service|peerprep-matching-service-fm7d6s0v|peerprep-matching|matching-service|matching-service:latest"
    ["middleware"]="peerprep-middleware-service|peerprep-middleware-service-9c288i3p|peerprep-middleware|middleware-service|middleware-service:latest"
    ["codeexec"]="peerprep-code-exec-service|peerprep-code-exec-service-ynty60d8|peerprep-code-exec|code-exec-service|code-exec-service:latest"
)

SERVICE_NAME="${1}"

if [ -z "$SERVICE_NAME" ]; then
    echo "Error: Service name required"
    echo "Usage: $0 <service-name>"
    echo "Available services: ${!SERVICES[@]}"
    exit 1
fi

CONFIG=${SERVICES[$SERVICE_NAME]}
if [ -z "$CONFIG" ]; then
    echo "Error: Unknown service '$SERVICE_NAME'"
    echo "Available services: ${!SERVICES[@]}"
    exit 1
fi

IFS='|' read -r ECR_REPO ECS_SERVICE TASK_FAMILY CONTAINER_NAME LOCAL_IMAGE <<< "$CONFIG"

echo ""
echo "=================================================="
echo "Deploying: $SERVICE_NAME"
echo "=================================================="
echo ""

# Get AWS Account ID
echo "Getting AWS Account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text | tr -d '\r')
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI
echo "✓ Logged in to ECR"
echo ""

# Build image
echo "Building Docker image for $SERVICE_NAME..."
docker compose --profile prod --env-file $ENV_FILE build
echo "✓ Built image"
echo ""

IMAGE_NAME="$ECR_URI/$ECR_REPO:latest"

# Tag image
echo "Tagging image..."
docker tag $LOCAL_IMAGE $IMAGE_NAME
echo "✓ Tagged: $IMAGE_NAME"
echo ""

# Push to ECR
echo "Pushing to ECR..."
docker push $IMAGE_NAME
echo "✓ Pushed to ECR"
echo ""

# Update Task Definition
echo "Creating new task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition \
    --task-definition $TASK_FAMILY \
    --region $AWS_REGION \
    --query 'taskDefinition')

NEW_TASK_DEF=$(echo $TASK_DEFINITION | jq --arg IMAGE "$IMAGE_NAME" --arg CONTAINER "$CONTAINER_NAME" '
{
    family: .family,
    networkMode: .networkMode,
    containerDefinitions: [
        .containerDefinitions[] | 
        if .name == $CONTAINER then
            .image = $IMAGE
        else
            .
        end
    ],
    requiresCompatibilities: .requiresCompatibilities,
    cpu: .cpu,
    memory: .memory
} + 
(if .taskRoleArn != null then {taskRoleArn: .taskRoleArn} else {} end) +
(if .executionRoleArn != null then {executionRoleArn: .executionRoleArn} else {} end) +
(if .volumes != null and (.volumes | length) > 0 then {volumes: .volumes} else {} end) +
(if .placementConstraints != null and (.placementConstraints | length) > 0 then {placementConstraints: .placementConstraints} else {} end) +
(if .runtimePlatform != null then {runtimePlatform: .runtimePlatform} else {} end)')

echo "$NEW_TASK_DEF" > temp-task-def-$SERVICE_NAME.json

NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json file://temp-task-def-$SERVICE_NAME.json \
    --region $AWS_REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text | tr -d '\r')

if [ -z "$NEW_TASK_DEF_ARN" ] || [ "$NEW_TASK_DEF_ARN" = "None" ]; then
    echo "Error: Failed to register task definition"
    cat temp-task-def-$SERVICE_NAME.json
    rm temp-task-def-$SERVICE_NAME.json
    exit 1
fi

rm temp-task-def-$SERVICE_NAME.json
echo "✓ Task Definition: $NEW_TASK_DEF_ARN"
echo ""

# Update ECS Service
echo "Updating ECS service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER_NAME \
    --service $ECS_SERVICE \
    --task-definition $NEW_TASK_DEF_ARN \
    --force-new-deployment \
    --region $AWS_REGION \
    --output json > /dev/null

echo "✓ Service updated"
echo ""
echo "=================================================="
echo "✅ $SERVICE_NAME deployed successfully!"
echo "=================================================="
echo ""

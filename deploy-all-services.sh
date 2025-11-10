#!/bin/bash
# Written in assistance with ai
# ===================================================================
# ECS Deployment Script for All Services
# ===================================================================
# This script builds ALL Docker images once, then pushes to ECR 
# and updates ECS for all services
# Usage: ./deploy-all-services.sh
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
    # Try to find jq.exe in user profile (convert Windows path to bash path)
    USERPROFILE_UNIX=$(echo "$USERPROFILE" | sed 's/\\/\//g' | sed 's/C:/\/mnt\/c/g')
    if [ -f "$USERPROFILE_UNIX/jq.exe" ]; then
        JQ_CMD="$USERPROFILE_UNIX/jq.exe"
    elif [ -f "/mnt/c/ProgramData/chocolatey/bin/jq.exe" ]; then
        JQ_CMD="/mnt/c/ProgramData/chocolatey/bin/jq.exe"
    fi
fi

if [ -z "$JQ_CMD" ]; then
    echo "Error: jq is required but not found."
    echo "Please install jq from https://jqlang.github.io/jq/download/"
    exit 1
fi

# Create jq alias
jq() { "$JQ_CMD" "$@"; }
export -f jq

# Configuration
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
ECS_CLUSTER_NAME="${ECS_CLUSTER_NAME:-peerprep-cluster}"
ENV_FILE="${ENV_FILE:-.env.prod}"

# Service configurations: name, ecr-repo, ecs-service, task-family, container-name, local-image
declare -A SERVICES=(
    ["question"]="peerprep-question-service|peerprep-question-service-jc8mlx7a|peerprep-question|question-service|question-service:latest"
    ["user"]="peerprep-user-service|peerprep-user-service-7io9fm4w|peerprep-user|user-service|user-service:latest"
    ["frontend"]="peerprep-frontend|peerprep-frontend-service-q0vi9fg7|peerprep-frontend|peerprep-frontend|peerprep-frontend:latest"
    ["ywebsocket"]="peerprep-y-websocket-server|peerprep-ywebsocket-service-kgoh594z|peerprep-ywebsocket|y-websocket-server|alokinplc/y-websocket:latest"
    ["collaboration"]="peerprep-collaboration-service|peerprep-collaboration-service-3ass1arq|peerprep-collaboration|collaboration-service|collaboration-service:latest"
    ["matching"]="peerprep-matching-service|peerprep-matching-service-fm7d6s0v|peerprep-matching|matching-service|matching-service:latest"
    ["middleware"]="peerprep-middleware-service|peerprep-middleware-service-9c288i3p|peerprep-middleware|middleware-service|middleware-service:latest"
)

# Get AWS Account ID (do this once at the start)
echo ""
echo "=================================================="
echo "Getting AWS credentials..."
echo "=================================================="
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text | tr -d '\r')
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

# Login to ECR (do this once at the start)
echo "=================================================="
echo "Logging in to ECR..."
echo "=================================================="
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI
echo "Successfully logged in to ECR"
echo ""

# Build all images once
echo "=================================================="
echo "Building ALL Docker images..."
echo "=================================================="
docker compose --profile prod --env-file $ENV_FILE build
echo "Successfully built all images"
echo ""

# ===================================================================
# Helper function to push and deploy a single service
# ===================================================================
deploy_service() {
    local SERVICE_NAME=$1
    local CONFIG=${SERVICES[$SERVICE_NAME]}
    
    if [ -z "$CONFIG" ]; then
        echo "Error: Unknown service '$SERVICE_NAME'"
        echo "Available services: ${!SERVICES[@]}"
        return 1
    fi
    
    IFS='|' read -r ECR_REPO ECS_SERVICE TASK_FAMILY CONTAINER_NAME LOCAL_IMAGE <<< "$CONFIG"
    
    echo ""
    echo "=================================================="
    echo "Pushing & Deploying: $SERVICE_NAME"
    echo "=================================================="
    
    IMAGE_NAME="$ECR_URI/$ECR_REPO:latest"
    
    # Tag Docker Image
    echo "[1/4] Tagging image for ECR..."
    docker tag $LOCAL_IMAGE $IMAGE_NAME
    echo "✓ Tagged: $IMAGE_NAME"
    echo ""
    
    # Push Image to ECR
    echo "[2/4] Pushing image to ECR..."
    docker push $IMAGE_NAME
    echo "✓ Pushed to ECR"
    echo ""
    
    # Update Task Definition
    echo "[3/4] Creating new task definition revision..."
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
    echo "Registering new task definition..."
    
    NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
        --cli-input-json file://temp-task-def-$SERVICE_NAME.json \
        --region $AWS_REGION \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text | tr -d '\r')
    
    if [ -z "$NEW_TASK_DEF_ARN" ] || [ "$NEW_TASK_DEF_ARN" = "None" ]; then
        echo "Error: Failed to register task definition"
        cat temp-task-def-$SERVICE_NAME.json
        rm temp-task-def-$SERVICE_NAME.json
        return 1
    fi
    
    rm temp-task-def-$SERVICE_NAME.json
    
    echo "✓ New Task Definition: $NEW_TASK_DEF_ARN"
    echo ""
    
    # Update ECS Service
    echo "[4/4] Updating ECS service..."
    aws ecs update-service \
        --cluster $ECS_CLUSTER_NAME \
        --service $ECS_SERVICE \
        --task-definition $NEW_TASK_DEF_ARN \
        --force-new-deployment \
        --region $AWS_REGION \
        --output json > /dev/null
    
    echo "✓ ECS service updated"
    echo ""
    
    echo "✅ $SERVICE_NAME deployment complete!"
    echo ""
}

# ===================================================================
# Main execution - Deploy all services
# ===================================================================

for SERVICE_NAME in "${!SERVICES[@]}"; do
    deploy_service "$SERVICE_NAME"
done

echo "=================================================="
echo "🎉 All Services Deployed Successfully!"
echo "=================================================="

echo ""
echo "Monitor deployment progress with:"
echo "aws ecs describe-services --cluster $ECS_CLUSTER_NAME --region $AWS_REGION --query 'services[*].[serviceName,deployments[0].status]'"
echo ""

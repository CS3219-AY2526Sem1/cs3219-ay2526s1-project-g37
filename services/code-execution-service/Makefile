# Makefile for Code Execution Service (Development Environment)

.PHONY: help build-push-runners create-ecr-repos

# Variables
ECR_REGISTRY ?= 742705053940.dkr.ecr.ap-southeast-1.amazonaws.com
ECR_REPO_NAMESPACE ?= peerprep-code-exec-runners-dev
AWS_REGION ?= ap-southeast-1
AWS_PROFILE ?= peerprep
GIT_SHA := $(shell git rev-parse --short HEAD)
IMAGE_TAG ?= $(GIT_SHA)
NAMESPACE ?= runner-dev

RUNNERS = python node cpp java

help:
	@echo "Code Execution Service - Development Environment"
	@echo "Available targets:"
	@echo "  build-push-runners  - Build and push runner images to ECR"
	@echo "  create-ecr-repos    - Create ECR repositories"

login-ecr:
	@echo "Logging in to ECR ($(ECR_REGISTRY))..."
	@aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(ECR_REGISTRY)

build-push-runners: login-ecr
	@echo "Building and pushing AMD64 images for EKS cluster..."
	@for runner in $(RUNNERS); do \
		echo "--- Building/Pushing $$runner (platform: linux/amd64) ---"; \
		docker buildx build \
			--platform linux/amd64 \
			-t $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/$$runner:$(IMAGE_TAG) \
			-t $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/$$runner:latest \
			./runners/$$runner-runner \
			--push; \
	done

# ECR repository management
create-ecr-repos:
	@echo "Creating ECR repositories with namespace $(ECR_REPO_NAMESPACE)..."
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/python || true
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/node || true
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/cpp || true
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/java || true
	@echo "✅ ECR repositories created"

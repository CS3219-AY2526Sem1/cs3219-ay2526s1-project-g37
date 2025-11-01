# Makefile for Code Execution Service (Development Environment)

.PHONY: help build-runners push-runners setup-k8s test clean run-controller create-ecr-repos test-integration test-setup

# Variables
ECR_REGISTRY ?= 742705053940.dkr.ecr.ap-southeast-1.amazonaws.com
ECR_REPO_NAMESPACE ?= peerprep-code-exec-runners-dev
AWS_REGION ?= ap-southeast-1
AWS_PROFILE ?= peerprep
GIT_SHA := $(shell git rev-parse --short HEAD)
IMAGE_TAG ?= $(GIT_SHA)
NAMESPACE ?= runner-dev

help:
	@echo "Code Execution Service - Development Environment"
	@echo "Available targets:"
	@echo "  build-runners       - Build all runner Docker images"
	@echo "  push-runners        - Push runner images to ECR"
	@echo "  create-ecr-repos   - Create ECR repositories"

build-runners:
	@echo "Building runner images for dev environment..."
	docker build -t $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/python:$(IMAGE_TAG) ./runners/python-runner
	docker build -t $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/node:$(IMAGE_TAG) ./runners/node-runner
	docker build -t $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/cpp:$(IMAGE_TAG) ./runners/cpp-runner
	docker build -t $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/java:$(IMAGE_TAG) ./runners/java-runner
	
	docker tag $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/python:$(IMAGE_TAG) $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/python:latest
	docker tag $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/node:$(IMAGE_TAG) $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/node:latest
	docker tag $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/cpp:$(IMAGE_TAG) $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/cpp:latest
	docker tag $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/java:$(IMAGE_TAG) $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/java:latest

push-runners: build-runners
	@echo "Pushing runner images to ECR ($(AWS_REGION))..."
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(ECR_REGISTRY)
	
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/python:$(IMAGE_TAG)
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/python:latest
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/node:$(IMAGE_TAG)
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/node:latest
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/cpp:$(IMAGE_TAG)
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/cpp:latest
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/java:$(IMAGE_TAG)
	docker push $(ECR_REGISTRY)/$(ECR_REPO_NAMESPACE)/java:latest

# ECR repository management
create-ecr-repos:
	@echo "Creating ECR repositories with namespace $(ECR_REPO_NAMESPACE)..."
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/python || true
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/node || true
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/cpp || true
	aws ecr create-repository --region $(AWS_REGION) --profile $(AWS_PROFILE) --repository-name $(ECR_REPO_NAMESPACE)/java || true
	@echo "✅ ECR repositories created"

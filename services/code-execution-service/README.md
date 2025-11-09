# Code Execution Microservice

A scalable, secure code execution service that runs untrusted code in isolated Kubernetes Jobs. Supports Python, JavaScript (Node.js), C++, and Java.

## 🏗️ Architecture

```
             ┌────────────────────────────────────────────────┐
             │               External Clients                 │
             │            (Frontend, API Gateway)             │
             └──────────────────────┬─────────────────────────┘
                                    │ HTTP/REST
                                    ▼
             ┌────────────────────────────────────────────────┐
             │      Code Execution Controller                 │
             │        (FastAPI Application)                   │
             │                                                │
             │  - Receives execution requests                 │
             │  - Creates Kubernetes Jobs                     │
             │  - Monitors job completion                     │
             │  - Returns stdout/stderr                       │
             │  - Cleans up completed jobs                    │
             └──────────────────────┬─────────────────────────┘
                                    │ Creates Jobs     
                                    ▼      
┌──────────────────────────────────────────────────────────────────────┐
│                           AWS EKS Cluster                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    runner-dev / runner-prod                    │  │
│  │                          (Namespace)                           │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │                Kubernetes Jobs (ephemeral)               │  │  │
│  │  │                                                          │  │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │  │
│  │  │  │  Python  │  │   Node   │  │   C++    │  │   Java   │  │  │  │
│  │  │  │  Runner  │  │  Runner  │  │  Runner  │  │  Runner  │  │  │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │  │
│  │  │                                                          │  │  │
│  │  │  - Executes code in isolated container                   │  │  │
│  │  │  - Non-root user (UID 1000)                              │  │  │
│  │  │  - Read-only filesystem                                  │  │  │
│  │  │  - No network access (NetworkPolicy)                     │  │  │
│  │  │  - Resource limits enforced                              │  │  │
│  │  │  - Auto-terminates after timeout/completion              │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  RBAC: ServiceAccount + Role + RoleBinding                           │
│  NetworkPolicy: Deny egress by default                               │
│  ResourceQuota: CPU/Memory limits                                    │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │             Amazon ECR (Container Registry)             │
        │                                                         │
        │          ┌───────────────┐  ┌────────────────┐          │
        │          │ dev namespace │  │ prod namespace │          │
        │          └───────────────┘  └────────────────┘          │
        └─────────────────────────────────────────────────────────┘
```


## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (EKS, GKE, or any K8s cluster) for running jobs
- kubectl configured with access to the cluster
- Docker
- Python 3.11+
- Valid kubeconfig with appropriate RBAC permissions

### Local Development

1. **Set up Python environment:**
```bash
cd controller
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
export RUNNER_NAMESPACE=runner-dev
export ECR_REGISTRY=your-registry.dkr.ecr.us-east-1.amazonaws.com
export IMAGE_TAG=dev-latest
```

3. **Run controller locally:**
```bash
make run-controller-local
```


2. **Configure Kubernetes access:**
```bash
# Ensure kubectl is configured for your cluster
kubectl get nodes

# Set environment variables
export RUNNER_NAMESPACE=runner-dev
export ECR_REGISTRY=your-registry.dkr.ecr.us-east-1.amazonaws.com
export IMAGE_TAG=dev-latest
```

3. **Run controller locally:**
```bash
make run-controller-local
# Or manually:
cd controller && uvicorn app.main:app --reload --port 8000
```

> **Important**: The controller connects to your Kubernetes cluster via kubeconfig. See [EXTERNAL_CONTROLLER.md](EXTERNAL_CONTROLLER.md) for detailed configuration options including custom kubeconfig paths and contexts.

4. **Test the API:**
```bash
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello, World!\")",
    "timeout": 10
```

## 📦 Deployment

### Development Environment

1. **Create ECR repositories:**
```bash
make create-ecr-repos
```

2. **Build and push images:**
```bash
export ECR_REGISTRY=your-registry.dkr.ecr.us-east-1.amazonaws.com
make build-all
make push-all
```

3. **Deploy to dev:**
```bash
make deploy-dev
```

4. **Run integration tests:**
```bash
kubectl port-forward -n runner-dev svc/code-execution-controller 8000:80
make test-integration
```

### Production Environment

Production deployments are handled via GitHub Actions on release creation. To deploy manually:

```bash
make deploy-prod
```

This will:
- Prompt for version tag
- Deploy using image digests for immutability
- Apply all security policies
- Wait for rollout completion

## 🔒 Security Features

- **Network isolation**: NetworkPolicy blocks egress by default
- **Resource limits**: CPU/memory quotas prevent resource exhaustion
- **Non-root execution**: All containers run as non-root user (UID 1000)
- **Read-only filesystem**: Container filesystems are read-only
- **No privilege escalation**: Prevents containers from gaining additional privileges
- **Dropped capabilities**: All Linux capabilities are dropped
- **Timeout enforcement**: Jobs are killed after exceeding timeout
- **Auto-cleanup**: Jobs are automatically deleted after completion

## 📁 Project Structure

```
code-execution-service/
├── controller/                 # FastAPI controller
│   ├── app/
│   │   └── main.py            # Main application code
│   ├── Dockerfile
│   ├── requirements.txt
│   └── deploy/                # Kubernetes deployments
├── runners/                   # Language-specific runners
│   ├── python-runner/
│   ├── node-runner/
│   ├── cpp-runner/
│   └── java-runner/
├── k8s/                       # Base Kubernetes manifests
│   ├── namespace.yaml
│   ├── networkpolicy.yaml
│   ├── role.yaml
│   ├── rolebinding.yaml
│   ├── resourcequota.yaml
│   └── jobs/
├── ci/                        # CI/CD workflows
│   └── github-actions/
├── tests/                     # Tests
└── Makefile                   # Build/deploy helpers
```

## 🌐 API Reference

### Execute Code

**POST** `/execute`

Execute code in an isolated container.

**Request Body:**
```json
{
  "language": "python",
  "code": "print('Hello, World!')",
  "stdin": "",
  "timeout": 10
}
```

**Response:**
```json
{
  "status": "success",
  "stdout": "Hello, World!\n",
  "stderr": "",
  "execution_time": 1.234
}
```

**Supported Languages:**
- `python` - Python 3.11
- `javascript` - Node.js 20
- `cpp` - C++ (GCC 13)
- `java` - Java 17

### Health Check

**GET** `/health`

Returns service health status.

**Response:**
```json
{
  "status": "healthy"
}
```

## 🧪 Testing

### Unit Tests
```bash
make test
```

### Integration Tests
```bash
# Start service locally or port-forward to cluster
kubectl port-forward -n runner-dev svc/code-execution-controller 8000:80

# Run tests
make test-integration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RUNNER_NAMESPACE` | Kubernetes namespace for jobs | `runner-dev` |
| `ECR_REGISTRY` | ECR registry URL | Required |
| `IMAGE_TAG` | Docker image tag | `dev-latest` |
| `JOB_TIMEOUT` | Max execution time (seconds) | `30` |
| `SERVICE_ACCOUNT` | K8s service account | `controller-sa` |

### Resource Limits

**Dev Environment:**
- CPU: 100m request, 500m limit
- Memory: 128Mi request, 256Mi limit
- Max concurrent jobs: 50

**Prod Environment:**
- CPU: 100m request, 500m limit
- Memory: 128Mi request, 256Mi limit
- Max concurrent jobs: 200

## 📊 Monitoring

### View Logs

```bash
# Controller logs
kubectl logs -n runner-dev -l app=code-execution-controller -f

# Runner job logs
kubectl logs -n runner-dev <job-pod-name>
```

### Check Job Status

```bash
# List all jobs
kubectl get jobs -n runner-dev

# Describe specific job
kubectl describe job <job-name> -n runner-dev
```

## 🐛 Troubleshooting

### Jobs Not Starting

1. Check RBAC permissions:
```bash
kubectl get rolebinding -n runner-dev
```

2. Check resource quotas:
```bash
kubectl describe resourcequota -n runner-dev
```

### Controller Can't Create Jobs

Verify service account has correct permissions:
```bash
kubectl auth can-i create jobs --as=system:serviceaccount:runner-dev:controller-sa -n runner-dev
```

### Images Not Pulling

Ensure ECR credentials are configured:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ecr-registry>
```

## 📝 CI/CD Pipeline

### Development Flow

1. Push to `develop` or `main` branch
2. GitHub Actions builds images with `dev-<git-sha>` tag
3. Images pushed to ECR with `dev-latest` tag
4. Deployed to `runner-dev` namespace
5. Integration tests run automatically

### Production Flow

1. Create GitHub release with version tag (e.g., `v1.0.0`)
2. Workflow promotes dev images to `prod-<version>` tags
3. Images deployed by digest to `runner-prod` namespace
4. Smoke tests verify deployment

## 🤝 Contributing

1. Create feature branch
2. Make changes and test locally
3. Ensure tests pass: `make test`
4. Push and create pull request
5. CI will run automated tests

## 📄 License

See LICENSE file in repository root.

## 🆘 Support

For issues or questions:
- Check troubleshooting section
- Review logs: `kubectl logs -n runner-dev -l app=code-execution-controller`
- Open an issue in the repository

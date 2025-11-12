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

- **AWS Account** with EKS cluster running
- **AWS CLI** configured with appropriate profile
- **kubectl** configured with access to the cluster
- **Docker** with buildx support
- **Python 3.13+** for local controller development
- **ECR repositories** created for runner images

### Makefile Commands

Available make targets:

```bash
make help                    # Show available targets
make create-ecr-repos       # Create ECR repositories for all runners
make build-push-runners     # Build and push all runner images to ECR
make login-ecr              # Login to AWS ECR
```

### Local Development

1. **Set up Python environment:**
```bash
cd controller
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration:
# LOCAL_DEV=true
# AWS_ACCESS_KEY_ID=<your-access-key>
# AWS_SECRET_ACCESS_KEY=<your-secret-key>
# AWS_REGION=ap-southeast-1
# EKS_CLUSTER_NAME=<your-cluster-name>
# ECR_REGISTRY=<your-registry>.dkr.ecr.ap-southeast-1.amazonaws.com
# ECR_REPO_NAMESPACE=peerprep-code-exec-runners-dev
# RUNNER_NAMESPACE=runner-dev
# JOB_TIMEOUT=30
```

3. **Run controller locally:**
```bash
cd controller
uvicorn app.main:app --reload --port 8000
```

> **Important**: In local development mode (`LOCAL_DEV=true`), the controller connects to your EKS cluster using AWS credentials. Ensure your AWS credentials have appropriate permissions to access the EKS cluster and create jobs in the runner namespace.

4. **Test the API:**
```bash
# Note: code and stdin must be base64 encoded
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "cHJpbnQoIkhlbGxvLCBXb3JsZCEiKQ==",
    "stdin": "",
    "timeout": 10
  }'
```

## 📦 Deployment

### Building and Pushing Runner Images

1. **Login to AWS ECR:**
```bash
# Configure AWS profile (if not already done)
aws configure --profile peerprep

# Login is handled automatically by the Makefile
```

2. **Create ECR repositories (first time only):**
```bash
make create-ecr-repos
```

3. **Build and push runner images:**
```bash
# Build and push all runner images (python, node, cpp, java)
# Images are built for linux/amd64 platform (EKS compatible)
make build-push-runners

# To use a specific tag:
make build-push-runners IMAGE_TAG=v1.0.0

# To use a specific Git SHA:
make build-push-runners IMAGE_TAG=$(git rev-parse --short HEAD)
```

### Kubernetes Deployment

The controller can be deployed to Kubernetes or run locally:

- **Local mode**: Set `LOCAL_DEV=true` and provide AWS credentials to connect to EKS
- **Production mode**: Deploy controller in EKS cluster using IAM roles for service accounts (IRSA)

> **Note**: Production deployment with IRSA is not yet fully implemented. Currently, local development mode is the primary deployment method.

## 🔒 Security Features

- **Network isolation**: NetworkPolicy blocks egress by default (if configured in cluster)
- **Resource limits**: CPU/memory quotas prevent resource exhaustion
  - CPU: 100m request, 500m limit
  - Memory: 128Mi request, 256Mi limit
- **Non-root execution**: All containers run as non-root user (UID 1001)
- **Read-only filesystem**: Container filesystems are read-only (with writable /tmp)
- **No privilege escalation**: Prevents containers from gaining additional privileges
- **Dropped capabilities**: All Linux capabilities are dropped
- **Timeout enforcement**: Jobs are killed after exceeding timeout (activeDeadlineSeconds)
- **Auto-cleanup**: Jobs are automatically deleted 60 seconds after completion (ttlSecondsAfterFinished)
- **Base64 encoding**: Code and stdin are base64 encoded for safe transmission

## 📁 Project Structure

```
code-execution-service/
├── controller/                 # FastAPI controller
│   ├── app/
│   │   ├── main.py            # Main application code
│   │   └── __init__.py        # EKS authentication helper
│   ├── Dockerfile
│   └── requirements.txt
├── runners/                   # Language-specific runners
│   ├── python-runner/
│   ├── node-runner/
│   ├── cpp-runner/
│   └── java-runner/
├── k8s/                       # Base Kubernetes manifests
│   ├── namespace.yaml
│   └── resourcequota.yaml
├── .env.example               # Environment variables template
├── docker-compose.yml         # Local docker setup
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
  "code": "cHJpbnQoJ0hlbGxvLCBXb3JsZCEnKQ==",
  "stdin": "",
  "timeout": 10
}
```

> **Important**: Both `code` and `stdin` fields must be base64 encoded. Example:
> ```javascript
> const code = btoa("print('Hello, World!')");  // JavaScript
> // Python: base64.b64encode(code.encode()).decode()
> ```

**Response:**
```json
{
  "status": "success",
  "stdout": "Hello, World!\n",
  "stderr": "",
  "execution_time": 1.234,
  "exit_code": 0
}
```

**Response Fields:**
- `status`: "success" or "failed"
- `stdout`: Standard output from the code execution
- `stderr`: Standard error output (includes timeout messages)
- `execution_time`: Time taken for job execution in seconds
- `exit_code`: Container exit code (0 for success, 124 for timeout, etc.)

**Supported Languages:**
- `python` - Python 3.11+
- `javascript` - Node.js 20+
- `cpp` - C++ (GCC 13+)
- `java` - Java 17+

**Error Codes:**
- `400`: Invalid language or malformed base64 encoding
- `500`: Kubernetes API error or internal server error

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

### Manual Testing

Test the API endpoint manually:

```bash
# Health check
curl http://localhost:8000/health

# Execute Python code (remember to base64 encode!)
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "cHJpbnQoIkhlbGxvLCBXb3JsZCEiKQ==",
    "stdin": "",
    "timeout": 10
  }'
```

### Helper for Base64 Encoding

```bash
# Linux/Mac
echo -n "print('Hello, World!')" | base64

# PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("print('Hello, World!')"))

# Python
python -c "import base64; print(base64.b64encode(b\"print('Hello, World!')\").decode())"
```

## 🔧 Configuration

### Environment Variables

Configuration is managed through a `.env` file in the root directory. See `.env.example` for template.

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LOCAL_DEV` | Enable local development mode (`true`/`false`) | Yes | - |
| `AWS_ACCESS_KEY_ID` | AWS access key for EKS authentication | Yes (local) | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for EKS authentication | Yes (local) | - |
| `AWS_REGION` | AWS region where EKS cluster is located | Yes | `ap-southeast-1` |
| `EKS_CLUSTER_NAME` | Name of the EKS cluster | Yes | - |
| `ECR_REGISTRY` | ECR registry URL | Yes | - |
| `ECR_REPO_NAMESPACE` | ECR repository namespace | Yes | `peerprep-code-exec-runners-dev` |
| `RUNNER_NAMESPACE` | Kubernetes namespace for jobs | Yes | `runner-dev` |
| `IMAGE_TAG` | Docker image tag for runners | No | `latest` |
| `JOB_TIMEOUT` | Max execution time in seconds | Yes | `30` |

### Makefile Variables

The Makefile supports the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ECR_REGISTRY` | ECR registry URL | `742705053940.dkr.ecr.ap-southeast-1.amazonaws.com` |
| `ECR_REPO_NAMESPACE` | ECR repository namespace | `peerprep-code-exec-runners-dev` |
| `AWS_REGION` | AWS region | `ap-southeast-1` |
| `AWS_PROFILE` | AWS CLI profile | `peerprep` |
| `IMAGE_TAG` | Image tag (uses git SHA by default) | `$(git rev-parse --short HEAD)` |
| `NAMESPACE` | Kubernetes namespace | `runner-dev` |

### Resource Limits

Per-job resource limits (enforced by Kubernetes):
- **CPU**: 100m request, 500m limit
- **Memory**: 128Mi request, 256Mi limit
- **Temporary storage**: 64Mi in-memory tmpfs
- **Job timeout**: Configurable via `JOB_TIMEOUT` (default 30s)
- **TTL after finished**: 60 seconds (automatic cleanup)

## 📊 Monitoring

### View Logs

```bash
# Controller logs (if running in Kubernetes)
kubectl logs -n runner-dev -l app=code-execution-controller -f

# Runner job logs
kubectl logs -n runner-dev <job-pod-name>

# List all jobs
kubectl get jobs -n runner-dev

# Find pods for a specific job
kubectl get pods -n runner-dev -l job-name=<job-name>
```

### Check Job Status

```bash
# List all jobs with status
kubectl get jobs -n runner-dev

# Describe specific job
kubectl describe job <job-name> -n runner-dev

# Watch jobs in real-time
kubectl get jobs -n runner-dev -w
```

### Debugging

View job events and logs:
```bash
# Get job details
kubectl describe job runner-python-<timestamp> -n runner-dev

# Get pod logs
kubectl logs -n runner-dev -l job-name=runner-python-<timestamp>

# Get pod status
kubectl get pod -n runner-dev -l job-name=runner-python-<timestamp> -o yaml
```

## 🐛 Troubleshooting

### Controller Can't Connect to EKS

**Symptoms**: Controller fails to start with authentication errors

**Solutions**:
1. Verify AWS credentials are correct:
```bash
aws sts get-caller-identity --profile peerprep
```

2. Check EKS cluster name and region in `.env`:
```bash
aws eks list-clusters --region ap-southeast-1 --profile peerprep
```

3. Ensure IAM user has EKS access permissions

### Jobs Not Starting

**Symptoms**: Jobs are created but pods don't start

**Solutions**:
1. Check namespace exists:
```bash
kubectl get namespace runner-dev
```

2. Check resource quotas:
```bash
kubectl describe resourcequota -n runner-dev
```

3. Check if images can be pulled:
```bash
# Verify ECR login
aws ecr get-login-password --region ap-southeast-1 --profile peerprep | docker login --username AWS --password-stdin <ecr-registry>

# Check if image exists
aws ecr describe-images --repository-name peerprep-code-exec-runners-dev/python --region ap-southeast-1 --profile peerprep
```

### Base64 Encoding Issues

**Symptoms**: 400 error with "Invalid base64 encoded code or stdin"

**Solutions**:
- Ensure code and stdin are properly base64 encoded
- Use UTF-8 encoding before base64 encoding
- Test encoding with the helper commands in the Testing section

### Timeout Issues

**Symptoms**: Jobs fail with exit code 124 or are killed

**Solutions**:
1. Increase timeout in request (up to `JOB_TIMEOUT` limit)
2. Check if code has infinite loops
3. Verify resource limits are sufficient

### ECR Authentication Errors

**Symptoms**: ImagePullBackOff errors

**Solutions**:
1. Refresh ECR login:
```bash
aws ecr get-login-password --region ap-southeast-1 --profile peerprep | docker login --username AWS --password-stdin <ecr-registry>
```

2. Verify images exist:
```bash
aws ecr list-images --repository-name peerprep-code-exec-runners-dev/python --region ap-southeast-1 --profile peerprep
```

3. Check if controller has permissions to pull images (in production with IRSA)

## 📝 Development Workflow

### Local Development Setup

1. **Clone repository and navigate to service**
2. **Configure AWS and EKS access**
3. **Set up environment variables in `.env`**
4. **Build and push runner images to ECR**
5. **Run controller locally**
6. **Test with API calls**

### Building New Runner Images

When you update runner code:

```bash
# Build and push specific runner
docker buildx build --platform linux/amd64 \
  -t <ecr-registry>/peerprep-code-exec-runners-dev/python:latest \
  ./runners/python-runner --push

# Or use Makefile to build all
make build-push-runners
```

### Adding a New Language

1. Create new runner directory: `runners/<language>-runner/`
2. Add Dockerfile and runner script
3. Update `LANGUAGE_IMAGES` in `controller/app/main.py`
4. Add to `RUNNERS` list in `Makefile`
5. Create ECR repository: `make create-ecr-repos`
6. Build and push: `make build-push-runners`

## 🚧 Current Limitations

- **Production deployment**: IRSA (IAM Roles for Service Accounts) not yet implemented
- **CI/CD**: No automated GitHub Actions workflow yet
- **Network policies**: Not enforced (cluster-dependent)
- **Monitoring**: No built-in metrics or dashboards
- **Auto-scaling**: Manual scaling only
- **Multi-region**: Single region deployment only

## 🆘 Support

For issues or questions:
- Review the Troubleshooting section above
- Check controller logs for error messages
- Verify environment configuration in `.env`
- Ensure AWS credentials and EKS cluster access are correct
- Check Kubernetes job status: `kubectl get jobs -n runner-dev`
- View job logs: `kubectl logs -n runner-dev -l job-name=<job-name>`

## 📚 Additional Resources

- [Kubernetes Jobs Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Buildx Documentation](https://docs.docker.com/buildx/working-with-buildx/)

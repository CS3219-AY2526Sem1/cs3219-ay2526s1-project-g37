"""
FastAPI Controller for Code Execution Service
Spawns Kubernetes Jobs to execute code in isolated runner containers.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import base64
import os
import time
from typing import Optional
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Code Execution Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kubernetes configuration
# For cloud environment, controller can connect to a separate EKS cluster using IAM authentication
# For local development, it can either use local kubeconfig OR connect to EKS with AWS credentials
if os.getenv("LOCAL_DEV") == "true":
    # Check if EKS_CLUSTER_NAME is set for local dev with EKS
    eks_cluster_name = os.getenv("EKS_CLUSTER_NAME")
    
    if eks_cluster_name:
        # Local dev connecting to EKS cluster
        logger.info("Local dev mode: Connecting to EKS with AWS credentials")
        aws_region = os.getenv("AWS_REGION", "ap-southeast-1")
        role_arn = os.getenv("AWS_ROLE_ARN")
        
        try:
            from .eks_auth import load_eks_config
            load_eks_config(
                cluster_name=eks_cluster_name,
                region=aws_region,
                role_arn=role_arn
            )
            logger.info(f"Successfully connected to EKS cluster: {eks_cluster_name}")
        except Exception as e:
            logger.error(f"Failed to authenticate with EKS: {e}")
            raise RuntimeError(f"Cannot connect to EKS cluster: {e}")
    else:
        # Local dev with local kubeconfig
        logger.info("Local dev mode: Using local kubeconfig")
        kubeconfig_path = os.getenv("KUBECONFIG", None)
        context = os.getenv("K8S_CONTEXT", None)
        
        if context:
            logger.info(f"Using Kubernetes context: {context}")
        else:
            logger.info("Using default Kubernetes context")
        
        try:
            if kubeconfig_path:
                logger.info(f"Loading Kubernetes configuration from: {kubeconfig_path}")
                config.load_kube_config(config_file=kubeconfig_path, context=context)
            else:
                logger.info("Loading Kubernetes configuration from default kubeconfig")
                config.load_kube_config(context=context)

        except config.ConfigException as e:
            logger.error(f"Failed to load Kubernetes configuration: {e}")
            raise RuntimeError("Cannot connect to Kubernetes cluster. Ensure kubeconfig is properly configured.")

else:
    # Production mode: Always use EKS IAM authentication
    eks_cluster_name = os.getenv("EKS_CLUSTER_NAME")
    aws_region = os.getenv("AWS_REGION", "ap-southeast-1")
    role_arn = os.getenv("AWS_ROLE_ARN")  # Optional: IAM role to assume

    try:
        # Cross-cluster EKS authentication using IAM
        logger.info(f"Connecting to EKS cluster: {eks_cluster_name} in {aws_region}")
        from .eks_auth import load_eks_config
        load_eks_config(
            cluster_name=eks_cluster_name,
            region=aws_region,
            role_arn=role_arn
        )
        logger.info("Successfully authenticated with EKS cluster using IAM")

    except Exception as e:
        logger.error(f"Failed to authenticate with EKS: {e}")
        raise RuntimeError(f"Cannot connect to EKS cluster: {e}")

# Environment variables
NAMESPACE = os.getenv("RUNNER_NAMESPACE")
ECR_REGISTRY = os.getenv("ECR_REGISTRY")
ECR_REPO_NAMESPACE = os.getenv("ECR_REPO_NAMESPACE")
IMAGE_TAG = os.getenv("IMAGE_TAG", "latest")
JOB_TIMEOUT = int(os.getenv("JOB_TIMEOUT"))

# Language to runner image mapping
LANGUAGE_IMAGES = {
    "python": f"{ECR_REGISTRY}/{ECR_REPO_NAMESPACE}/python:{IMAGE_TAG}",
    "cpp": f"{ECR_REGISTRY}/{ECR_REPO_NAMESPACE}/cpp:{IMAGE_TAG}",
    "java": f"{ECR_REGISTRY}/{ECR_REPO_NAMESPACE}/java:{IMAGE_TAG}",
    "javascript": f"{ECR_REGISTRY}/{ECR_REPO_NAMESPACE}/node:{IMAGE_TAG}",
}


class ExecutionRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""
    timeout: Optional[int] = 10


class ExecutionResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    execution_time: float


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/execute", response_model=ExecutionResponse)
async def execute_code(request: ExecutionRequest):
    """
    Execute code in an isolated Kubernetes Job
    """
    if request.language not in LANGUAGE_IMAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {request.language}. Supported: {list(LANGUAGE_IMAGES.keys())}"
        )

    # Encode code and stdin to base64
    code_b64 = base64.b64encode(request.code.encode()).decode()
    stdin_b64 = base64.b64encode(request.stdin.encode()).decode()

    # Generate unique job name
    job_name = f"runner-{request.language}-{int(time.time())}"

    # Create Kubernetes Job
    batch_v1 = client.BatchV1Api()
    core_v1 = client.CoreV1Api()

    job = create_job_manifest(
        job_name=job_name,
        language=request.language,
        code_b64=code_b64,
        stdin_b64=stdin_b64,
        timeout=min(request.timeout, JOB_TIMEOUT),
    )

    try:
        # Create the job
        batch_v1.create_namespaced_job(namespace=NAMESPACE, body=job)
        logger.info(f"Created job: {job_name}")

        # Wait for job completion
        start_time = time.time()
        max_wait = request.timeout + 10  # Extra buffer time

        while time.time() - start_time < max_wait:
            job_status = batch_v1.read_namespaced_job_status(name=job_name, namespace=NAMESPACE)
            
            if job_status.status.succeeded:
                logger.info(f"Job {job_name} succeeded")
                break
            elif job_status.status.failed:
                logger.warning(f"Job {job_name} failed")
                break
            
            time.sleep(0.5)

        # Get pod logs
        pods = core_v1.list_namespaced_pod(
            namespace=NAMESPACE,
            label_selector=f"job-name={job_name}"
        )

        stdout = ""
        stderr = ""
        
        if pods.items:
            pod_name = pods.items[0].metadata.name
            try:
                logs = core_v1.read_namespaced_pod_log(name=pod_name, namespace=NAMESPACE)
                stdout = logs
            except ApiException as e:
                stderr = f"Failed to retrieve logs: {str(e)}"
                logger.error(f"Failed to get logs for {pod_name}: {e}")

        execution_time = time.time() - start_time

        # Cleanup job
        try:
            batch_v1.delete_namespaced_job(
                name=job_name,
                namespace=NAMESPACE,
                propagation_policy="Foreground"
            )
            logger.info(f"Deleted job: {job_name}")
        except ApiException as e:
            logger.warning(f"Failed to delete job {job_name}: {e}")

        return ExecutionResponse(
            status="success" if job_status.status.succeeded else "failed",
            stdout=stdout,
            stderr=stderr,
            execution_time=execution_time
        )

    except ApiException as e:
        logger.error(f"Kubernetes API error: {e}")
        raise HTTPException(status_code=500, detail=f"Kubernetes error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


def create_job_manifest(job_name: str, language: str, code_b64: str, stdin_b64: str, timeout: int):
    """
    Create a Kubernetes Job manifest for code execution
    """
    return client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(name=job_name, namespace=NAMESPACE),
        spec=client.V1JobSpec(
            ttl_seconds_after_finished=60,  # Auto-cleanup after 60s
            backoff_limit=0,  # No retries
            active_deadline_seconds=timeout,
            template=client.V1PodTemplateSpec(
                metadata=client.V1ObjectMeta(
                    labels={"app": "code-runner", "language": language}
                ),
                spec=client.V1PodSpec(
                    restart_policy="Never",
                    service_account_name="code-execution-runner",
                    containers=[
                        client.V1Container(
                            name="runner",
                            image=LANGUAGE_IMAGES[language],
                            env=[
                                client.V1EnvVar(name="CODE_B64", value=code_b64),
                                client.V1EnvVar(name="STDIN_B64", value=stdin_b64),
                                client.V1EnvVar(name="TIMEOUT", value=str(timeout)),
                            ],
                            resources=client.V1ResourceRequirements(
                                requests={"cpu": "100m", "memory": "128Mi"},
                                limits={"cpu": "500m", "memory": "256Mi"},
                            ),
                            security_context=client.V1SecurityContext(
                                run_as_non_root=True,
                                run_as_user=1001,  # Must match UID in runner Dockerfiles
                                read_only_root_filesystem=True,
                                allow_privilege_escalation=False,
                                capabilities=client.V1Capabilities(drop=["ALL"]),
                            ),
                        )
                    ],
                ),
            ),
        ),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

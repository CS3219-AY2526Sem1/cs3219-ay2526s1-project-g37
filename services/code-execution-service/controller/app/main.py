"""
FastAPI Controller for Code Execution Service
Spawns Kubernetes Jobs to execute code in isolated runner containers.
"""
import base64
import os
import time
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config
from kubernetes.client.rest import ApiException
from typing import Optional
from pydantic import BaseModel

from app import load_eks_config


# Configure logging to output to stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Code Execution Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kubernetes configuration
if os.getenv("LOCAL_DEV") == "true":
    eks_cluster_name = os.getenv("EKS_CLUSTER_NAME")
    logger.info("Local dev mode: Connecting to EKS with AWS credentials")
    aws_region = os.getenv("AWS_REGION", "ap-southeast-1")
    
    try:
        load_eks_config(
            cluster_name=eks_cluster_name
        )
        logger.info(f"Successfully connected to EKS cluster: {eks_cluster_name}")
    except Exception as e:
        logger.error(f"Failed to authenticate with EKS: {e}")
        raise RuntimeError(f"Cannot connect to EKS cluster: {e}")

else:
    # Production mode: Always use EKS IAM authentication
    # TODO: Implement IAM auth
    logger.info("Production mode: Using in-cluster config for EKS")

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
    exit_code: Optional[int] = None


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

    # Ensure base64 strings are valid
    try:
        base64.b64decode(request.code).decode('utf-8')
        base64.b64decode(request.stdin).decode('utf-8')
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base64 encoded code or stdin: {str(e)}"
        )
    
    # Generate unique job name
    job_name = f"runner-{request.language}-{int(time.time())}"

    # Create Kubernetes Job
    batch_v1 = client.BatchV1Api()
    core_v1 = client.CoreV1Api()
    
    # Store timeout for later use
    actual_timeout = min(request.timeout, JOB_TIMEOUT)

    job = create_job_manifest(
        job_name=job_name,
        language=request.language,
        code_b64=request.code,
        stdin_b64=request.stdin,
        timeout=actual_timeout,
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

        # Get pod logs and exit code
        pods = core_v1.list_namespaced_pod(
            namespace=NAMESPACE,
            label_selector=f"job-name={job_name}"
        )

        stdout = ""
        stderr = ""
        exit_code = None
        
        if pods.items:
            pod_name = pods.items[0].metadata.name
            
            # Get stdout logs
            try:
                stdout = core_v1.read_namespaced_pod_log(name=pod_name, namespace=NAMESPACE)
            except ApiException as e:
                logger.error(f"Failed to get stdout logs for {pod_name}: {e}")
            
            # Get stderr logs separately
            try:
                pod_logs = core_v1.read_namespaced_pod_log(
                    name=pod_name, 
                    namespace=NAMESPACE,
                    container="runner",
                    follow=False,
                    _preload_content=False
                )
                stderr = pod_logs.read().decode('utf-8')
                # If there are errors, they would be in the logs
                # The runner scripts write errors to stderr which get captured in pod logs
            except ApiException as e:
                logger.error(f"Failed to get stderr logs for {pod_name}: {e}")
            
            # Get pod status to check exit code
            try:
                pod_status = core_v1.read_namespaced_pod_status(name=pod_name, namespace=NAMESPACE)
                if pod_status.status.container_statuses:
                    container_status = pod_status.status.container_statuses[0]
                    if container_status.state.terminated:
                        exit_code = container_status.state.terminated.exit_code
                        logger.info(f"Container exit code: {exit_code}")
                        
                        # If exit code is non-zero, the logs contain the error
                        if exit_code != 0:
                            stderr = stdout if stdout else "Execution failed with no output"
                            stdout = ""
                            
                            # Provide context based on exit code
                            if exit_code == 124:
                                stderr = f"Execution timed out after {actual_timeout} seconds\n{stderr}"
                            elif exit_code == 137:
                                stderr = "Execution killed (possibly out of memory or timeout)\n" + stderr
                            elif exit_code == 1:
                                stderr = "Runtime error:\n" + stderr
            except ApiException as e:
                logger.error(f"Failed to get pod status for {pod_name}: {e}")

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
            execution_time=execution_time,
            exit_code=exit_code
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
                                run_as_user=1001,
                                read_only_root_filesystem=True,
                                allow_privilege_escalation=False,
                                capabilities=client.V1Capabilities(drop=["ALL"]),
                            ),
                            volume_mounts=[
                                client.V1VolumeMount(
                                    name="tmp",
                                    mount_path="/tmp"
                                )
                            ],
                        )
                    ],
                    volumes=[
                        client.V1Volume(
                            name="tmp",
                            empty_dir=client.V1EmptyDirVolumeSource(
                                medium="Memory",
                                size_limit="64Mi"
                            )
                        )
                    ],
                ),
            ),
        ),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

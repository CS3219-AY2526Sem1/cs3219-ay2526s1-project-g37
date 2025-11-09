"""
AWS EKS Authentication Helper
Uses AWS CLI to generate kubeconfig with IAM authentication
"""
import subprocess
import os
import logging

from pathlib import Path
from kubernetes import config

logger = logging.getLogger(__name__)


def configure_aws_credentials(
    access_key_id: str,
    secret_access_key: str,
    region: str
) -> None:
    """
    Configure AWS credentials by writing to ~/.aws/credentials and ~/.aws/config files.
    
    Args:
        access_key_id: AWS access key ID
        secret_access_key: AWS secret access key
        region: AWS region
        session_token: Optional session token (for temporary credentials)
    """
    try:
        # Create ~/.aws directory if it doesn't exist
        aws_dir = Path.home() / '.aws'
        aws_dir.mkdir(parents=True, exist_ok=True)
        
        # Write credentials file
        credentials_file = aws_dir / 'credentials'
        credentials_content = f"""[default]
aws_access_key_id = {access_key_id}
aws_secret_access_key = {secret_access_key}
"""
     
        with open(credentials_file, 'w') as f:
            f.write(credentials_content)
        
        # Set proper permissions (readable only by owner)
        credentials_file.chmod(0o600)
        
        # Write config file
        config_file = aws_dir / 'config'
        config_content = f"""[default]
region = {region}
output = json
"""
        
        with open(config_file, 'w') as f:
            f.write(config_content)
        
        config_file.chmod(0o600)
        
        logger.info(f"AWS credentials configured in {credentials_file}")
        logger.info(f"AWS config configured in {config_file} for region: {region}")
        
    except Exception as e:
        logger.error(f"Failed to configure AWS credentials: {e}")
        raise


def update_kubeconfig(
    cluster_name: str,
    region: str,
    kubeconfig_path: str = "/tmp/kubeconfig"
) -> str:
    """
    Update kubeconfig using AWS CLI.
    
    Args:
        cluster_name: Name of the EKS cluster
        region: AWS region
        kubeconfig_path: Path where kubeconfig will be written
        
    Returns:
        Path to the updated kubeconfig file
    """
    try:
        # Build the AWS CLI command
        cmd = [
            'aws', 'eks', 'update-kubeconfig',
            '--region', region,
            '--name', cluster_name,
            '--kubeconfig', kubeconfig_path
        ]
        
        # Execute the command
        logger.info(f"Running: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        logger.info(f"Kubeconfig updated successfully: {result.stdout.strip()}")
        logger.info(f"Kubeconfig written to: {kubeconfig_path}")
        
        return kubeconfig_path
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to update kubeconfig: {e.stderr}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating kubeconfig: {e}")
        raise


def load_eks_config(
    cluster_name: str
) -> None:
    """
    Load Kubernetes configuration for an EKS cluster using AWS CLI.
    
    This function:
    1. Configures AWS credentials (from environment variables)
    2. Runs 'aws eks update-kubeconfig' to generate kubeconfig
    3. Loads the kubeconfig into the Kubernetes client
    
    Args:
        cluster_name: Name of the EKS cluster
    """
    # Configure AWS credentials from environment variables
    access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    region = os.getenv('AWS_REGION')

    configure_aws_credentials(
        access_key_id=access_key_id,
        secret_access_key=secret_access_key,
        region=region
    )

    kubeconfig_path = update_kubeconfig(
        cluster_name=cluster_name,
        region=region
    )
    
    config.load_kube_config(config_file=kubeconfig_path)
    logger.info(f"Successfully loaded Kubernetes configuration for EKS cluster: {cluster_name}")
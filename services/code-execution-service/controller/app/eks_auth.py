"""
AWS EKS Authentication Helper
Generates kubeconfig with IAM authentication for cross-cluster access
"""

import tempfile
import yaml
import boto3
from kubernetes import config
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def get_eks_kubeconfig(
    cluster_name: str,
    region: str = "us-east-1",
    role_arn: Optional[str] = None
) -> str:
    """
    Generate a kubeconfig file for EKS cluster with IAM authentication.
    
    Args:
        cluster_name: Name of the EKS cluster
        region: AWS region
        role_arn: Optional IAM role ARN to assume
        
    Returns:
        Path to the generated kubeconfig file
    """
    eks_client = boto3.client('eks', region_name=region)
    
    # Get cluster information
    cluster_info = eks_client.describe_cluster(name=cluster_name)
    cluster = cluster_info['cluster']
    
    # Extract cluster details
    cluster_endpoint = cluster['endpoint']
    cluster_ca = cluster['certificateAuthority']['data']
    cluster_arn = cluster['arn']
    
    # Build kubeconfig
    kubeconfig = {
        'apiVersion': 'v1',
        'kind': 'Config',
        'clusters': [{
            'cluster': {
                'certificate-authority-data': cluster_ca,
                'server': cluster_endpoint
            },
            'name': cluster_arn
        }],
        'contexts': [{
            'context': {
                'cluster': cluster_arn,
                'user': cluster_arn
            },
            'name': cluster_arn
        }],
        'current-context': cluster_arn,
        'preferences': {},
        'users': [{
            'name': cluster_arn,
            'user': {
                'exec': {
                    'apiVersion': 'client.authentication.k8s.io/v1beta1',
                    'command': 'aws',
                    'args': [
                        'eks',
                        'get-token',
                        '--cluster-name',
                        cluster_name,
                        '--region',
                        region
                    ],
                    'env': None,
                    'interactiveMode': 'Never',
                    'provideClusterInfo': False
                }
            }
        }]
    }
    
    # Add role assumption if provided
    if role_arn:
        kubeconfig['users'][0]['user']['exec']['args'].extend([
            '--role-arn',
            role_arn
        ])
    
    # Write to temporary file
    temp_kubeconfig = tempfile.NamedTemporaryFile(
        mode='w',
        suffix='.yaml',
        delete=False
    )
    yaml.dump(kubeconfig, temp_kubeconfig, default_flow_style=False)
    temp_kubeconfig.flush()
    
    logger.info(f"Generated kubeconfig for cluster {cluster_name} at {temp_kubeconfig.name}")
    
    return temp_kubeconfig.name


def load_eks_config(
    cluster_name: str,
    region: str = "us-east-1",
    role_arn: Optional[str] = None
) -> None:
    """
    Load Kubernetes configuration for an EKS cluster.
    
    Args:
        cluster_name: Name of the EKS cluster
        region: AWS region
        role_arn: Optional IAM role ARN to assume
    """
    kubeconfig_path = get_eks_kubeconfig(cluster_name, region, role_arn)
    config.load_kube_config(config_file=kubeconfig_path)
    logger.info(f"Loaded Kubernetes configuration for EKS cluster: {cluster_name}")

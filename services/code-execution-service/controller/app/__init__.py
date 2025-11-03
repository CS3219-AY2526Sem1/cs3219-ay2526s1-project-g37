"""
Code Execution Controller Application Package
"""

__version__ = "1.0.0"

from .eks_auth import load_eks_config

__all__ = [
    "load_eks_config"
]

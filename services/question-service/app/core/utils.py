import os
import psycopg
import boto3
import base64
from typing import List, Optional


def get_conn():
    """Establishes and returns a new postgres database connection"""
    db_host = os.getenv("QUESTION_DB_HOST")
    
    # AWS RDS requires SSL connection
    if db_host and 'rds.amazonaws.com' in db_host:
        return psycopg.connect(
            dbname=os.getenv("QUESTION_DB_NAME"),
            user=os.getenv("QUESTION_DB_USER"),
            password=os.getenv("QUESTION_DB_PASSWORD"),
            host=db_host,
            port=os.getenv("QUESTION_DB_PORT"),
            sslmode='require'
        )
    else:
        return psycopg.connect(
            dbname=os.getenv("QUESTION_DB_NAME"),
            user=os.getenv("QUESTION_DB_USER"),
            password=os.getenv("QUESTION_DB_PASSWORD"),
            host=db_host,
            port=os.getenv("QUESTION_DB_PORT"),
        )


def upload_to_s3(file: bytes, key: str, content_type: Optional[str] = None):
    """
    Upload a single file to S3 with the given key and optional content type.

    Args:
        file: Raw bytes to upload
        key: Destination key (path) within the bucket
        content_type: MIME type of the object (e.g., 'image/png')
    """
    if file is None or key is None:
        raise ValueError("file and key are required")
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("QUESTION_AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("QUESTION_AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("QUESTION_AWS_REGION"),
    )
    bucket_name = os.getenv("QUESTION_S3_BUCKET_NAME")
    put_args = {"Bucket": bucket_name, "Key": key, "Body": file}
    if content_type:
        put_args["ContentType"] = content_type
    s3.put_object(**put_args)


def get_from_s3(keys: List[str]) -> List[bytes]:
    """
    Retrieve image data directly from S3 as bytes.
    
    Args:
        keys (List[str]): List of S3 object keys to retrieve
        
    Returns:
        List[bytes]: List of image data as bytes objects
    """
    if not keys:
        return []
    
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("QUESTION_AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("QUESTION_AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("QUESTION_AWS_REGION"),
    )
    bucket_name = os.getenv("QUESTION_S3_BUCKET_NAME")
    
    images = []
    for key in keys:
        response = s3.get_object(Bucket=bucket_name, Key=key)
        images.append(response['Body'].read())
    return images


def delete_from_s3(keys: List[str]):
    """Deletes files from S3 with the given keys."""
    if not keys:
        return
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("QUESTION_AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("QUESTION_AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("QUESTION_AWS_REGION")
    )
    bucket_name = os.getenv("QUESTION_S3_BUCKET_NAME")
    objects_to_delete = [{"Key": key} for key in keys]
    s3.delete_objects(Bucket=bucket_name, Delete={"Objects": objects_to_delete})


def batch_convert_base64_to_bytes(images: List[str]) -> List[bytes]:
    """Convert a list of base64 strings to a list of bytes"""
    if not images:
        return []
    try:
        images_bytes = [base64.b64decode(img) for img in images]
    except Exception as e:
        raise ValueError(f"Invalid base64 image: {str(e)}")
    return images_bytes


def batch_convert_bytes_to_base64(images: List[bytes]) -> List[str]:
    """Convert a list of bytes to a list of base64 strings"""
    if not images:
        return []
    try:
        images_b64 = [base64.b64encode(img).decode('utf-8') for img in images]
    except Exception as e:
        raise ValueError(f"Error encoding image to base64: {str(e)}")
    return images_b64
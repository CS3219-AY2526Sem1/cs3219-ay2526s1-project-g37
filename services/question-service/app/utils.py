import os
import psycopg
import boto3
from typing import List, Tuple

def get_conn():
    """Establishes and returns a new postgres database connection"""
    return psycopg.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
    )


def upload_to_s3(files_and_keys: List[Tuple[bytes, str]]):
    """Uploads files to S3 with the given keys."""
    if not files_and_keys:
        return
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    bucket_name = os.getenv("S3_BUCKET_NAME")
    for file, key in files_and_keys:
        s3.put_object(Bucket=bucket_name, Key=key, Body=file)


def delete_from_s3(keys: List[str]):
    """Deletes files from S3 with the given keys."""
    if not keys:
        return
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    bucket_name = os.getenv("S3_BUCKET_NAME")
    objects_to_delete = [{"Key": key} for key in keys]
    s3.delete_objects(Bucket=bucket_name, Delete={"Objects": objects_to_delete})
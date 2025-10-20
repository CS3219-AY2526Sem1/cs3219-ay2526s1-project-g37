import os
import boto3
import pytest
from moto import mock_aws
from app.core.crud import upload_image_and_get_url


@pytest.fixture(scope="function")
def aws_env():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    os.environ["AWS_REGION"] = "us-east-1"
    os.environ["S3_BUCKET_NAME"] = "test-bucket"
    os.environ["CLOUDFRONT_DOMAIN"] = "https://d123.cloudfront.net"


@mock_aws
def test_upload_image_and_get_url_success(aws_env):
    s3 = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
    s3.create_bucket(Bucket=os.getenv("S3_BUCKET_NAME"))

    data = b"hello image"
    url = upload_image_and_get_url(data, "pic.png")

    # Validate URL shape
    assert url.startswith("https://d123.cloudfront.net/test-bucket/")
    assert url.endswith("/pic.png")

    # Ensure object exists in S3
    key = url.split("/test-bucket/")[1]
    obj = s3.get_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=key)
    assert obj["Body"].read() == data


def test_upload_image_and_get_url_missing_env(aws_env):
    os.environ.pop("CLOUDFRONT_DOMAIN")
    with pytest.raises(ValueError):
        upload_image_and_get_url(b"data", "a.png")

import os
import pytest
import boto3
from moto import mock_aws
from app.utils import upload_to_s3, get_from_s3, delete_from_s3

@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    os.environ["S3_BUCKET_NAME"] = "test-bucket"

@pytest.fixture(scope="function")
def mocked_aws(aws_credentials):
    """
    Mock all AWS interactions
    Requires self creation of boto3 clients
    """
    with mock_aws():
        yield

@pytest.fixture
def mock_image_png():
    """Fixture for a 1x1 black pixel PNG."""
    return b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0cIDATx\x9cc`\x00\x01\x00\x00\x05\x00\x01\xa2\x99V\xdd\x00\x00\x00\x00IEND\xaeB`\x82'

@pytest.fixture
def mock_png_s3_keys():
    return "questions/qid1/0.png"

@pytest.fixture
def mock_image_jpeg():
    """Fixture for a 1x1 black pixel JPEG."""
    jpeg_data = b''.join([
        b'\xff\xd8',                         # SOI
        b'\xff\xe0\x00\x10',                 # APP0 segment (JFIF)
        b'JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00',
        b'\xff\xdb\x00C', b'\x00' * 67,      # DQT
        b'\xff\xc0\x00\x11',                 # SOF0 (baseline DCT)
        b'\x08\x00\x01\x00\x01\x01\x01\x11\x00',
        b'\xff\xc4\x00\x14', b'\x00' * 20,   # DHT
        b'\xff\xda\x00\x0c',                 # SOS
        b'\x01\x01\x00\x00?\x00',
        b'\x00\x00',                         # dummy compressed data
        b'\xff\xd9'                          # EOI
    ])
    return jpeg_data

@pytest.fixture
def mock_jpeg_s3_keys():
    return "questions/qid2/0.jpeg"

@mock_aws
def test_upload_to_s3_empty_list():
    """Tests that upload_to_s3 handles an empty list without error."""
    try:
        upload_to_s3([])
    except Exception as e:
        pytest.fail(f"upload_to_s3 raised an exception with an empty list: {e}")

@mock_aws
def test_get_from_s3_empty_list():
    """Tests that get_from_s3 handles an empty list correctly."""
    result = get_from_s3([])
    assert result == []

@mock_aws
def test_delete_from_s3_empty_list():
    """Tests that delete_from_s3 handles an empty list without error."""
    try:
        delete_from_s3([])
    except Exception as e:
        pytest.fail(f"delete_from_s3 raised an exception with an empty list: {e}")

@mock_aws
def test_s3_upload_get_delete_integration(mocked_aws, mock_image_png, mock_png_s3_keys, mock_image_jpeg, mock_jpeg_s3_keys):
    """
    Tests the full upload -> get -> delete cycle with image bytes using fixtures.
    """
    s3_client = boto3.client("s3")
    s3_client.create_bucket(Bucket=os.getenv("S3_BUCKET_NAME"))

    # 1. Upload
    files_to_upload = [
        (mock_image_png, mock_png_s3_keys),
        (mock_image_jpeg, mock_jpeg_s3_keys)
    ]
    upload_to_s3(files_to_upload)

    # 2. Get and Verify
    retrieved_data = get_from_s3([mock_png_s3_keys, mock_jpeg_s3_keys])
    assert len(retrieved_data) == 2
    assert retrieved_data[0] == mock_image_png
    assert retrieved_data[1] == mock_image_jpeg

    # 3. Delete
    delete_from_s3([mock_png_s3_keys, mock_jpeg_s3_keys])

    # 4. Verify Deletion
    # Check that getting the objects now raises an error
    with pytest.raises(s3_client.exceptions.NoSuchKey):
        s3_client.get_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=mock_png_s3_keys)
    with pytest.raises(s3_client.exceptions.NoSuchKey):
        s3_client.get_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=mock_jpeg_s3_keys)
import uuid
from unittest.mock import MagicMock, patch
import pytest

from app import crud
from app.models.exceptions import QuestionNotFoundException

# --- Mocks Setup ---

@pytest.fixture
def mock_db_conn():
    """Fixture to mock the database connection and cursor."""
    with patch('app.crud.get_conn') as mock_get_conn:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.connection = mock_conn 
        mock_get_conn.return_value.__enter__.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
        yield mock_cursor

@pytest.fixture
def mock_s3():
    """Fixture to mock all S3 utility functions."""
    with patch('app.crud.upload_to_s3') as mock_upload, \
         patch('app.crud.get_from_s3') as mock_get, \
         patch('app.crud.delete_from_s3') as mock_delete:
        yield {
            "upload": mock_upload,
            "get": mock_get,
            "delete": mock_delete
        }

# --- Additional Fixtures for Override Tests ---

@pytest.fixture
def mock_question_funcs():
    """Mock all external question functions"""
    with patch('app.crud.get_question') as mock_get, \
         patch('app.crud.delete_question') as mock_delete, \
         patch('app.crud.create_question') as mock_create:
        yield mock_get, mock_delete, mock_create


@pytest.fixture
def backup_data():
    """Sample backup question data"""
    return {
        "name": "Old Question",
        "description": "Old description", 
        "difficulty": "Easy",
        "topic": "Math",
        "images": [b"old_image"]
    }

# --- Test Cases ---

def test_list_difficulties_and_topics(mock_db_conn):
    """
    Tests that `list_difficulties_and_topics` correctly fetches and formats data.
    """
    # Arrange
    mock_db_conn.fetchall.side_effect = [
        [('Easy',), ('Hard',)],  # Difficulties
        [('Math',), ('Science',)] # Topics
    ]

    # Act
    result = crud.list_difficulties_and_topics()

    # Assert
    assert result == {
        "difficulties": ["Easy", "Hard"],
        "topics": ["Math", "Science"]
    }
    assert mock_db_conn.execute.call_count == 2
    mock_db_conn.execute.assert_any_call("SELECT * FROM difficulties")
    mock_db_conn.execute.assert_any_call("SELECT * FROM topics")


def test_list_difficulties_and_topics_empty(mock_db_conn):
    """
    Tests that `list_difficulties_and_topics` correctly fetches and formats data.
    """
    # Arrange
    mock_db_conn.fetchall.side_effect = [
        [],  # Difficulties
        []   # Topics
    ]

    # Act
    result = crud.list_difficulties_and_topics()

    # Assert
    assert result == {
        "difficulties": [],
        "topics": []
    }
    assert mock_db_conn.execute.call_count == 2
    mock_db_conn.execute.assert_any_call("SELECT * FROM difficulties")
    mock_db_conn.execute.assert_any_call("SELECT * FROM topics")


def test_create_question_success_without_images(mock_db_conn, mock_s3):
    """
    Tests successful question creation with images, verifying S3 upload and DB inserts.
    """
    # Act
    result_qid = crud.create_question("Test Q", "Desc", "Easy", "Math")

    # Assert
    mock_s3["upload"].assert_not_called()
    assert isinstance(result_qid, str) and len(result_qid) > 0
    
    # Check DB calls
    assert mock_db_conn.execute.call_count == 1 # Only question uploaded
    mock_s3["delete"].assert_not_called()


def test_create_question_success_with_images(mock_db_conn, mock_s3):
    """
    Tests successful question creation with images, verifying S3 upload and DB inserts.
    """
    # Arrange
    qid = str(uuid.uuid4())
    images = [b'img1_data', b'img2_data']
    expected_keys = [(images[0], f"questions/{qid}/0"), (images[1], f"questions/{qid}/1")]

    # Act
    result_qid = crud.create_question("Test Q", "Desc", "Easy", "Math", images, qid)

    # Assert
    assert result_qid == qid
    mock_s3["upload"].assert_called_once_with(expected_keys)
    
    # Check DB calls
    assert mock_db_conn.execute.call_count == 3 # 1 for question, 2 for images
    mock_s3["delete"].assert_not_called()


def test_create_question_db_fails_with_cleanup(mock_db_conn, mock_s3):
    """
    Tests that if DB insertion fails, uploaded S3 images are deleted.
    """
    # Arrange
    qid = str(uuid.uuid4())
    images = [b'img1_data']
    expected_keys = [(images[0], f"questions/{qid}/0")]
    mock_db_conn.execute.side_effect = Exception("DB Error")

    # Act & Assert
    with pytest.raises(Exception, match="DB Error"):
        crud.create_question("Test Q", "Desc", "Easy", "Math", images, qid)

    mock_s3["upload"].assert_called_once_with(expected_keys)
    mock_s3["delete"].assert_called_once_with([key for _, key in expected_keys])

def test_get_question_success(mock_db_conn, mock_s3):
    """
    Tests successful retrieval of a question and its images.
    """
    # Arrange
    qid = str(uuid.uuid4())
    question_data = ('Test Q', 'Desc', 'Easy', 'Math')
    image_keys = [(f'questions/{qid}/key1',), (f'questions/{qid}/key2',)]
    image_data = [b'img1', b'img2']
    
    mock_db_conn.fetchone.return_value = question_data
    mock_db_conn.fetchall.return_value = image_keys
    mock_s3["get"].return_value = image_data

    # Act
    result = crud.get_question(qid)

    # Assert
    assert result == {
        "id": qid,
        "name": 'Test Q',
        "description": 'Desc',
        "difficulty": 'Easy',
        "topic": 'Math',
        "images": image_data
    }
    mock_s3["get"].assert_called_once_with([f'questions/{qid}/key1', f'questions/{qid}/key2'])

def test_get_question_not_found(mock_db_conn):
    """
    Tests that `QuestionNotFoundException` is raised for a non-existent question.
    """
    # Arrange
    mock_db_conn.fetchone.return_value = None
    qid = str(uuid.uuid4())

    # Act & Assert
    with pytest.raises(QuestionNotFoundException):
        crud.get_question(qid)

def test_get_random_question_success(mock_db_conn, mock_s3):
    """
    Tests successful retrieval of a random question.
    """
    # Arrange
    qid = str(uuid.uuid4())
    row_data = (qid, 'Random Q', 'Desc', 'Hard', 'Science')
    mock_db_conn.fetchone.return_value = row_data
    mock_s3["get"].return_value = []  # No images

    # Act
    result = crud.get_random_question_by_difficulty_and_topic('Hard', 'Science')

    # Assert
    assert result == {
        "id": qid,
        "name": 'Random Q',
        "description": 'Desc',
        "difficulty": 'Hard',
        "topic": 'Science',
        "images": []  # No images
    }

def test_get_random_question_not_found(mock_db_conn):
    """
    Tests that `QuestionNotFoundException` is raised if no question matches criteria.
    """
    # Arrange
    mock_db_conn.fetchone.return_value = None

    # Act & Assert
    with pytest.raises(QuestionNotFoundException):
        crud.get_random_question_by_difficulty_and_topic('Impossible', 'Metaphysics')

def test_delete_question_success(mock_db_conn, mock_s3):
    """
    Tests successful deletion of a question and its S3 images.
    """
    # Arrange
    qid = str(uuid.uuid4())
    image_keys = [('questions/key1',)]
    mock_db_conn.fetchall.return_value = image_keys
    mock_db_conn.fetchone.return_value = (qid,) # Mock RETURNING id

    # Act
    crud.delete_question(qid)

    # Assert
    mock_db_conn.execute.assert_any_call("DELETE FROM questions WHERE id = %s RETURNING id", (qid,))
    mock_s3["delete"].assert_called_once_with(['questions/key1'])
    mock_db_conn.connection.rollback.assert_not_called()

def test_delete_question_not_found(mock_db_conn):
    """
    Tests that QuestionNotFoundException is raised for non-existent question.
    """
    # Arrange
    qid = str(uuid.uuid4())
    mock_db_conn.fetchone.return_value = None  # No question found

    # Act & Assert
    with pytest.raises(QuestionNotFoundException):
        crud.delete_question(qid)

def test_delete_question_s3_fails_rolls_back(mock_db_conn, mock_s3):
    """
    Tests that the DB transaction is rolled back if S3 deletion fails.
    """
    # Arrange
    qid = str(uuid.uuid4())
    mock_db_conn.fetchall.return_value = [('key1',)]
    mock_db_conn.fetchone.return_value = (qid,)
    mock_s3["delete"].side_effect = Exception("S3 Error")
    
    # Get the actual connection object to check rollback on it
    mock_conn = mock_db_conn.connection
    
    # Act & Assert
    with pytest.raises(Exception, match="S3 Error"):
        crud.delete_question(qid)
    
    # The connection object is accessed via the cursor's parent
    mock_conn.rollback.assert_called_once()

def test_successful_override(mock_question_funcs, backup_data):
    """Test successful question override"""
    mock_get, mock_delete, mock_create = mock_question_funcs
    mock_get.return_value = backup_data
    
    result = crud.override_question("qid123", "New", "New desc", "Hard", "Science", [b"img"])
    
    assert result == "qid123"
    mock_get.assert_called_once_with("qid123")
    mock_delete.assert_called_once_with("qid123")
    mock_create.assert_called_once_with("New", "New desc", "Hard", "Science", [b"img"], "qid123")


def test_override_without_images(mock_question_funcs, backup_data):
    """Test override without providing images"""
    mock_get, mock_delete, mock_create = mock_question_funcs
    mock_get.return_value = backup_data
    
    result = crud.override_question("qid123", "New", "New desc", "Hard", "Science")
    
    assert result == "qid123"
    mock_create.assert_called_once_with("New", "New desc", "Hard", "Science", None, "qid123")


def test_question_not_found(mock_question_funcs):
    """Test QuestionNotFoundException is raised when question doesn't exist"""
    mock_get, mock_delete, mock_create = mock_question_funcs
    mock_get.side_effect = QuestionNotFoundException("Not found")
    
    with pytest.raises(QuestionNotFoundException):
        crud.override_question("nonexistent", "New", "New desc", "Hard", "Science")


def test_create_failure_with_rollback(mock_question_funcs, backup_data):
    """Test rollback when create fails"""
    mock_get, mock_delete, mock_create = mock_question_funcs
    mock_get.return_value = backup_data
    mock_create.side_effect = [Exception("Create failed"), None]  # Fail then succeed
    
    with pytest.raises(Exception, match="Create failed"):
        crud.override_question("qid123", "New", "New desc", "Hard", "Science")
    
    assert mock_create.call_count == 2  # Original attempt + rollback


def test_create_failure_rollback_also_fails(mock_question_funcs, backup_data):
    """Test when both create and rollback fail"""
    mock_get, mock_delete, mock_create = mock_question_funcs
    mock_get.return_value = backup_data
    mock_create.side_effect = Exception("Always fails")
    
    with pytest.raises(Exception, match="Always fails"):
        crud.override_question("qid123", "New", "New desc", "Hard", "Science")
    
    assert mock_create.call_count == 2  # Original attempt + failed rollback


def test_delete_failure(mock_question_funcs, backup_data):
    """Test when delete_question fails"""
    mock_get, mock_delete, mock_create = mock_question_funcs
    mock_get.return_value = backup_data
    mock_delete.side_effect = Exception("Delete failed")
    
    with pytest.raises(Exception, match="Delete failed"):
        crud.override_question("qid123", "New", "New desc", "Hard", "Science")
    
    mock_create.assert_not_called()  # Should not reach create step
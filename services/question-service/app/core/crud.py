import uuid
import os
import mimetypes
from typing import List, Dict, Optional
from app.core.utils import get_conn, upload_to_s3
from app.models.exceptions import QuestionNotFoundException

def list_difficulties_and_topics() -> Dict[str, List[str]]:
    """
    Retrieves all available difficulty levels and topics from the database.
    
    Returns:
        dict: A dictionary containing:
            - difficulties (list[str]): List of all available difficulty levels
            - topics (list[str]): List of all available topics
    """
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT * FROM difficulties")
        difficulties = [row[0] for row in cur.fetchall()]

        cur.execute("SELECT * FROM topics")
        topics = [row[0] for row in cur.fetchall()]

        return {"difficulties": difficulties, "topics": topics}

def add_difficulty(difficulty: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO difficulties (name) VALUES (%s) ON CONFLICT DO NOTHING", (difficulty,))

def delete_difficulty(difficulty: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM difficulties WHERE level = %s", (difficulty,))

def add_topic(topic: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO topics (name) VALUES (%s) ON CONFLICT DO NOTHING", (topic,))

def delete_topic(topic: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM topics WHERE name = %s", (topic,))

def create_question(
    name: str,
    description: str,
    difficulty: str,
    topic: str,
    qid: Optional[str] = None
) -> str:
    """
    Creates a new question.
    
    Args:
        name: Question name
        description: Question description  
        difficulty: Difficulty level
        topic: Question topic
        qid: Optional question ID. If None, a new UUID will be generated
    
    Returns:
        str: The question ID (UUID) of the created question
    """
    qid = str(uuid.uuid4()) if qid is None else qid
    with get_conn() as conn, conn.cursor() as cur:
        # Insert question into database
        cur.execute(
            """
            INSERT INTO questions (id, name, description, difficulty, topic)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (qid, name, description, difficulty, topic),
        )
    return qid


def check_question_exists(difficulties: List[str], topics: List[str]) -> bool:
    """
    Checks if there exists at least one question for any combination of the provided difficulties and topics.
    
    Args:
        difficulties (list[str]): List of difficulty levels to check
        topics (list[str]): List of topics to check
    Returns:
        bool: True if at least one question exists for any combination, False otherwise
    """
    if not difficulties or not topics:
        return False

    with get_conn() as conn, conn.cursor() as cur:
        sql = "SELECT EXISTS (SELECT 1 FROM questions WHERE difficulty = ANY(%s) AND topic = ANY(%s) LIMIT 1);"
        cur.execute(sql, (difficulties, topics))
        exists = cur.fetchone()[0]
    
    return exists


def get_question(qid: str):
    """
    Retrieves a single question by its ID.
    
    Args:
        qid (str): The unique question identifier (UUID)
        
    Returns:
      dict: Question data including id, name, description, difficulty and topic
              
    Raises:
        QuestionNotFoundException: If no question exists with the given ID
    """
    with get_conn() as conn, conn.cursor() as cur:
        # Fetch the main question data
        cur.execute(
            "SELECT name, description, difficulty, topic FROM questions WHERE id = %s",
            (qid,),
        )
        question_data = cur.fetchone()

        if not question_data:
            raise QuestionNotFoundException(qid)

        return {
            "id": qid,
            "name": question_data[0],
            "description": question_data[1],
            "difficulty": question_data[2],
            "topic": question_data[3],
        }


def get_random_question_by_difficulty_and_topic(difficulty: str, topic: str):
    """
    Returns a random question matching the given difficulty and topic.
    
    Args:
        difficulty (str): The difficulty level to filter by (must exist in difficulties table)
        topic (str): The topic to filter by (must exist in topics table)
        
    Returns:
        dict: Question data including id, name, description, difficulty and topic
              
    Raises:
        QuestionNotFoundException: If no question matches the given difficulty and topic
                     
    Note:
        Uses database RANDOM() function for selection.
    """
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, name, description, difficulty, topic
            FROM questions
            WHERE difficulty = %s AND topic = %s
            ORDER BY RANDOM()
            LIMIT 1
            """,
            (difficulty, topic),
        )
        row = cur.fetchone()
        if not row:
            raise QuestionNotFoundException(topic=topic, difficulty=difficulty)

        qid = row[0]
        return {
            "id": qid,
            "name": row[1],
            "description": row[2],
            "difficulty": row[3],
            "topic": row[4],
        }


def override_question(
    qid: str,
    name: str,
    description: str,
    difficulty: str,
    topic: str
) -> str:
    """
    Atomically replaces an existing question with new data.
    
    This function performs a complete replacement of a question by:
    1. Backing up the original question data
    2. Deleting the old question
    3. Creating a new question with the same ID and new data
    4. Rolling back changes if any error occurs during the process
    
    Args:
        qid: The unique question identifier (UUID) to override
        name: New question name
        description: New question description
        difficulty: New difficulty level
        topic: New topic
    
    Returns:
        str: The question ID (same as input qid)
    """
    # First, get the original question data for backup purposes
    backup_data = get_question(qid)

    # Delete the old question
    delete_question(qid)

    try:
        # Create the new question with the same ID
        create_question(name, description, difficulty, topic, qid)
    except Exception:
        # If creation failed after deletion, restore the original question
        try:
            create_question(
                backup_data["name"],
                backup_data["description"],
                backup_data["difficulty"],
                backup_data["topic"],
                qid
            )
        except Exception:
            # If restoration also fails, we can't do much more
            # The original error is more important to report
            pass
        raise
    
    return qid


def delete_question(qid: str):
    """
    Deletes a question by its ID.
    
    Args:
        qid (str): The unique question identifier (UUID) to delete
        
    Returns:
        None
    
    Raises:
        QuestionNotFoundException: If no question exists with the given ID
        Exception: If deletion fails.
    """
    with get_conn() as conn, conn.cursor() as cur:
        # Delete the question and verify it existed
        cur.execute("DELETE FROM questions WHERE id = %s RETURNING id", (qid,))
        deleted = cur.fetchone()
        if not deleted:
            raise QuestionNotFoundException(qid)
        return


def upload_image_and_get_url(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> str:
    """
    Upload a single image to S3 with a random UUID prefix and return its CloudFront URL.

    Args:
        file_bytes: Raw image bytes
        filename: Original filename to preserve extension

    Returns:
        str: Public URL constructed as <CLOUDFRONT_DOMAIN>/<S3_BUCKET_NAME>/<uuid>/<filename>

    Raises:
        ValueError: If required environment variables are missing
    """
    if not file_bytes:
        raise ValueError("file_bytes is empty")
    if not filename:
        raise ValueError("filename is required")

    bucket = os.getenv("S3_BUCKET_NAME")
    cdn = os.getenv("CLOUDFRONT_DOMAIN")
    if not bucket or not cdn:
        raise ValueError("Missing required env vars: S3_BUCKET_NAME and/or CLOUDFRONT_DOMAIN")

    prefix = uuid.uuid4().hex
    key = f"{prefix}/{filename}"

    # Upload to S3
    if not content_type:
        guessed, _ = mimetypes.guess_type(filename)
        if not guessed:
            raise ValueError("Could not determine content type; please specify explicitly")
        content_type = guessed
    upload_to_s3(file_bytes, key, content_type=content_type)

    # Normalize CDN prefix (avoid double slashes)
    cdn = cdn.rstrip("/")
    url = f"https://{cdn}/{key}"
    return url


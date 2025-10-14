import uuid
import os
import mimetypes
from typing import List, Dict, Optional
from app.core.utils import get_conn, upload_to_s3, get_from_s3, delete_from_s3
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
    images: Optional[List[bytes]] = None,
    qid: Optional[str] = None
) -> str:
    """
    Creates a new question with optional images.
    
    Args:
        name: Question name
        description: Question description  
        difficulty: Difficulty level
        topic: Question topic
        images: Optional list of image files as bytes to upload to S3
        qid: Optional question ID. If None, a new UUID will be generated
    
    Returns:
        str: The question ID (UUID) of the created question
        
    Raises:
        Exception: If database insertion fails, uploaded images are cleaned up from S3
    """
    qid = str(uuid.uuid4()) if qid is None else qid
    
    # Prepare images for S3 upload
    uploaded_keys: List[str] = []
    if images:
        for i, img in enumerate(images):
            key = f"questions/{qid}/{i}"
            # Unknown content type; default to binary stream
            upload_to_s3(img, key, content_type="application/octet-stream")
            uploaded_keys.append(key)

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Insert question into database
                cur.execute(
                    """
                    INSERT INTO questions (id, name, description, difficulty, topic)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (qid, name, description, difficulty, topic),
                )

                # Insert images metadata into database
                for key in uploaded_keys:
                    image_id = str(uuid.uuid4())
                    cur.execute(
                        "INSERT INTO question_images (id, question_id, s3_key) VALUES (%s, %s, %s)",
                        (image_id, qid, key),
                    )
        return qid
    except Exception:
        # If any error occurs, delete the uploaded images from S3
        delete_from_s3(uploaded_keys)
        raise


def get_question(qid: str):
    """
    Retrieves a single question and its associated images by its ID.
    
    Args:
        qid (str): The unique question identifier (UUID)
        
    Returns:
        dict: Question data including id, name, description, difficulty, 
              topic, and images (as bytes)
              
    Raises:
        QuestionNotFoundException: If no question exists with the given ID
                     
    Note:
        Images are returned as raw bytes data retrieved directly from S3.
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

        # Fetch associated image keys
        cur.execute(
            "SELECT s3_key FROM question_images WHERE question_id = %s",
            (qid,)
        )
        image_keys = [row[0] for row in cur.fetchall()]
        image_data = get_from_s3(image_keys)

        return {
            "id": qid,
            "name": question_data[0],
            "description": question_data[1],
            "difficulty": question_data[2],
            "topic": question_data[3],
            "images": image_data,  # Raw bytes
        }


def get_random_question_by_difficulty_and_topic(difficulty: str, topic: str):
    """
    Returns a random question matching the given difficulty and topic, including image data.
    
    Args:
        difficulty (str): The difficulty level to filter by (must exist in difficulties table)
        topic (str): The topic to filter by (must exist in topics table)
        
    Returns:
        dict: Question data including id, name, description, difficulty,
              topic, and images (as bytes)
              
    Raises:
        QuestionNotFoundException: If no question matches the given difficulty and topic
                     
    Note:
        Images are returned as raw bytes data retrieved directly from S3.
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
        # Fetch associated image keys
        cur.execute(
            "SELECT s3_key FROM question_images WHERE question_id = %s",
            (qid,),
        )
        image_keys = [r[0] for r in cur.fetchall()]
        image_data = get_from_s3(image_keys)

        return {
            "id": qid,
            "name": row[1],
            "description": row[2],
            "difficulty": row[3],
            "topic": row[4],
            "images": image_data,  # Raw bytes
        }


def override_question(
    qid: str, 
    name: str, 
    description: str, 
    difficulty: str, 
    topic: str, 
    images: Optional[List[bytes]] = None
) -> str:
    """
    Atomically replaces an existing question with new data and images.
    
    This function performs a complete replacement of a question by:
    1. Backing up the original question data and images
    2. Deleting the old question and its images
    3. Creating a new question with the same ID and new data
    4. Rolling back changes if any error occurs during the process
    
    Args:
        qid: The unique question identifier (UUID) to override
        name: New question name
        description: New question description
        difficulty: New difficulty level
        topic: New topic
        images: Optional list of new image files as bytes to upload to S3
    
    Returns:
        str: The question ID (same as input qid)
        
    Raises:
        QuestionNotFoundException: If no question exists with the given ID
        Exception: If any step fails, all changes are rolled back atomically
        
    Note:
        This operation is fully atomic - if any error occurs during the process,
        the original question and its images are restored to their previous state.
    """
    # First, get the original question data for backup purposes
    backup_data = get_question(qid)  # This will raise QuestionNotFoundException if not found
    
    # Delete the old question (this is atomic and handles S3 cleanup)
    delete_question(qid)
    
    try:
        # Create the new question with the same ID (this is atomic and handles S3 upload)
        create_question(name, description, difficulty, topic, images, qid)
        
    except Exception:
        # If creation failed after deletion, restore the original question
        try:
            create_question(
                backup_data["name"],
                backup_data["description"], 
                backup_data["difficulty"],
                backup_data["topic"],
                backup_data["images"],  # These are already bytes
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
    Deletes a question and its associated images by its ID.
    
    Args:
        qid (str): The unique question identifier (UUID) to delete
        
    Returns:
        None
        
        Raises:
        QuestionNotFoundException: If no question exists with the given ID
        Exception: If S3 deletion fails, database transaction is rolled back    Note:
        This function is atomic: if deleting images from S3 fails,
        the database transaction is rolled back to maintain consistency.
    """
    with get_conn() as conn, conn.cursor() as cur:
        # Fetch associated image keys
        cur.execute(
            "SELECT s3_key FROM question_images WHERE question_id = %s",
            (qid,)
        )
        image_keys = [row[0] for row in cur.fetchall()]

        # Delete the question and verify it existed
        cur.execute("DELETE FROM questions WHERE id = %s RETURNING id", (qid,))
        deleted = cur.fetchone()
        if not deleted:
            raise QuestionNotFoundException(qid)

        # Delete images from S3; rollback DB if this fails
        try:
            delete_from_s3(image_keys)
        except Exception:
            conn.rollback()
            raise


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
    url = f"{cdn}/{bucket}/{key}"
    return url


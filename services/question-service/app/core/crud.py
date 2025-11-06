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

def get_questions_list(page, size, search):
    """
    Retrieves all questions from the database.
    
    Returns:
        list[dict]: A list of question data dictionaries, each including id, name, difficulty and topic
    """
    with get_conn() as conn, conn.cursor() as cur:
        offset = (page - 1) * size
        search_pattern = f"%{search}%"
        
        cur.execute(
            """
            SELECT id, name, difficulty, topic 
            FROM questions
            WHERE name ILIKE %s
            ORDER BY name
            LIMIT %s OFFSET %s
            """,
            (search_pattern, size, offset)
        )
        rows = cur.fetchall()

        questions = []
        for row in rows:
            questions.append({
                "id": str(row[0]),
                "name": row[1],
                "difficulty": row[2],
                "topic": row[3],
            })
        
        # get total count for pagination (optional)
        cur.execute(
            """
            SELECT COUNT(*)
            FROM questions
            WHERE name ILIKE %s
            """,
            (search_pattern,)
        )


        total_count = cur.fetchone()[0]

        return questions, total_count
    
def get_user_attempted_questions(userId, page, size):
    """
    Retrieves all questions that is attempted by the user from the database.
    
    Returns:
        list[dict]: A list of question data dictionaries, each including id, user_id, name, topic, difficulty and attempted_timestamp
    """
    with get_conn() as conn, conn.cursor() as cur:
        offset = (page - 1) * size
        
        cur.execute("""
            SELECT qa.id AS id,
                    q.name AS question,
                    qa.attempt_timestamp AS completionDate,
                    q.difficulty AS difficulty, 
                    q.topic AS topic,
                    qa.language AS language,
                    qa.question_id AS question_id
            FROM question_attempts qa
            JOIN questions q ON qa.question_id = q.id
            WHERE qa.user_id = %s
            ORDER BY qa.attempt_timestamp DESC
            LIMIT %s OFFSET %s
            """,
            (userId, size, offset))
        
        rows = cur.fetchall()

        questions = []
        for row in rows:
            questions.append({
                "id": str(row[0]),
                "question": row[1],
                "completionDate": row[2].strftime("%Y-%m-%d"),
                "difficulty": row[3],
                "topic": row[4],
                "language": row[5],
                "question_id": str(row[6])
            })

        cur.execute(
            """
            SELECT COUNT(*) AS total_count
            FROM question_attempts
            WHERE user_id = %s
            """, (userId,)
        )
        total_count = cur.fetchone()[0]
        
        return questions, total_count
    
def get_attempt_by_id(attempt_id: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("""
                    SELECT id, user_id, question_id, collab_id, language, attempt_timestamp, submitted_solution
                    FROM question_attempts
                    WHERE id = %s
                    """, (attempt_id,))
        row = cur.fetchone()
        if not row:
            return None
        return row

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
            "id": str(qid),
            "name": row[1],
            "description": row[2],
            "difficulty": row[3],
            "topic": row[4],
        }
    
def update_question_attempt(user_id=None, question_id=None, collab_id=None, submitted_solution=None, collaborator_id=None, language=None):
    if not all([user_id, question_id, collab_id, collaborator_id]):
        return None
    
    base_fields = ["user_id", "question_id", "collab_id", "language", "attempt_timestamp"]
    base_placeholders = ["%s", "%s", "%s", "%s","CURRENT_TIMESTAMP"]
    base_values = [user_id, question_id, collab_id, language]

    update_fields = ["attempt_timestamp = CURRENT_TIMESTAMP"]

    if submitted_solution is not None:
        base_fields.append("submitted_solution")
        base_placeholders.append("%s")
        base_values.append(submitted_solution)
        update_fields.append("submitted_solution = EXCLUDED.submitted_solution")

    conflict_target = "(user_id, question_id, collab_id)"

    def build_query():
        return f"""
            INSERT INTO question_attempts ({','.join(base_fields)})
            VALUES ({','.join(base_placeholders)})
            ON CONFLICT {conflict_target} DO UPDATE
            SET {','.join(update_fields)}
            RETURNING id, user_id, question_id, collab_id, language, attempt_timestamp, submitted_solution;
        """

    user_query = build_query()
    collaborator_query = None

    if collaborator_id:
        base_values_collab = base_values.copy()
        base_values_collab[0] = collaborator_id
        collaborator_query = build_query()

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(user_query, tuple(v for v in base_values if v not in ("CURRENT_TIMESTAMP", "NULL")))
        updated_row = cur.fetchone()

        if collaborator_query:
            cur.execute(collaborator_query, tuple(v for v in base_values_collab if v not in ("CURRENT_TIMESTAMP", "NULL")))

        conn.commit()

        if updated_row:
            return {
                "id": updated_row[0],
                "user_id": updated_row[1],
                "question_id": updated_row[2],
                "collab_id": updated_row[3],
                "language": updated_row[4],
                "attempt_timestamp": updated_row[5],
                "submitted_solution": updated_row[6]
            }
        
        return None

def get_questions_stats() -> Dict[str, int]:
    """
    Retrieves statistics about the questions in the database.
    
    Returns:
        dict: A dictionary containing count per difficulty
    """
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT difficulty, COUNT(*) 
            FROM questions 
            GROUP BY difficulty
            """
        )
        rows = cur.fetchall()

        stats = {row[0]: row[1] for row in rows}
        return stats

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


def upload_image_and_get_url(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> str:
    """
    Upload a single image to S3 with a random UUID prefix and return its CloudFront URL.

    Args:
        file_bytes: Raw image bytes
        filename: Original filename to preserve extension

    Returns:
        str: Public URL constructed as <CLOUDFRONT_DOMAIN>/<uuid>/<filename>

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


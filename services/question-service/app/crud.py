import uuid
import os
import boto3
from typing import List
from endpoint_models import createQuestion
from utils import get_conn, upload_to_s3, delete_from_s3


def list_difficulties_and_topics():
    """Returns all available difficulty levels and topics."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM difficulty_levels")
            difficulties = [row[0] for row in cur.fetchall()]

            cur.execute("SELECT * FROM topics")
            topics = [row[0] for row in cur.fetchall()]

            return {"difficulties": difficulties, "topics": topics}
        

def create_question(q: createQuestion, images: list[bytes] | None = None, qid: str = None):
    """Creates a new question. Returns the question ID."""
    qid = str(uuid.uuid4()) if qid is None else qid

    # Uplaods images to S3
    images = [] if images is None else images
    files_and_keys = [(img, f"questions/{qid}/{i}") for i, img in enumerate(images)]
    upload_to_s3(files_and_keys)

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Insert question into database
                cur.execute(
                    """
                    INSERT INTO questions (id, name, description, difficulty_level, topic)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (qid, q.name, q.description, q.difficulty_level, q.topic),
                )

                # Insert images metadata into database
                for _, key in files_and_keys:
                    image_id = str(uuid.uuid4())
                    cur.execute(
                        "INSERT INTO question_images (id, question_id, s3_key) VALUES (%s, %s, %s)",
                        (image_id, qid, key),
                    )
        return qid
    except Exception:
        # If any error occurs, delete the uploaded images from S3
        delete_from_s3([key for _, key in files_and_keys])
        raise


def _generate_presigned_get_urls(keys: List[str], expires_in: int | None = None) -> List[str]:
    if not keys:
        return []
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )
    bucket_name = os.getenv("S3_BUCKET_NAME")
    expiry = int(os.getenv("S3_PRESIGN_EXPIRES", "900")) if expires_in is None else expires_in
    urls = []
    for key in keys:
        urls.append(
            s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": key},
                ExpiresIn=expiry,
            )
        )
    return urls


def get_question(qid: str):
    """Retrieves a single question and its associated images by its ID."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            # Fetch the main question data
            cur.execute(
                "SELECT name, description, difficulty_level, topic FROM questions WHERE id = %s",
                (qid,),
            )
            question_data = cur.fetchone()

            if not question_data:
                return None

            # Fetch associated image keys
            cur.execute(
                "SELECT s3_key FROM question_images WHERE question_id = %s",
                (qid,)
            )
            # Extract keys from the fetched tuples
            image_keys = [row[0] for row in cur.fetchall()]
            image_urls = _generate_presigned_get_urls(image_keys)

            return {
                "id": qid,
                "name": question_data[0],
                "description": question_data[1],
                "difficulty_level": question_data[2],
                "topic": question_data[3],
                "images": image_urls,
            }
        

def get_random_question_by_difficulty_and_topic(difficulty: str, topic: str):
    """Returns a random question matching the given difficulty and topic, including presigned image URLs."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, description, difficulty_level, topic
                FROM questions
                WHERE difficulty_level = %s AND topic = %s
                ORDER BY RANDOM()
                LIMIT 1
                """,
                (difficulty, topic),
            )
            row = cur.fetchone()
            if not row:
                return None

            qid = row[0]
            # Fetch associated image keys
            cur.execute(
                "SELECT s3_key FROM question_images WHERE question_id = %s",
                (qid,),
            )
            image_keys = [r[0] for r in cur.fetchall()]
            image_urls = _generate_presigned_get_urls(image_keys)

            return {
                "id": qid,
                "name": row[1],
                "description": row[2],
                "difficulty_level": row[3],
                "topic": row[4],
                "images": image_urls,
            }

def delete_question(qid: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
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
                raise KeyError(f"No question found with ID '{qid}'.")

            # Delete images from S3; rollback DB if this fails
            try:
                delete_from_s3(image_keys)
            except Exception:
                conn.rollback()
                raise


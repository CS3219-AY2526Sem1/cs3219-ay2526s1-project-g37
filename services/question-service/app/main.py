from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv
from app.models.endpoint_models import QuestionBase64Images
from app.models.exceptions import QuestionNotFoundException
from app.utils import batch_convert_base64_to_bytes, batch_convert_bytes_to_base64
from app.crud import (
    create_question,
    get_question,
    get_random_question_by_difficulty_and_topic,
    override_question,
    delete_question,
    list_difficulties_and_topics
)


load_dotenv()

app = FastAPI()

@app.post("/questions")
def create_question(q: QuestionBase64Images):
    # Convert images and call CRUD with primitive types
    images_bytes = batch_convert_base64_to_bytes(q.images)
    
    new_qid = create_question(
        name=q.name,
        description=q.description, 
        difficulty=q.difficulty,
        topic=q.topic,
        images=images_bytes
    )
    
    # Get the created question and convert to response model
    return {
        "id": new_qid,
        "message": "Created successfully"
    }


@app.get("/questions/{qid}", response_model=QuestionBase64Images) 
def read_question(qid: str):
    try:
        question_dict = get_question(qid)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=f"Question {e.question_id} not found")
    return batch_convert_bytes_to_base64(question_dict)


@app.get("/questions/random")
def get_random_question(
    difficulty: str = Query(..., description="The difficulty level to filter by"),
    topic: str = Query(..., description="The topic to filter by")
):
    """Get a random question by difficulty and topic"""
    try:
        question_dict = get_random_question_by_difficulty_and_topic(difficulty, topic)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    return batch_convert_bytes_to_base64(question_dict)


@app.put("/questions/{qid}")
def update_question(qid: str, q: QuestionBase64Images):
    images_bytes = batch_convert_base64_to_bytes(q.images)
    
    try:
        override_question(
            qid=qid,
            name=q.name,
            description=q.description,
            difficulty=q.difficulty, 
            topic=q.topic,
            images=images_bytes
        )
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {
        "message": "Updated successfully"
    }


@app.delete("/questions/{qid}")
def delete_question(qid: str):
    try:
        delete_question(qid)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {
        "message": "Deleted successfully"
    }


@app.get("/metadata")
def get_metadata():
    return list_difficulties_and_topics()

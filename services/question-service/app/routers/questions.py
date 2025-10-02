from fastapi import APIRouter, HTTPException, Query
from app.models.endpoint_models import QuestionBase64Images
from app.models.exceptions import QuestionNotFoundException
from app.utils import batch_convert_base64_to_bytes, batch_convert_bytes_to_base64
from app.core.crud import (
    create_question,
    get_question,
    get_random_question_by_difficulty_and_topic,
    override_question,
    delete_question,
)

router = APIRouter(
    prefix="/questions",
    tags=["questions"]
)

@router.post("")
def create_question_endpoint(q: QuestionBase64Images):
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


@router.get("/random")
def get_random_question_endpoint(
    difficulty: str = Query(..., description="The difficulty level to filter by"),
    topic: str = Query(..., description="The topic to filter by")
):
    """Get a random question by difficulty and topic"""
    try:
        question_dict = get_random_question_by_difficulty_and_topic(difficulty, topic)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    question_dict['images'] = batch_convert_bytes_to_base64(question_dict['images'])
    return question_dict


@router.get("/{qid}", response_model=QuestionBase64Images) 
def get_question_endpoint(qid: str):
    try:
        question_dict = get_question(qid)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=f"Question {e.question_id} not found")
    question_dict['images'] = batch_convert_bytes_to_base64(question_dict['images'])
    return question_dict


@router.put("/{qid}")
def update_question_endpoint(qid: str, q: QuestionBase64Images):
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


@router.delete("/{qid}")
def delete_question_endpoint(qid: str):
    try:
        delete_question(qid)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {
        "message": "Deleted successfully"
    }
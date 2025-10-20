from fastapi import APIRouter, HTTPException, Query
from app.models.endpoint_models import QuestionRequest, Question
from app.models.exceptions import QuestionNotFoundException
from app.core.crud import (
    create_question,
    check_question_exists,
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
def create_question_endpoint(q: QuestionRequest):
    new_qid = create_question(
        name=q.name,
        description=q.description,
        difficulty=q.difficulty,
        topic=q.topic,
    )
    return {"id": new_qid, "message": "Created successfully"}


@router.post("/valid-config", response_model=bool)
def validate_question_config_endpoint(
    difficulties: list[str] = Query(..., description="List of difficulty levels"),
    topics: list[str] = Query(..., description="List of topics")
):
    """Validate if there exists at least one question for any combination of difficulty and topic"""
    return check_question_exists(difficulties, topics)


@router.get("/random", response_model=QuestionRequest)
def get_random_question_endpoint(
    difficulty: str = Query(..., description="The difficulty level to filter by"),
    topic: str = Query(..., description="The topic to filter by")
):
    """Get a random question by difficulty and topic"""
    try:
        question_dict = get_random_question_by_difficulty_and_topic(difficulty, topic)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    return question_dict


@router.get("/{qid}", response_model=Question)
def get_question_endpoint(qid: str):
    try:
        question_dict = get_question(qid)
    except QuestionNotFoundException as e:
        raise HTTPException(status_code=404, detail=f"Question {e.question_id} not found")
    return question_dict


@router.put("/{qid}")
def update_question_endpoint(qid: str, q: QuestionRequest):
    try:
        override_question(
            qid=qid,
            name=q.name,
            description=q.description,
            difficulty=q.difficulty, 
            topic=q.topic,
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
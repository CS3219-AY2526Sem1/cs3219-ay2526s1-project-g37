from typing import Dict
from fastapi import APIRouter, HTTPException, Query
from app.models.endpoint_models import QuestionBrief, QuestionRequest, Question, QuestionsList
from app.models.exceptions import QuestionNotFoundException
from app.core.crud import (
    create_question,
    check_question_exists,
    get_question,
    get_questions_stats,
    get_questions_list,
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

@router.get("", response_model=QuestionsList)
def get_questions_list_endpoint(
    page: int = Query(1, description="Page number", ge=1),
    size: int = Query(20, description="Number of items per page", ge=1, le=100),
    search: str = Query("", description="Search query to filter questions by name")
):
    """Get a list of all questions"""
    # This is a placeholder implementation. In a real scenario, you would implement pagination.
    try:
        questions_list, total_count = get_questions_list(page, size, search)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions list")
    return {"questions": questions_list, "total_count": total_count}

@router.get("/stats", response_model=Dict[str, int])
def get_questions_stats_endpoint():
    """Get statistics about questions"""
    try:
        stats = get_questions_stats()
    except Exception as e:
        raise HTTPException(status_code=499, detail="Failed to retrieve questions statistics")
    return stats

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



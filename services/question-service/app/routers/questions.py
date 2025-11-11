from typing import Dict
from fastapi import APIRouter, HTTPException, Query
from app.models.endpoint_models import QuestionRequest, Question, QuestionsList, AttemptRequest, AttemptList
from app.models.exceptions import QuestionNotFoundException
from app.core.crud import (
    create_question,
    check_question_exists,
    get_question,
    get_questions_stats,
    get_user_question_history_stats,
    get_questions_list,
    get_random_question_by_difficulty_and_topic,
    override_question,
    delete_question,
    get_user_attempted_questions,
    update_question_attempt,
    get_attempt_by_id
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

@router.get("/history", response_model=AttemptList)
def get_user_question_history(
    userId: str,
    page: int = Query(1, description="Page number", ge=1),
    size: int = Query(20, description="Number of items per page", ge=1, le=100)
):
    """Get a paginated list of questions attempted by a specific user"""
    try:
        questions_list, total_count = get_user_attempted_questions(userId, page, size)
        return {"questions": questions_list, "total_count": total_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve question history for user {userId}")
    
@router.post("/attempt")
def update_question_attempt_endpoint(payload: AttemptRequest):
    try:
        updated_attempt = update_question_attempt(
            user_id=payload.user_id,
            question_id=payload.question_id,
            collab_id=payload.collab_id,
            language=payload.language,
            collaborator_id=payload.collaborator_id,
            submitted_solution=payload.submitted_solution
        )
        if not updated_attempt:
            raise HTTPException(status_code=404, detail="Attempt not found or no fields provided")
        return{"message": "Question attempt updated successfully", "attempt": updated_attempt}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to update question attempt")
    
@router.get("/attempt/{attempt_id}")
def get_submitted_solution(attempt_id: str):
    attempt = get_attempt_by_id(attempt_id)
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")    
    return attempt

@router.get("/history/stats", response_model=Dict[str, int])
def get_user_question_history_stats_endpoint(user_id: str):
    try:
        stats = get_user_question_history_stats(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve user question history statistics")
    return stats

@router.get("/stats", response_model=Dict[str, int])
def get_questions_stats_endpoint():
    """Get statistics about questions"""
    try:
        stats = get_questions_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions statistics")
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


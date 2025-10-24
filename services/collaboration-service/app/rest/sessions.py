
from fastapi import APIRouter, HTTPException, Query
from app.schemas.collaboration import CreateSessionRequest, CreateSessionResponse
from app.core.connection_manager import connection_manager
from app.core.errors import SessionNotFoundError, UserNotFoundError
from app.schemas.questions import QuestionBase64Images

router = APIRouter()

@router.post("/", response_model=CreateSessionResponse)
def create_session(request: CreateSessionRequest):
    user_ids = request.user_ids
    question = request.question
    session_id = connection_manager.init_session(user_ids, question)
    return CreateSessionResponse(session_id=session_id)

@router.get("/{session_id}/question", response_model=QuestionBase64Images)
def get_session_question(session_id: str):
    try:
        question = connection_manager.get_question(session_id)
        return question
    except SessionNotFoundError as err:
        raise HTTPException(status_code=404, detail=err.msg)

## add query ?user_id={user_id}
@router.get("")
def get_sessions_by_user(
    user_id: str = Query(..., description="The user ID whose session_id we are looking for")
):
    session_id = connection_manager.get_session_id(user_id)
    return {"in_session": session_id != "", "session_id": session_id}

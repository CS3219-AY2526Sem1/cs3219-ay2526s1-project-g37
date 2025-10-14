
from fastapi import APIRouter, HTTPException
from app.schemas.collaboration import CreateSessionRequest, CreateSessionResponse
from app.core.connection_manager import connection_manager
from app.core.errors import SessionNotFoundError
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




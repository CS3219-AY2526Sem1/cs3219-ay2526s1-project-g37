
from fastapi import APIRouter
from app.schemas.collaboration import CreateSessionRequest, CreateSessionResponse
from app.core.connection_manager import connection_manager

router = APIRouter()

@router.post("/", response_model=CreateSessionResponse)
def create_session(request: CreateSessionRequest):
    user_ids = request.user_ids
    session_id = connection_manager.init_session(user_ids)
    return CreateSessionResponse(session_id=session_id)




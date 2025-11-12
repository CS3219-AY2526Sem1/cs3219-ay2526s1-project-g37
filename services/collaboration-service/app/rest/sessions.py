from fastapi import APIRouter, HTTPException, Query
from app.schemas.collaboration import CreateSessionRequest, CreateSessionResponse
from app.core.connection_manager import connection_manager
from app.core.errors import SessionNotFoundError, UserNotFoundError
from app.schemas.questions import QuestionBase64Images

router = APIRouter()

@router.post("/", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    """
    Create a new collaboration session
    
    Args:
        request: CreateSessionRequest with user_ids and question data
        
    Returns:
        CreateSessionResponse with the generated session_id
    """
    user_ids = request.user_ids
    question = request.question
    session_id = await connection_manager.init_session(user_ids, question)
    return CreateSessionResponse(session_id=session_id)

@router.get("/{session_id}/question", response_model=QuestionBase64Images)
async def get_session_question(session_id: str):
    """
    Get the question data for a specific session
    
    Args:
        session_id: The session ID
        
    Returns:
        QuestionBase64Images with question data and images
        
    Raises:
        HTTPException: 404 if session not found
    """
    try:
        question = await connection_manager.get_question(session_id)
        return question
    except SessionNotFoundError as err:
        raise HTTPException(status_code=404, detail=err.msg)

@router.get("")
async def get_sessions_by_user(
    user_id: str = Query(..., description="The user ID whose session_id we are looking for")
):
    """
    Get the session ID for a specific user
    
    Args:
        user_id: The user ID to look up
        
    Returns:
        Dictionary with in_session (bool) and session_id (str)
    """
    session_id = await connection_manager.get_session_id(user_id)
    return {"in_session": session_id != "", "session_id": session_id}

@router.get("/{session_id}/metadata")
async def get_session_metadata(
    session_id: str,
    user_id: str = Query(..., description="The user ID making the request"),
):
    """
    Get metadata for a specific session
    
    Args:
        session_id: The session ID
        user_id: The user ID making the request
        
    Returns:
        Dictionary with session metadata (language, created_at, collaborator_id)
        
    Raises:
        HTTPException: 404 if session not found
    """
    try:
        metadata = await connection_manager.get_session_metadata(session_id, user_id)
        return metadata
    except SessionNotFoundError as err:
        raise HTTPException(status_code=404, detail=err.msg)

from pydantic import BaseModel
from typing import Optional

class MatchRequest(BaseModel):
    user_id: str
    difficulty: str
    topic: str
    language: str

class MatchResponse(BaseModel):
    success: bool
    peer_id: Optional[str] = None
    # queue_position: Optional[int] = None
    message: Optional[str] = None
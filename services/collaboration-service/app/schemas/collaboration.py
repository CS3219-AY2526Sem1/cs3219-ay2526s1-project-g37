
from pydantic import BaseModel, conlist
from typing import List
from datetime import datetime
from .questions import QuestionBase64Images

## TODO: Finalize CreateSessionRequest and CreateSessionResponse 
## TODO: move to shared_schemas, will need to be duplicated for matching-service
class CreateSessionRequest(BaseModel):
    user_ids: List[str] = conlist(str, min_length=2, max_length=2)
    question: QuestionBase64Images
    # created_at: datetime = datetime.now()

class CreateSessionResponse(BaseModel):
    session_id: str
    # created_at: datetime

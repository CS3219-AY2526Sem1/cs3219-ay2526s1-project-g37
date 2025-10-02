
from pydantic import BaseModel, conlist
from typing import List
from datetime import datetime

## TODO: Finalize CreateSessionRequest and CreateSessionResponse 
class CreateSessionRequest(BaseModel):
    user_ids: List[str] = conlist(str, min_length=2, max_length=2)
    # created_at: datetime = datetime.now()
    ## question: Question

class CreateSessionResponse(BaseModel):
    session_id: str
    # created_at: datetime

from pydantic import BaseModel
from typing import Optional

class createQuestion(BaseModel):
    name: str
    description: str
    difficulty_level: str
    topic: str

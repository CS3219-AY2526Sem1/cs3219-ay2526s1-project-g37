from pydantic import BaseModel

from typing import Optional

class QuestionRequest(BaseModel):
    id: str
    name: str
    description: str
    difficulty: str
    topic: str
        
class Question(QuestionRequest):
    id: str

class QuestionsList(BaseModel):
    questions: list['QuestionBrief']
    total_count: int

class QuestionBrief(BaseModel):
    """Simplified question model for list views"""
    id: str
    name: str
    difficulty: str
    topic: str

class AttemptRequest(BaseModel):
    user_id: str
    question_id: str
    collab_id: str
    language: str
    collaborator_id: str
    submitted_solution: Optional[str] = None

class AttemptBrief(BaseModel):
    id: str
    question: str
    completionDate: str
    difficulty: str
    topic: str
    language: str
    question_id: str

class AttemptList(BaseModel):
    questions: list['AttemptBrief']
    total_count: int

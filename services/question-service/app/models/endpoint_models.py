from pydantic import BaseModel

class QuestionRequest(BaseModel):
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

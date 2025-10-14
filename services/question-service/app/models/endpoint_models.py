from pydantic import BaseModel


class QuestionRequest(BaseModel):
    name: str
    description: str
    difficulty: str
    topic: str
    
class Question(QuestionRequest):
    id: str

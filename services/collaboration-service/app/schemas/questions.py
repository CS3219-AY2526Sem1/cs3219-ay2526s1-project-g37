import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

## TODO: move to shared_schemas, currently duplicated from question-service
class QuestionBase64Images(BaseModel):
    """Question model with images as base64 strings - used for API requests/responses"""
    id: Optional[str] = None
    name: str
    description: str
    difficulty: str
    topic: str
    images: Optional[List[str]] = Field(default=None, description="Base64 encoded images")
    language: str
    created_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())

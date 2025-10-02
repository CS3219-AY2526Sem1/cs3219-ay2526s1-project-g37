from fastapi import APIRouter, Query
from app.core.crud import (
    add_difficulty,
    delete_difficulty,
    add_topic,
    delete_topic,
    list_difficulties_and_topics
)

router = APIRouter(
    prefix="/metadata",
    tags=["metadata"]
)

@router.get("/difficulties-topics")
def get_difficulties_topics():
    return list_difficulties_and_topics()

@router.post("/difficulties")
def add_difficulty_endpoint(difficulty: str = Query(..., description="The difficulty level to add")):
    add_difficulty(difficulty)
    return {
        "message": f"Difficulty '{difficulty}' added successfully"
    }

@router.delete("/difficulties")
def delete_difficulty_endpoint(difficulty: str = Query(..., description="The difficulty level to delete")):
    delete_difficulty(difficulty)
    return {
        "message": f"Difficulty '{difficulty}' deleted successfully"
    }

@router.post("/topics")
def add_topic_endpoint(topic: str = Query(..., description="The topic to add")):
    add_topic(topic)
    return {
        "message": f"Topic '{topic}' added successfully"
    }

@router.delete("/topics")
def delete_topic_endpoint(topic: str = Query(..., description="The topic to delete")):
    delete_topic(topic)
    return {
        "message": f"Topic '{topic}' deleted successfully"
    }
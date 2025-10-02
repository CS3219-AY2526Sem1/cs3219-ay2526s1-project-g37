# Router imports for the question service
from .questions import router as questions_router
from .labels import router as labels_router

__all__ = ["questions_router", "labels_router"]
# Router imports for the question service
from .questions import router as questions_router
from .metadata import router as metadata_router

__all__ = ["questions_router", "metadata_router"]
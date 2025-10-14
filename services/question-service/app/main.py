from fastapi import FastAPI
from dotenv import load_dotenv
from app.routers import questions_router, labels_router, images_router

load_dotenv()

app = FastAPI()

# Include routers
app.include_router(questions_router)
app.include_router(labels_router)
app.include_router(images_router)

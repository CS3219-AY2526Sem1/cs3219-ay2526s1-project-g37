import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ws import sessions as ws_sessions
from app.rest import sessions
from app.redis_client import RedisClient
from app.core.connection_manager import connection_manager
from dotenv import load_dotenv

DEFAULT_CORS_ORIGINS = "http://localhost:5173"

load_dotenv()  # Load environment variables from .env file

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Initialize Redis connection on startup"""
    print("Initializing Redis connection...")
    await RedisClient.get_client()
    print("Redis connection established")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    print("Cleaning up resources...")
    await connection_manager.cleanup()
    await RedisClient.close()
    print("Resources cleaned up")

app.include_router(sessions.router, prefix="/sessions")
app.include_router(ws_sessions.router, prefix="/ws/sessions")

origins = os.getenv("COLLAB_CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
print(f"Allowed CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "Healthy"}

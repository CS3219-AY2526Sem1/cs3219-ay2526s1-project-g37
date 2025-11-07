import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ws import sessions as ws_sessions
from app.rest import sessions
from dotenv import load_dotenv

DEFAULT_CORS_ORIGINS = "http://localhost:5173"

load_dotenv()  # Load environment variables from .env file

app = FastAPI()
app.include_router(sessions.router, prefix="/sessions")
app.include_router(ws_sessions.router, prefix="/ws/sessions")

origins = os.getenv("COLLAB_CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
print(f"Allowed CORS origins:  {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # List of allowed origins
    allow_credentials=True,         # Allow cookies/authorization headers
    allow_methods=["*"],            # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],            # Allow all headers
)

## API for testing connection
@app.get("/health")
def health_check():
    return {"status": "Healthy"}

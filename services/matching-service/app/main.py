from fastapi import FastAPI
from app.routers import match
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

DEFAULT_CORS_ORIGINS = "http://localhost:5173"

load_dotenv()  

app = FastAPI(title="Matching Service")

origins = os.getenv("MATCHING_CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
print(f"Allowed CORS origins:  {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match.router, prefix="/match", tags=["Match"])

@app.get("/")
async def matchingService():
    return {"Welcome to Matching Service"}

@app.get("/health")
async def health_check():
    return {"status": "Healthy"}

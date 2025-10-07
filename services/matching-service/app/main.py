from fastapi import FastAPI
from app.routers import match
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Matching Service")

origins = [
    "http://localhost",
    "http://localhost:5173",
]

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
from fastapi import FastAPI
from app.routers import match

app = FastAPI(title="Matching Service")

app.include_router(match.router, prefix="/match", tags=["Match"])

@app.get("/health")
async def health_check():
    return {"status": "Healthy"}
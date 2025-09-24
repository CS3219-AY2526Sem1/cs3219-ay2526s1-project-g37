from fastapi import FastAPI
from app.routers import hello

app = FastAPI()

app.include_router(hello.router)

@app.get("/")
def root():
    return {"message": "Matching Service is running"}
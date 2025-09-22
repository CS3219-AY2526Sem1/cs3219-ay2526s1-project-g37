from fastapi import FastAPI
from app.ws import sessions as ws_sessions
from app.rest import sessions

app = FastAPI()
app.include_router(sessions.router, prefix="/sessions")
app.include_router(ws_sessions.router, prefix="/ws/sessions")

## API for testing connection
@app.get("/ping")
def ping():
    return {"message": "Pong"}

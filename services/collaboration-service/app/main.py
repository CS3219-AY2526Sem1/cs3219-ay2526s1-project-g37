from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ws import sessions as ws_sessions
from app.rest import sessions

app = FastAPI()
app.include_router(sessions.router, prefix="/sessions")
app.include_router(ws_sessions.router, prefix="/ws/sessions")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",        ## TODO: remove for production, keeping for testing purposes
]

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

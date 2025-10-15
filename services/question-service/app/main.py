from fastapi import FastAPI
from dotenv import load_dotenv
from app.routers import questions_router, labels_router, images_router
from fastapi.middleware.cors import CORSMiddleware  

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # List of allowed origins
    allow_credentials=True,         # Allow cookies/authorization headers
    allow_methods=["*"],            # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],            # Allow all headers
)

# Include routers
app.include_router(questions_router)
app.include_router(labels_router)
app.include_router(images_router)

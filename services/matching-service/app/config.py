from dotenv import load_dotenv
import os

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
QUESTION_SERVICE_URL = os.getenv("QUESTION_SERVICE_URL")
COLLAB_SERVICE_URL = os.getenv("COLLAB_SERVICE_URL")

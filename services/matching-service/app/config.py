from dotenv import load_dotenv
import os

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)  # For AWS ElastiCache with auth
REDIS_TLS = os.getenv("REDIS_TLS", "false").lower() == "true"  # Enable for TLS endpoints
QUESTION_SERVICE_URL = os.getenv("QUESTION_SERVICE_URL")
COLLAB_SERVICE_URL = os.getenv("COLLAB_SERVICE_URL")

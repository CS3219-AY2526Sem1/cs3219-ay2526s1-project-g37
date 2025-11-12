import redis.asyncio as redis
import os
from typing import Optional

class RedisClient:
    _instance: Optional[redis.Redis] = None
    
    @classmethod
    async def get_client(cls) -> redis.Redis:
        """Get or create Redis client singleton"""
        if cls._instance is None:
            cls._instance = redis.Redis(
                host=os.getenv("COLLAB_REDIS_HOST", "localhost"),
                port=int(os.getenv("COLLAB_REDIS_PORT", "6379")),
                db=int(os.getenv("COLLAB_REDIS_DB", "1")),
                password=os.getenv("COLLAB_REDIS_PASSWORD", None),
                decode_responses=True,  # Automatically decode responses to strings
            )
        return cls._instance
    
    @classmethod
    async def close(cls):
        """Close Redis connection"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None

import redis
import json
import time
from app.config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS

# Redis connection with support for AWS ElastiCache (with auth/TLS) and local Redis
r = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,  # None for local, password for AWS ElastiCache
    db=0,
    decode_responses=True,
    ssl=REDIS_TLS,  # True for ElastiCache with in-transit encryption
    ssl_cert_reqs=None if REDIS_TLS else None  # Skip cert verification if TLS enabled
)

def _queue_key(difficulty: str, topic: str, language: str) -> str:
    return f"match_queue:{difficulty}:{topic}:{language}"

def enqueue_user(difficulty: str, topic: str, language: str, user_id: str):
    key = _queue_key(difficulty, topic, language)
    # add to the end of the queue
    r.rpush(key, user_id)
    r.hset("match_timestamps", user_id, int(time.time()))

def dequeue_user(difficulty: str, topic: str, language: str, current_user_id: str):
    key = _queue_key(difficulty, topic, language)

    while True:
        user_id = r.lpop(key)
        if user_id is None:
            return None
        if user_id != current_user_id:
            r.hdel("match timestamps", user_id)
            return user_id

def get_queue_position(difficulty: str, topic: str, language: str, user_id: str):
    key = _queue_key(difficulty, topic, language)
    queue = r.lrange(key, 0, -1)
    try:
        return queue.index(user_id) + 1
    except ValueError:
        return None
    
def remove_user(difficulty: str, topic: str, language: str, user_id: str):
    key = _queue_key(difficulty, topic, language)
    removed = r.lrem(key, 0, user_id)
    r.hdel("match_timestamps", user_id)
    return removed > 0

def get_user_join_time(user_id: str):
    ts = r.hget("match_timestamps", user_id)
    return int(ts) if ts else None

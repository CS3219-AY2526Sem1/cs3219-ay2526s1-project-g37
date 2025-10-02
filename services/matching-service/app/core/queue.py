import redis
import json
import time

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def _queue_key(difficulty: str, topic: str, language: str) -> str:
    return f"match_queue:{difficulty}:{topic}:{language}"

def enqueue_user(difficulty: str, topic: str, language: str, user_id: str):
    key = _queue_key(difficulty, topic, language)
    # add to the end of the queue
    r.rpush(key, user_id)
    r.hset("match_timestamps", user_id, int(time.time()))

def dequeue_user(difficulty: str, topic: str, language: str):
    key = _queue_key(difficulty, topic, language)
    # pop from the front (FIFO)
    user_id = r.lpop(key)
    if user_id:
        r.hdel("match_timestamps", user_id)
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
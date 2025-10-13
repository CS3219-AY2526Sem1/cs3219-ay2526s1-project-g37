from app.models.match import MatchRequest, MatchResponse
from app.core import queue
import asyncio
import httpx
from fastapi import HTTPException
import os
from app.core.websocket_manager import manager
from app.config import QUESTION_SERVICE_URL, COLLAB_SERVICE_URL

TIMEOUT_SECONDS = 60

async def fetch_question(difficulty: str, topic: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"http://{QUESTION_SERVICE_URL}/questions/random",
            params={"difficulty": difficulty, "topic": topic},
            timeout=10.0
        )
        resp.raise_for_status()
        return resp.json()
    
async def create_session(user_ids: list[str], question_data: dict):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"http://{COLLAB_SERVICE_URL}/sessions/",
            json={
                "user_ids": user_ids,
                "question": question_data},
            timeout=10.0
        )
        resp.raise_for_status()
        return resp.json()["session_id"]

class MatchingService:

    @staticmethod
    async def join_queue(request: MatchRequest) -> MatchResponse:
        difficulty = request.difficulty
        topic = request.topic
        language = request.language
        user_id = request.user_id

        peer_id = queue.dequeue_user(difficulty, topic, language, user_id)

        # suitable match
        if peer_id:
            question_data = None
            session_id = None

            try:
                question_data = await fetch_question(difficulty, topic)
                session_id = await create_session([user_id, peer_id], question_data)
                print(f"Session {session_id} started")

                await manager.send_event(user_id, "match.found", {"peer_id": peer_id, "session_id": session_id, "question": question_data})
                await manager.send_event(peer_id, "match.found", {"peer_id": user_id, "session_id": session_id, "question": question_data})

                return MatchResponse(success=True, peer_id=peer_id, message="Peer found")
            except Exception as e:
                print(f"Error initialising match: {e}")
                raise HTTPException(status_code=500, detail="Failed to initialise match")
        else:
            # no suitable match
            queue.enqueue_user(difficulty, topic, language, user_id)
            position = queue.get_queue_position(difficulty, topic, language, user_id)

            return MatchResponse(
                success=True,
                message="Added to queue",
                # queue_position=position
            )
        
    @staticmethod
    def cancel_queue(request: MatchRequest) -> MatchResponse:
        removed = queue.remove_user(request.difficulty, request.topic, request.language, request.user_id)
        if removed:
            return MatchResponse(success=True, message="Removed from queue")
        else:
            return MatchResponse(success=False, message="User not in queue")

    @staticmethod
    async def check_timeouts(request: MatchRequest):
        await asyncio.sleep(TIMEOUT_SECONDS)
        position = queue.get_queue_position(request.difficulty, request.topic, request.language, request.user_id)

        if position is not None:
            queue.remove_user(request.difficulty, request.topic, request.language, request.user_id)
            print(f"Timeout: Removed user {request.user_id} from queue after {TIMEOUT_SECONDS}")
            
            # send WebSocket event timeout
            await manager.send_event(
                request.user_id,
                "match.timeout",
                {"message": f"Timeout after {TIMEOUT_SECONDS} seconds, removed from queue"}
            )

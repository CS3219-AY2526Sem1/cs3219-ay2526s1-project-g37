from app.models.match import MatchRequest, MatchResponse
import uuid
from app.services import queue
import time
import asyncio
from app.services.websocket_manager import manager

TIMEOUT_SECONDS = 60

class MatchingService:

    @staticmethod
    async def join_queue(request: MatchRequest) -> MatchResponse:
        difficulty = request.difficulty
        topic = request.topic
        language = request.language
        user_id = request.user_id

        peer_id = queue.dequeue_user(difficulty, topic, language)

        # suitable match
        if peer_id:
            await manager.send_event(user_id, "match.found", {"peer_id": peer_id})
            await manager.send_event(peer_id, "match.found", {"peer_id": user_id})

            # TODO: Initialise collaboration session and assign question

            return MatchResponse(success=True, peer_id=peer_id, message="Peer found")
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
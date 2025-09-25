from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from app.models.match import MatchResponse, MatchRequest
from app.services.matching import MatchingService
from app.services.websocket_manager import manager

router = APIRouter()

@router.post("/request", response_model=MatchResponse)
async def request_match(request: MatchRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(MatchingService.check_timeouts, request)
    response = await MatchingService.join_queue(request)
    return response

@router.post("/cancel", response_model=MatchResponse)
async def cancel_match(request: MatchRequest):
    return MatchingService.cancel_queue(request)

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(user_id)
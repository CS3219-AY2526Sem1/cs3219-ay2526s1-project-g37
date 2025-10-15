from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from app.core.connection_manager import connection_manager
from app.core.users import UserState
from app.schemas.messages import CollaboratorEndedMessage, Message, CollaboratorConnectMessage, CollaboratorDisconnectMessage, DisplayMessage

from datetime import datetime
import asyncio
import json

router = APIRouter()

@router.get("/ping")
def ping():
    return {"message": "Pong from ws"}

@router.websocket("/{session_id}")
async def websocket_endpoint(ws: WebSocket, session_id: str, user_id: str = Query(...)):
    user_status = UserState.AWAIT_CONNECT
    in_q = asyncio.Queue()

    print(f"WebSocket connection request for session_id: {session_id}, user_id: {user_id}")
    
    try:   
        await connection_manager.on_connect(session_id, user_id, in_q)
    except ValueError as e:
        print(f"Connection not initialized: {e}")
        return
    
    await ws.accept()

    async def receiver():
        try:
            while True:
                msg = await ws.receive_text()
                print(msg)

                json_msg = json.loads(msg)
                if json_msg.get("type") == "collaborator_ended":
                    payload = CollaboratorEndedMessage()
                    await connection_manager.on_session_ended(session_id)

                await connection_manager.on_message(session_id, user_id, payload)
        except WebSocketDisconnect:
            try:
                await connection_manager.on_disconnect(session_id, user_id)
            except ValueError as e:
                print(f"Error handling disconnect: {e}")

    receiver_task = asyncio.create_task(receiver())

    try:
        while True:
            msg = await in_q.get()

            if isinstance(msg, CollaboratorConnectMessage):
                user_status = UserState.AWAIT_POLLING
                await ws.send_text(json.dumps(msg.model_dump()))
            elif isinstance(msg, CollaboratorDisconnectMessage):
                user_status = UserState.AWAIT_CONNECT
                await ws.send_text(json.dumps(msg.model_dump()))
            elif isinstance(msg, CollaboratorEndedMessage):
                user_status = UserState.AWAIT_CONNECT
                await ws.send_text(json.dumps(msg.model_dump()))
            elif isinstance(msg, DisplayMessage):
                await ws.send_text(json.dumps(msg.model_dump()))
            else:
                await ws.send_text(f"Unknown message type received.")

            await asyncio.sleep(0.1)

    # except WebSocketDisconnect as e:
    #     try:
    #         print("handle disconnect")
    #         await connection_manager.on_disconnect(session_id, user_id)
    #     except ValueError as e:
    #         print(f"Error handling disconnect: {e}")
    finally:
        receiver_task.cancel()


















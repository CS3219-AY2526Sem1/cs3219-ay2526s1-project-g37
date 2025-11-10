from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from app.core.connection_manager import connection_manager
from app.core.users import UserState
from app.core.code_execution_client import code_execution_client
from app.schemas.messages import (
    CollaboratorEndedMessage,
    CollaboratorConnectMessage,
    CollaboratorDisconnectMessage,
    DisplayMessage,
    RunCodeMessage,
    CodeRunningMessage,
    CodeResultMessage,
)

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
                msg_type = json_msg.get("type")
                
                if msg_type == "collaborator_ended":
                    payload = CollaboratorEndedMessage()
                    await connection_manager.on_message(session_id, user_id, payload)
                    await connection_manager.on_session_ended(session_id)
                
                elif msg_type == "run_code":
                    run_code_msg = RunCodeMessage(**json_msg)
                    
                    # Send "code running" message to both users
                    running_msg = CodeRunningMessage()
                    await connection_manager.broadcast_to_session(session_id, running_msg)
                    
                    # Execute code asynchronously
                    asyncio.create_task(code_execution_client.execute_and_broadcast_result(
                        session_id=session_id,
                        language=run_code_msg.language,
                        code=run_code_msg.code,
                        stdin=run_code_msg.stdin,
                        timeout=run_code_msg.timeout
                    ))
                
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
            elif isinstance(msg, CodeRunningMessage):
                await ws.send_text(json.dumps(msg.model_dump()))
            elif isinstance(msg, CodeResultMessage):
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


















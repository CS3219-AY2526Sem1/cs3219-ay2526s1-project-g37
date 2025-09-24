from typing import Dict
from fastapi import WebSocket, WebSocketDisconnect
import uuid 
import asyncio
from app.schemas.messages import CollaboratorConnectMessage, CollaboratorDisconnectMessage, DisplayMessage

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, asyncio.Queue]] = {}
        self.condition = asyncio.Condition()
    
    def init_session(self, user_ids: list[str]) -> str:
        if len(user_ids) != 2:
            raise ValueError("user_ids must contain exactly two user IDs.")
        session_id = self.generate_uuid(user_ids[0], user_ids[1])

        self.active_connections[session_id] = {}
        for user_id in user_ids:
            self.active_connections[session_id][user_id] = None
        return session_id
    
    def _get_collaborator_q(self, session_id, user_id):
        session_data = self.active_connections[session_id]
        id = next((uid for uid in session_data if uid != user_id), None)
        if id is None:
            return None
        return session_data[id]
        
    async def on_connect(self, session_id: str, user_id: str, out_q: asyncio.Queue):
        if session_id not in self.active_connections:
            raise ValueError("Session not initialized")

        if user_id not in self.active_connections[session_id]:
            raise ValueError("user_id not available in this session")
    
        self.active_connections[session_id][user_id] = out_q

        collaborator_q = self._get_collaborator_q(session_id, user_id)

        if collaborator_q is None:
            return None
        
        ## Notify collaborator that this user has connected
        await collaborator_q.put(CollaboratorConnectMessage())
        
        ## Notify this user that the other user has already connected
        await out_q.put(CollaboratorConnectMessage())

    async def on_disconnect(self, session_id: str, user_id: str):
        if session_id not in self.active_connections:
            raise ValueError("Session not initialized")

        if user_id not in self.active_connections[session_id]:
            raise ValueError("user_id not available in this session")
        
        self.active_connections[session_id][user_id] = None

        collaborator_q = self._get_collaborator_q(session_id, user_id)

        if collaborator_q is None:
            return None
        
        await collaborator_q.put(CollaboratorDisconnectMessage())

    async def on_message(self, session_id: str, user_id: str, msg: str):
        collaborator_q = self._get_collaborator_q(session_id, user_id)

        if collaborator_q is None:
            return None

        await collaborator_q.put(DisplayMessage(msg=msg))

    def generate_uuid(self, user1: str, user2: str) -> str:
        namespace = uuid.NAMESPACE_DNS  # or uuid.NAMESPACE_URL, etc.
        seed = ''.join(sorted([user1, user2]))
        return str(uuid.uuid5(namespace, seed))

    # async def connect(self, session_id: str, user_id: str, ws: WebSocket):
    #     if session_id not in self.active_connections:
    #         raise ValueError("Session not initialized.")
        
    #     if user_id not in self.active_connections[session_id]:
    #         raise ValueError("user_id not recognized in this session.")

    #     await ws.accept()
    #     self.active_connections[session_id][user_id] = ws

    #     # Notify any waiting coroutines that a user has connected
    #     async with self.condition:
    #         self.condition.notify_all()

    #     return None 
    
    # async def await_collaborator_ws(self, session_id: str, user_id: str) -> WebSocket | None:
    #     if session_id not in self.active_connections:
    #         raise ValueError("Session not initialized.")

    #     session_data = self.active_connections[session_id]
    #     collaborator_id = next((uid for uid in session_data if uid != user_id), None)

    #     user_ws = session_data[user_id]
    #     collaborator_ws = session_data[collaborator_id]

    #     try:
    #         if collaborator_ws is None:
    #             async with self.condition:
    #                 await user_ws.send_text(f"Waiting for collaborator {collaborator_id} to connect...")
    #                 await self.condition.wait_for(lambda: session_data[collaborator_id] is not None)
    #                 await user_ws.send_text(f"Collaborator {collaborator_id} connected!")
    #                 collaborator_ws = session_data[collaborator_id]
    #     except Exception as e:
    #         print(f"Error while waiting for collaborator: {e}")
    #         return None
            
    #     return session_data[collaborator_id]

    # async def disconnect(self, session_id: str, user_id: str):
    #     if session_id not in self.active_connections:
    #         return
        
    #     session_data = self.active_connections[session_id]

    #     ws = session_data[user_id]
    #     session_data[user_id] = None

    #     # Notify any waiting coroutines that a user has disconnected
    #     async with self.condition:
    #         self.condition.notify_all()

    #     if ws:
    #         try:
    #             await ws.close()
    #         except Exception:
    #             pass

    # def get_active_connections(self, session_id: str):
    #     return self.active_connections.get(session_id, {})
  

connection_manager = ConnectionManager()

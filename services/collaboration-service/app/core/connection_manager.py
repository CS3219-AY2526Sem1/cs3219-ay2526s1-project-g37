from typing import Dict
import uuid 
import asyncio
from app.schemas.messages import CollaboratorConnectMessage, CollaboratorDisconnectMessage, DisplayMessage
from app.core.errors import SessionNotFoundError, UserNotFoundError, InvalidUserIDsError

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, asyncio.Queue]] = {}
        self.condition = asyncio.Condition()
    
    def init_session(self, user_ids: list[str]) -> str:
        if len(user_ids) != 2:
            raise InvalidUserIDsError()
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
            raise SessionNotFoundError()

        if user_id not in self.active_connections[session_id]:
            raise UserNotFoundError()

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
            raise SessionNotFoundError()

        if user_id not in self.active_connections[session_id]:
            raise UserNotFoundError()

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
        namespace = uuid.NAMESPACE_DNS  
        seed = ''.join(sorted([user1, user2]))
        return str(uuid.uuid5(namespace, seed))


connection_manager = ConnectionManager()

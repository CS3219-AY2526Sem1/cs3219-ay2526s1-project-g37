from typing import Dict
import uuid 
import asyncio
from app.schemas.messages import CollaboratorConnectMessage, CollaboratorDisconnectMessage, DisplayMessage, Message
from app.core.errors import SessionNotFoundError, UserNotFoundError, InvalidUserIDsError
from app.schemas.questions import QuestionBase64Images

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, asyncio.Queue]] = {}
        self.questions: Dict[str, QuestionBase64Images] = {}
        self.user_sessions: Dict[str, str] = {}
        self.condition = asyncio.Condition()

    def init_session(self, user_ids: list[str], question: QuestionBase64Images) -> str:
        if len(user_ids) != 2:
            raise InvalidUserIDsError()
        session_id = self.generate_uuid(user_ids[0], user_ids[1])

        self.active_connections[session_id] = {}
        self.questions[session_id] = question
        for user_id in user_ids:
            self.user_sessions[user_id] = session_id
            if self.active_connections[session_id].get(user_id) is None:
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
    
    async def on_session_ended(self, session_id: str):
        if session_id not in self.active_connections:
            raise SessionNotFoundError()

        users = self.active_connections.pop(session_id, None)
        self.questions.pop(session_id, None)
        for user_id in users:
            del self.user_sessions[user_id]
        
    async def on_message(self, session_id: str, user_id: str, msg: Message):
        collaborator_q = self._get_collaborator_q(session_id, user_id)

        if collaborator_q is None:
            return None

        await collaborator_q.put(msg)

    def generate_uuid(self, user1: str, user2: str) -> str:
        namespace = uuid.NAMESPACE_DNS  
        seed = ''.join(sorted([user1, user2]))
        return str(uuid.uuid5(namespace, seed))
    
    def get_question(self, session_id: str) -> QuestionBase64Images:
        if session_id not in self.questions:
            raise SessionNotFoundError()
        return self.questions[session_id]
    
    def get_session_id(self, user_id: str) -> str:
        if user_id not in self.user_sessions:
            return ""
        return self.user_sessions[user_id]
    
    def get_session_metadata(self, session_id: str):
        if session_id not in self.questions:
            raise SessionNotFoundError()
        return {
            "language": self.questions[session_id].language,
            "created_at": self.questions[session_id].created_at
        }

    def __str__(self):
        return f"ConnectionManager(active_connections={self.active_connections}, questions={self.questions}, user_sessions={self.user_sessions})"




connection_manager = ConnectionManager()

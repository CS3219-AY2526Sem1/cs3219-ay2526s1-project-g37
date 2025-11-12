from typing import Dict, Optional
import uuid 
import asyncio
import json
from app.schemas.messages import CollaboratorConnectMessage, CollaboratorDisconnectMessage, DisplayMessage, Message
from app.core.errors import SessionNotFoundError, UserNotFoundError, InvalidUserIDsError
from app.schemas.questions import QuestionBase64Images
from app.redis_client import RedisClient

class ConnectionManager:
    def __init__(self):
        # Local in-memory queues per WebSocket connection (per instance)
        self.active_connections: Dict[str, Dict[str, asyncio.Queue]] = {}
        
        # Redis pubsub for cross-instance communication
        self.pubsub = None
        self.pubsub_task = None
        self.condition = asyncio.Condition()

    async def _get_redis(self):
        """Get Redis client"""
        return await RedisClient.get_client()
    
    async def _init_pubsub(self):
        """Initialize Redis Pub/Sub listener"""
        if self.pubsub is None:
            redis = await self._get_redis()
            self.pubsub = redis.pubsub()
            self.pubsub_task = asyncio.create_task(self._pubsub_listener())
    
    async def _pubsub_listener(self):
        """Listen for messages from Redis Pub/Sub"""
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        session_id = data.get("session_id")
                        exclude_user = data.get("exclude_user")
                        msg_data = data.get("payload")
                        
                        # Reconstruct message object
                        msg_type = msg_data.get("type")
                        if msg_type == "collaborator_connect":
                            msg = CollaboratorConnectMessage(**msg_data)
                        elif msg_type == "collaborator_disconnect":
                            msg = CollaboratorDisconnectMessage(**msg_data)
                        elif msg_type == "display":
                            msg = DisplayMessage(**msg_data)
                        else:
                            continue
                        
                        # Deliver to local connections in this instance
                        if session_id in self.active_connections:
                            for user_id, queue in self.active_connections[session_id].items():
                                if user_id != exclude_user and queue is not None:
                                    await queue.put(msg)
                    except Exception as e:
                        print(f"Error processing pubsub message: {e}")
        except Exception as e:
            print(f"Pubsub listener error: {e}")

    async def init_session(self, user_ids: list[str], question: QuestionBase64Images) -> str:
        """
        Initialize a new session in Redis
        
        Args:
            user_ids: List of two user IDs
            question: Question data with base64 images
            
        Returns:
            The generated session ID
        """
        if len(user_ids) != 2:
            raise InvalidUserIDsError()
        
        redis = await self._get_redis()
        session_id = self.generate_uuid(user_ids[0], user_ids[1])
        session_key = f"session:{session_id}"

        # Store session info in Redis
        await redis.hset(session_key, mapping={
            "created_at": question.created_at,
            "user_count": "2"
        })
        await redis.expire(session_key, 3600)  # 1 hour TTL

        # Store users in session
        for user_id in user_ids:
            await redis.hset(f"{session_key}:users", user_id, "initialized")
            await redis.set(f"user:{user_id}:session", session_id, ex=3600)
        
        # Store question data
        question_data = question.dict(exclude={"images"})
        await redis.hset(f"{session_key}:question", mapping=question_data)
        
        # Store images
        if question.images:
            for img_id, img_data in enumerate(question.images):
                await redis.hset(f"{session_key}:question_images", str(img_id), img_data)
        
        await redis.expire(f"{session_key}:question", 3600)
        await redis.expire(f"{session_key}:question_images", 3600)
        
        # Initialize local connections
        self.active_connections[session_id] = {}
        for user_id in user_ids:
            self.active_connections[session_id][user_id] = None
        
        return session_id
    
    async def _get_collaborator_q(self, session_id: str, user_id: str):
        """
        Get the collaborator's queue and user ID
        
        Args:
            session_id: The session ID
            user_id: The current user's ID
            
        Returns:
            Tuple of (queue, collaborator_user_id) or (None, None)
        """
        redis = await self._get_redis()
        session_key = f"session:{session_id}"
        
        # Get all users from Redis
        users = await redis.hkeys(f"{session_key}:users")
        
        # Find collaborator
        collaborator_id = next((uid for uid in users if uid != user_id), None)
        if collaborator_id is None:
            return None, None
        
        # Get local queue if exists
        if session_id in self.active_connections:
            queue = self.active_connections[session_id].get(collaborator_id)
            return queue, collaborator_id
        
        return None, collaborator_id
        
    async def on_connect(self, session_id: str, user_id: str, out_q: asyncio.Queue):
        """
        Handle user connection to a session
        
        Args:
            session_id: The session ID
            user_id: The user ID connecting
            out_q: The output queue for this connection
        """
        redis = await self._get_redis()
        await self._init_pubsub()
        
        session_key = f"session:{session_id}"
        
        # Check if session exists
        if not await redis.exists(session_key):
            raise SessionNotFoundError()

        # Check if user is part of this session
        if not await redis.hexists(f"{session_key}:users", user_id):
            raise UserNotFoundError()

        # Subscribe to session channel
        channel = f"session:{session_id}:channel"
        current_channels = []
        if self.pubsub:
            try:
                channels = self.pubsub.channels
                if hasattr(channels, 'keys'):
                    current_channels = list(channels.keys())
                else:
                    current_channels = channels
                current_channels = [
                    ch.decode() if isinstance(ch, bytes) else ch 
                    for ch in current_channels
                ]
            except:
                pass
        
        if channel not in current_channels:
            await self.pubsub.subscribe(channel)

        # Update connection status in Redis
        await redis.hset(f"{session_key}:users", user_id, "connected")
        
        # Store in local connections
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
        self.active_connections[session_id][user_id] = out_q

        # Get collaborator
        collaborator_q, _ = await self._get_collaborator_q(session_id, user_id)

        if collaborator_q is None:
            return None
        
        # Notify collaborator that this user has connected
        connect_msg = CollaboratorConnectMessage()
        await collaborator_q.put(connect_msg)
        
        # Also broadcast via Redis for other instances
        await self.broadcast_message(session_id, connect_msg, exclude_user=user_id)
        
        # Notify this user that the other user has already connected
        await out_q.put(CollaboratorConnectMessage())

    async def on_disconnect(self, session_id: str, user_id: str):
        """
        Handle user disconnect from a session
        
        Args:
            session_id: The session ID
            user_id: The user ID disconnecting
        """
        redis = await self._get_redis()
        session_key = f"session:{session_id}"
        
        # Check if session exists
        if not await redis.exists(session_key):
            raise SessionNotFoundError()

        # Check if user is part of this session
        if not await redis.hexists(f"{session_key}:users", user_id):
            raise UserNotFoundError()

        # Update connection status in Redis
        await redis.hset(f"{session_key}:users", user_id, "disconnected")
        
        # Remove from local connections
        if session_id in self.active_connections:
            if user_id in self.active_connections[session_id]:
                self.active_connections[session_id][user_id] = None

        # Get collaborator
        collaborator_q, _ = await self._get_collaborator_q(session_id, user_id)

        if collaborator_q is None:
            return None
        
        # Notify collaborator
        disconnect_msg = CollaboratorDisconnectMessage()
        await collaborator_q.put(disconnect_msg)
        
        # Broadcast via Redis
        await self.broadcast_message(session_id, disconnect_msg, exclude_user=user_id)
    
    async def on_session_ended(self, session_id: str):
        """
        Handle session end and cleanup
        
        Args:
            session_id: The session ID
        """
        redis = await self._get_redis()
        session_key = f"session:{session_id}"
        
        # Check if session exists
        if not await redis.exists(session_key):
            raise SessionNotFoundError()

        # Get all users
        users = await redis.hkeys(f"{session_key}:users")
        
        # Clean up Redis
        await redis.delete(
            session_key,
            f"{session_key}:users",
            f"{session_key}:question",
            f"{session_key}:question_images"
        )
        
        # Remove user session mappings
        for user_id in users:
            await redis.delete(f"user:{user_id}:session")
        
        # Unsubscribe from channel
        channel = f"session:{session_id}:channel"
        if self.pubsub:
            await self.pubsub.unsubscribe(channel)
        
        # Clean up local connections
        self.active_connections.pop(session_id, None)
    
    async def on_message(self, session_id: str, user_id: str, msg: Message):
        """
        Handle message from a user and broadcast to collaborator
        
        Args:
            session_id: The session ID
            user_id: The user ID sending the message
            msg: The message to send
        """
        # Get collaborator locally
        collaborator_q, _ = await self._get_collaborator_q(session_id, user_id)

        if collaborator_q is not None:
            await collaborator_q.put(msg)
        
        # Broadcast via Redis for cross-instance delivery
        await self.broadcast_message(session_id, msg, exclude_user=user_id)

    async def broadcast_message(self, session_id: str, msg: Message, exclude_user: str = None):
        """Broadcast message to all users in session (local + remote)"""
        
        # Local delivery
        if session_id in self.active_connections:
            for user_id, queue in self.active_connections[session_id].items():
                if user_id != exclude_user and queue is not None:
                    await queue.put(msg)
        
        # Redis delivery
        print(f"[broadcast_message] Publishing to Redis")
        await self._broadcast_message(session_id, msg, exclude_user)

    async def _broadcast_message(self, session_id: str, msg: Message, exclude_user: str = None):
        """
        Broadcast message via Redis Pub/Sub
        
        Args:
            session_id: The session ID
            msg: The message to broadcast
            exclude_user: User ID to exclude from broadcast
        """
        redis = await self._get_redis()
        channel = f"session:{session_id}:channel"
        
        payload = {
            "session_id": session_id,
            "exclude_user": exclude_user,
            "payload": msg.model_dump()
        }
        
        await redis.publish(channel, json.dumps(payload))

    def generate_uuid(self, user1: str, user2: str) -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())
    
    async def get_question(self, session_id: str) -> QuestionBase64Images:
        """
        Get question data for a session from Redis
        
        Args:
            session_id: The session ID
            
        Returns:
            QuestionBase64Images object
        """
        redis = await self._get_redis()
        session_key = f"session:{session_id}"
        
        # Check if session exists
        if not await redis.exists(session_key):
            raise SessionNotFoundError()
        
        # Get question data
        question_data = await redis.hgetall(f"{session_key}:question")
        if not question_data:
            raise SessionNotFoundError()
        
        # Get images
        images = await redis.hgetall(f"{session_key}:question_images")
        
        # Reconstruct QuestionBase64Images
        return QuestionBase64Images(
            id=question_data.get("id", ""),
            name=question_data.get("name", ""),
            description=question_data.get("description", ""),
            difficulty=question_data.get("difficulty", ""),
            topic=question_data.get("topic", ""),
            language=question_data.get("language", ""),
            created_at=question_data.get("created_at", ""),
            images=list(images.values()) if images else None
        )
    
    async def get_session_id(self, user_id: str) -> str:
        """
        Get the session ID for a user from Redis
        
        Args:
            user_id: The user ID
            
        Returns:
            Session ID or empty string
        """
        redis = await self._get_redis()
        session_id = await redis.get(f"user:{user_id}:session")
        return session_id if session_id else ""
    
    async def get_session_metadata(self, session_id: str, user_id: str):
        """
        Get session metadata from Redis
        
        Args:
            session_id: The session ID
            user_id: The requesting user's ID
            
        Returns:
            Dictionary with session metadata
        """
        redis = await self._get_redis()
        session_key = f"session:{session_id}"
        
        # Check if session exists
        if not await redis.exists(session_key):
            raise SessionNotFoundError()
        
        # Get question data
        question_data = await redis.hgetall(f"{session_key}:question")
        if not question_data:
            raise SessionNotFoundError()

        # Get collaborator ID
        _, collaborator_id = await self._get_collaborator_q(session_id, user_id)

        return {
            "language": question_data.get("language", ""),
            "created_at": question_data.get("created_at", ""),
            "collaborator_id": collaborator_id
        }

    async def cleanup(self):
        """Cleanup resources"""
        if self.pubsub_task:
            self.pubsub_task.cancel()
            try:
                await self.pubsub_task
            except asyncio.CancelledError:
                pass
        if self.pubsub:
            await self.pubsub.close()

    def __str__(self):
        return f"ConnectionManager(active_connections={self.active_connections})"


connection_manager = ConnectionManager()

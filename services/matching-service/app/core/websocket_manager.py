from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)

    async def send_event(self, user_id: str, event: str, data: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_json({
                "event": event,
                "data": data
            })

manager = ConnectionManager()
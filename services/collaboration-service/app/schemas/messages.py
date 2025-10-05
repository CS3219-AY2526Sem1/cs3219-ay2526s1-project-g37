from pydantic import BaseModel
    

class Message(BaseModel):
    pass 
    
class CollaboratorConnectMessage(Message):
    pass

class CollaboratorDisconnectMessage(Message):
    type: str = "collaborator_disconnect"
    pass

class DisplayMessage(Message):
    msg: str 
    

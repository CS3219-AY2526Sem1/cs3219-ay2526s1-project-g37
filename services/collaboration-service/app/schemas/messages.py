from pydantic import BaseModel
    

class Message(BaseModel):
    pass 
    
class CollaboratorConnectMessage(Message):
    type: str = "collaborator_connect"
    pass

class CollaboratorDisconnectMessage(Message):
    type: str = "collaborator_disconnect"
    pass

class CollaboratorEndedMessage(Message):
    type: str = "collaborator_ended"
    pass

class DisplayMessage(Message):
    type: str = "display"
    msg: str 
    

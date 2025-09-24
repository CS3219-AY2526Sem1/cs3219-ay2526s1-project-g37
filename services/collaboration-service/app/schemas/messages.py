from pydantic import BaseModel
    

class Message(BaseModel):
    pass 
    
class CollaboratorConnectMessage(Message):
    pass

class CollaboratorDisconnectMessage(Message):
    pass

class DisplayMessage(Message):
    msg: str 
    

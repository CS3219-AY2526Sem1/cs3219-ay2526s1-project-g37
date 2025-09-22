from pydantic import BaseModel
    

class Message(BaseModel):
    pass 
    
class ConnectMessage(Message):
    pass

class DisconnectMessage(Message):
    pass

class DisplayMessage(Message):
    msg: str 
    

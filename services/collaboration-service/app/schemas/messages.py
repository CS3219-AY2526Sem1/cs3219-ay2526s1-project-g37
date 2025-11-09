from pydantic import BaseModel
from typing import Optional
    

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
    
class RunCodeMessage(Message):
    type: str = "run_code"
    language: str
    code: Optional[str] = "" 
    stdin: Optional[str] = ""
    timeout: Optional[int] = 20

class CodeRunningMessage(Message):
    type: str = "code_running"
    message: str = "Code execution in progress..."

class CodeResultMessage(Message):
    type: str = "code_result"
    status: str  # "success" or "failed"
    code_output: str
    execution_time: float
    exit_code: Optional[int] = None
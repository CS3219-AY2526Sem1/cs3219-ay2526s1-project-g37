"""
Client for interacting with the Code Execution Service
and handler for code execution requests in collaboration sessions
"""
import os
import httpx
import logging
from typing import Optional
from app.schemas.messages import CodeResultMessage

logger = logging.getLogger(__name__)

logger.setLevel(logging.INFO)

CODE_EXEC_SERVICE_URL = os.getenv("CODE_EXEC_SERVICE_URL", "http://code-execution-controller:8000")
CODE_EXEC_TIMEOUT = int(os.getenv("JOB_TIMEOUT", 30))

class CodeExecutionClient:
    def __init__(self, base_url: str = CODE_EXEC_SERVICE_URL):
        self.base_url = base_url
        self.timeout = httpx.Timeout(CODE_EXEC_TIMEOUT, connect=5.0)
    
    async def execute_code(
        self, 
        language: str, 
        b64_code: str, 
        b64_stdin: Optional[str] = "",
        timeout: Optional[int] = CODE_EXEC_TIMEOUT
    ) -> dict:
        """
        Execute code via the code execution service
        
        Args:
            language: Programming language (python, cpp, java, javascript)
            code: Source code to execute
            stdin: Standard input for the program
            timeout: Execution timeout in seconds
            
        Returns:
            dict with keys: status, stdout, stderr, execution_time, exit_code
        """
        try:
            payload = {
                "language": language,
                "code": b64_code,
                "stdin": b64_stdin,
                "timeout": timeout
            }

            logger.info(f"Sending payload to code execution service at {self.base_url}/execute: {payload}")

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Sending code execution request to {self.base_url}/execute")
                response = await client.post(
                    f"{self.base_url}/execute",
                    json=payload
                )

                logger.info(f"Received response from code execution service: {response.status_code}, {response.text}")

                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Code execution completed with status: {result.get('status')}")
                return result
                
        except httpx.TimeoutException:
            logger.error("Code execution service timeout")
            return {
                "status": "failed",
                "stdout": "",
                "stderr": "Code execution service timeout",
                "execution_time": timeout,
                "exit_code": -1
            }
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from code execution service: {e}")
            return {
                "status": "failed",
                "stdout": "",
                "stderr": f"Code execution service error: {e.response.text}",
                "execution_time": 0.0,
                "exit_code": -1
            }
        except Exception as e:
            logger.error(f"Unexpected error calling code execution service: {e}")
            return {
                "status": "failed",
                "stdout": "",
                "stderr": f"Internal error: {str(e)}",
                "execution_time": 0.0,
                "exit_code": -1
            }

    async def execute_and_broadcast_result(
        self,
        session_id: str,
        language: str,
        code: str,
        stdin: str = "",
        timeout: int = CODE_EXEC_TIMEOUT
    ):
        """
        Execute code and broadcast the result to all users in the session
        
        Args:
            session_id: The collaboration session ID
            language: Programming language (python, cpp, java, javascript)
            code: Base64-encoded source code to execute
            stdin: Base64-encoded standard input for the program
            timeout: Execution timeout in seconds
        """
        # Import here to avoid circular dependency
        from app.core.connection_manager import connection_manager
        
        try:
            # Call the code execution service (code and stdin are already base64-encoded from frontend)
            logger.info(f"Calling the code execution service with language={language}, timeout={timeout}")
            result = await self.execute_code(
                language=language,
                b64_code=code,
                b64_stdin=stdin,
                timeout=timeout
            )
            logger.info(f"Code execution result: {result}")
            
            # Create result message
            result_msg = CodeResultMessage(
                status=result.get("status", "failed"),
                stdout=result.get("stdout", ""),
                stderr=result.get("stderr", ""),
                execution_time=result.get("execution_time", 0.0),
                exit_code=result.get("exit_code")
            )

            # Broadcast result to both users
            logger.info(f"Broadcast code execution result to session {session_id}: {result_msg.status}")
            await connection_manager.broadcast_to_session(session_id, result_msg)
            
        except Exception as e:
            logger.error(f"Error executing code for session {session_id}: {e}")
            # Send error message to both users
            error_msg = CodeResultMessage(
                status="failed",
                stdout="",
                stderr=str(e),
                execution_time=0.0,
                exit_code=-1
            )
            await connection_manager.broadcast_to_session(session_id, error_msg)

# Singleton instance
code_execution_client = CodeExecutionClient()

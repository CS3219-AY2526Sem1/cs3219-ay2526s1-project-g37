

class InvalidUserIDsError(Exception):
    """Exception raised when the provided user IDs are invalid."""
    msg = "user_ids must contain exactly two user IDs."
    pass

class UserNotFoundError(Exception):
    """Exception raised when a user is not found in the system."""
    msg = "user_id not available in this session"  
    pass

class SessionNotFoundError(Exception):
    """Exception raised when a session is not found."""
    msg = "Session not initialized"
    pass

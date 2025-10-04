class QuestionNotFoundException(Exception):
    """
    Exception raised when a question is not found based on specified criteria.
    
    Attributes:
        question_id (str | None): The ID of the question that was not found
        topic (str | None): The topic that was searched for
        difficulty (str | None): The difficulty level that was searched for
        message (str): Explanation of the error
    """
    
    def __init__(self, question_id: str = None, topic: str = None, difficulty: str = None):
        self.question_id = question_id
        self.topic = topic
        self.difficulty = difficulty
        
        self.message = self._generate_default_message()
        super().__init__(self.message)
    
    def _generate_default_message(self) -> str:
        """Generate a default error message based on available criteria."""
        if self.question_id:
            return f"Question with ID '{self.question_id}' not found"
        elif self.topic and self.difficulty:
            return f"No question found with difficulty '{self.difficulty}' and topic '{self.topic}'"
        elif self.topic:
            return f"No question found with topic '{self.topic}'"
        elif self.difficulty:
            return f"No question found with difficulty '{self.difficulty}'"
        else:
            return "Question not found"
        
    def __str__(self):
        return self.message
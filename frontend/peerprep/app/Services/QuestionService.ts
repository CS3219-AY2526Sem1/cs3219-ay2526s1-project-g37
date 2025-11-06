import { useAuth } from '~/Context/AuthContext';

/**
 * Question type defining the structure of a question
 */
export type Question = {
  name: string;
  description: string;
  difficulty: string;
  topic: string;
};

/**
 * Labels type defining the structure of question labels
 */
export type Labels = {
  topics: string[];
  difficulties: string[];
};

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/questions`;

/**
 * QuestionService hook to interact with question backend APIs
 * @returns Object containing methods to interact with question service
 */
export function useQuestionService() {
  const { tokenId } = useAuth();

  /**
   * Add a new question to the backend
   * @param question - Question object containing question details
   * @returns Response from the backend after adding the question
   */
  async function addQuestion(question: Question) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      throw new Error('Failed to add question');
    }

    return response.json();
  }

  /**
   * Get a question by its ID
   * @param id - ID of the question
   * @returns Question data
   * @throws Error if the fetch fails
   */
  async function getQuestion(id: string) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch question');
    }

    return response.json();
  }

  /**
   * Get available labels for questions
   * @returns Labels data containing topics and difficulties
   * @throws Error if the fetch fails
   */
  async function getLabels() {
    const response = await fetch(`${API_BASE_URL}/labels`, {
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch labels');
    }

    return response.json();
  }

  /**
   * Upload an image to the backend
   * @param imageData - File object containing the image data
   * @returns Response from the backend after uploading the image, URL of the uploaded image
   * @throws Error if the upload fails
   */
  async function uploadImage(imageData: File) {
    const formData = new FormData();
    formData.append('file', imageData);

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    console.log('Image uploaded successfully');
    return response.json();
  }

  /**
   * Validate if a question configuration is valid
   * @param difficulties - Difficulty level of the question
   * @param topics - Topic of the question
   * @returns Validation result from the backend
   * @throws Error if the validation fails
   */
  async function isValidQuestion(difficulties: string, topics: string) {
    const params = new URLSearchParams();
    params.append('difficulties', difficulties);
    params.append('topics', topics);

    const response = await fetch(
      `${API_BASE_URL}/questions/valid-config?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenId}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to validate question');
    }
    return response.json();
  }

  /**
   * Fetch question statistics from the backend
   * @returns Question statistics data
   * @throws Error if the fetch fails
   */
  async function fetchQuestionStats() {
    const response = await fetch(`${API_BASE_URL}/questions/stats`, {
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch question stats');
    }

    return response.json();
  }

  async function updateQuestion(question: Question, id: string) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      throw new Error('Failed to update question');
    }

    return response.json();
  }

  /**
   * Get a paginated list of questions from the backend
   * @param page - Page number for pagination
   * @param searchQuery - Search query to filter questions
   * @returns List of questions and total count
   * @throws Error if the fetch fails
   */
  async function getQuestionsList(page: number, searchQuery: string) {
    const response = await fetch(
      `${API_BASE_URL}/questions?page=${page}&search=${searchQuery}`,
      {
        headers: {
          Authorization: `Bearer ${tokenId}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    return response.json();
  }

  /**
   * Get a paginated list of questions from the backend by userid
   * @param page - Page number for pagination
   * @param userId - Questions history based off userid
   * @returns List of questions and total count
   * @throws Error if the fetch fails
   */
  async function getQuestionsListByUser(page: number, userId: string) {
    const response = await fetch(
      `${API_BASE_URL}/questions/history?page=${page}&userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${tokenId}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    return response.json();
  }

  /**
   * Insert or update a question attempt.
   * If an attempt exists for the same (userId, questionId, collabId),
   * it updates the submitted solution. Otherwise, it inserts a new entry.
   *
   * @param userId - User's ID
   * @param questionId - Questions's ID
   * @param collabId - Collaboration session ID
   * @param submitted_solution - User's current solution
   * @returns The updated or newly created attempt
   * @throws Error if insert or update fails
   */
  async function insertAttempt(
    userId: string,
    questionId: string,
    collabId: string,
    language: string,
    collaboratorId: string,
    submitted_solution: string
  ) {
    const response = await fetch(`${API_BASE_URL}/questions/attempt`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        question_id: questionId,
        collab_id: collabId,
        language: language,
        collaborator_id: collaboratorId,
        submitted_solution,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg =
        errorData?.detail || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(data);
    return data;
  }

  /**
   * Delete a question by its ID
   * @param id - ID of the question to be deleted
   * @returns Response from the backend after deleting the question
   * @throws Error if the deletion fails
   */
  async function deleteQuestion(id: string) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete question');
    }

    return response.json();
  }

  return {
    addQuestion,
    getQuestion,
    getLabels,
    uploadImage,
    isValidQuestion,
    fetchQuestionStats,
    updateQuestion,
    getQuestionsList,
    deleteQuestion,
    getQuestionsListByUser,
    insertAttempt,
  };
}

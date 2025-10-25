import { useAuth } from "~/Context/AuthContext";

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
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(question),
    });

    if (!response.ok) {
      throw new Error("Failed to add question");
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
      throw new Error("Failed to fetch question");
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
      throw new Error("Failed to fetch labels");
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
    formData.append("file", imageData);

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    console.log("Image uploaded successfully");
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
    params.append("difficulties", difficulties);
    params.append("topics", topics);

    const response = await fetch(
      `${API_BASE_URL}/questions/valid-config?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenId}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to validate question");
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
      throw new Error("Failed to fetch question stats");
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
  };
}

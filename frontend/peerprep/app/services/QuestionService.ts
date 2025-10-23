import { useAuth } from "~/context/authContext";

export type Question = {
  name: string;
  description: string;
  difficulty: string;
  topic: string;
};

export type Labels = {
  topics: string[];
  difficulties: string[];
};

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/questions`;

export function useQuestionService() {
  const { tokenId } = useAuth();

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

  return {
    addQuestion,
    getQuestion,
    getLabels,
    uploadImage,
    isValidQuestion,
  };
}

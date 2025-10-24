import { useAuth } from "~/context/authContext";

export type SessionMetadata = {
  language: string;
  created_at: string;
};

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/collaboration`;

export function useCollabService() {
  const { userId, tokenId } = useAuth();

  async function checkExistingSession(userId: string) {
    const url = `${API_BASE_URL}/sessions?user_id=${userId}`;
    console.log('checkExistingSession GET', url);
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${tokenId}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      // no session for this user
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to check existing session");
    }

    return response.json();
  }

  async function getSessionQuestion(sessionId: string) {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/question`,
      {
        headers: {
          "Authorization": `Bearer ${tokenId}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get session question");
    }
    return response.json();
  }

  async function getSessionByUser() {
    const url = `${API_BASE_URL}/sessions?user_id=${userId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${tokenId}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get session for user");
    }
    
    return response.json();
  }

  async function getSessionMetadata(session_id: string) {
    const response = await fetch(`${API_BASE_URL}/sessions/${session_id}/metadata`, {
      headers: {
        Authorization: `Bearer ${tokenId}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch session metadata");
    }

    return response.json();
  }

  return {
    checkExistingSession,
    getSessionQuestion,
    getSessionByUser,
        getSessionMetadata,

  };
}

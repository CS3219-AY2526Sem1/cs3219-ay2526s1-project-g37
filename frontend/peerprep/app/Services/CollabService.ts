import { useAuth } from "~/Context/AuthContext";

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/collaboration`;

/**
 * CollabService hook to interact with collaboration backend APIs
 * @returns Object containing methods to interact with collaboration service
 */
export function useCollabService() {
  const { userId, tokenId } = useAuth();

  /**
   * Check if an existing collaboration session exists for the user
   * @param userId - ID of the user
   * @returns Session data if exists, null otherwise
   * @throws Error if the fetch fails
   */
  async function checkExistingSession(userId: string) {
    const url = `${API_BASE_URL}/sessions?user_id=${userId}`;
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

  /**
   * Get the question for a specific session
   * @param sessionId - ID of the session
   * @returns Question data for the session
   * @throws Error if the fetch fails
   */
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

  /**
   * Get the collaboration session associated with the current user
   * @returns Session data for the user
   * @throws Error if the fetch fails
   */
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

  return {
    checkExistingSession,
    getSessionQuestion,
    getSessionByUser,
  };
}

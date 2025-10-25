import { useAuth } from "~/Context/AuthContext";

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/matching`;

/**
 * MatchRequest type defining the structure of a match request
 */
type MatchRequest = {
  user_id: string;
  difficulty: string;
  topic: string;
  language: string;
};

/**
 * MatchingService hook to interact with matching backend APIs
 * @returns Object containing methods to interact with matching service
 */
export const useMatchingService = () => {
  const { tokenId } = useAuth();

  /**
   * Send a match request to the matching service
   * @param matchRequest - MatchRequest object containing user and preferences
   * @returns Response from the matching service
   */
  async function sendQueueRequest(matchRequest: MatchRequest) {
    const response = await fetch(`${API_BASE_URL}/match/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify(matchRequest),
    });
    return response.json();
  }

  /**
   * Send a leave request to the matching service
   * @param matchRequest - MatchRequest object containing user and preferences
   * @returns Response from the matching service
   */
  async function sendLeaveRequest(matchRequest: MatchRequest) {
    const response = await fetch(`${API_BASE_URL}/match/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: JSON.stringify(matchRequest),
    });
    return response.json();
  }

  return { sendQueueRequest, sendLeaveRequest };
};

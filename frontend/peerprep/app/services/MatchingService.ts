import { useAuth } from "~/Context/AuthContext";

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/matching`;

type MatchRequest = {
  user_id: string;
  difficulty: string;
  topic: string;
  language: string;
};

export const useMatchingService = () => {
  const { tokenId } = useAuth();

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

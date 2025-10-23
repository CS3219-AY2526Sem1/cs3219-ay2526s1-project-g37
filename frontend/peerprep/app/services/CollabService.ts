import { useAuth } from "~/context/authContext";

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/collaboration`;

async function checkExistingSession(userId: string, tokenId: string | null) {
    const response = await fetch(`${API_BASE_URL}/sessions?user_id=${userId}`, {
        headers: {
            "Authorization": `Bearer ${tokenId}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to check existing session");
    }
    return response.json();
}

async function getSessionQuestion(sessionId: string, tokenId: string | null) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/question`, {
        headers: {
            "Authorization": `Bearer ${tokenId}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get session question");
    }
    return response.json();;
}


export function useCollabService() {
    const { tokenId } = useAuth();

    return {
        checkExistingSession: (userId: string) => checkExistingSession(userId, tokenId),
        getSessionQuestion: (sessionId: string) => getSessionQuestion(sessionId, tokenId),
    };
}

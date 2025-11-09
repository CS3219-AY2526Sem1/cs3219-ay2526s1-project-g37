import { useAuth } from "~/Context/AuthContext";

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/users`;

export type UserDetails = {
    created_at: string;
    role: number;
    username: string;
    uuid: string;
};

/**
 * UserService hook to interact with user backend APIs
 * @returns Object containing methods to interact with user service
 */
export function useUserService() {
    const { tokenId, userId } = useAuth();

    async function getUserDetails(userId: string) {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${tokenId}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user details");
        }

        return response.json();
    }

    async function getCurrentUserDetails() {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${tokenId}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch current user details");
        }

        return response.json();
    }

    async function updateUsername(newUsername: string) {
        const response = await fetch(`${API_BASE_URL}/update/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenId}`,
            },
            body: JSON.stringify({ username: newUsername }),
        });

        if (!response.ok) {
            throw new Error("Failed to update username");
        }

        return response.json();
    }

    return {
        getUserDetails,
        getCurrentUserDetails,
        updateUsername,
    };
}

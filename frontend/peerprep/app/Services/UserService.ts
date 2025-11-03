import { useAuth } from "~/Context/AuthContext";

const API_BASE_URL = `${import.meta.env.VITE_AUTH_ROUTER_URL}/users`;


/**
 * UserService hook to interact with user backend APIs
 * @returns Object containing methods to interact with user service
 */
export function useUserService() {
    const { tokenId } = useAuth();

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

    return {
        getUserDetails,
    };
}

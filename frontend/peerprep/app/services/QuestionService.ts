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

async function addQuestion(question: Question, tokenId: string | null) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${tokenId}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
    });

    if (!response.ok) {
        throw new Error("Failed to add question");
    }

    return response.json();
}

async function getQuestion(id: string, tokenId: string | null) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        headers: {
            "Authorization": `Bearer ${tokenId}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch question");
    }

    return response.json();
}

async function getLabels(tokenId: string | null) {
    const response = await fetch(`${API_BASE_URL}/labels`, {
        headers: {
            "Authorization": `Bearer ${tokenId}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch labels");
    }

    return response.json();
}

async function uploadImage(imageData: File, tokenId: string | null) {
    const formData = new FormData();
    formData.append("file", imageData);

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": `Bearer ${tokenId}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to upload image");
    }
    
    console.log("Image uploaded successfully");
    return response.json();
}

async function isValidQuestion(difficulties: string, topics: string, tokenId: string | null) {
    const params = new URLSearchParams();
    params.append("difficulties", difficulties);
    params.append("topics", topics);

    const response = await fetch(`${API_BASE_URL}/questions/valid-config?${params.toString()}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${tokenId}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to validate question");
    }
    return response.json();
}

export function useQuestionService() {
    const { tokenId } = useAuth();

    async function updateQuestion(question: Question, id: string) {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${tokenId}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(question),
        });

        if (!response.ok) {
            throw new Error("Failed to update question");
        }

        return response.json();
    }

    async function getQuestionsList(page: number, searchQuery: string) {
        const response = await fetch(`${API_BASE_URL}/questions?page=${page}&search=${searchQuery}`, {
            headers: {
                "Authorization": `Bearer ${tokenId}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch questions");
        }

        return response.json();
    }

    async function deleteQuestion(id: string) {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${tokenId}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete question");
        }

        return response.json();
    }

    return {
        addQuestion: (question: Question) => addQuestion(question, tokenId),
        getQuestion: (id: string) => getQuestion(id, tokenId),
        getLabels: () => getLabels(tokenId),
        uploadImage: (imageData: File) => uploadImage(imageData, tokenId),
        isValidQuestion: (difficulties: string, topics: string) => isValidQuestion(difficulties, topics, tokenId),
        updateQuestion,
        getQuestionsList,
        deleteQuestion,
    };
}

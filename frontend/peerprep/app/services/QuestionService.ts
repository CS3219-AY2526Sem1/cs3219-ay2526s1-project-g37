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

const API_BASE_URL = `${import.meta.env.VITE_QUESTION_SERVICE_URL}`; // Replace with your actual API base URL

export async function addQuestion(question: Question) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
    });

    if (!response.ok) {
        throw new Error("Failed to add question");
    }

    return response.json();
}

export async function getQuestions(id: string) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch questions");
    }

    return response.json();
}

export async function getLabels() {
    const response = await fetch(`${API_BASE_URL}/labels`);

    if (!response.ok) {
        throw new Error("Failed to fetch labels");
    }

    return response.json();
}

export async function uploadImage(imageData: ArrayBuffer) {
    let fileBlob: Blob;
    fileBlob = new Blob([new Uint8Array(imageData)], { type: "application/octet-stream" });

    const formData = new FormData();
    formData.append("file", fileBlob, "upload.png");

    const res = await fetch(`${API_BASE_URL}/images/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to upload image: ${res.status} ${text}`);
    }

    const body = await res.json();
    console.log("uploadImage response body:", body);
    return { imageUrl: body.url || body.imageUrl || body };
}

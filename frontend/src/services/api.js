const API_BASE_URL = "http://localhost:8000/api";

const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "API request failed."
            );
        }

        return data;
    },

    post: async (endpoint, body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "API request failed."
            );
        }

        return data;
    },

    put: async (endpoint, body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "API request failed."
            );
        }

        return data;
    },

    delete: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "API request failed."
            );
        }

        return data;
    },
};

export default api;
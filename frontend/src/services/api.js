const API_BASE_URL = "http://localhost:8000/api";

const parseResponse = async (response) => {
    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "The server returned an invalid response."
        );
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message || "API request failed."
        );
    }

    return data;
};


const api = {

    get: async (endpoint) => {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`
        );

        return parseResponse(response);
    },


    post: async (endpoint, body) => {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(body),
            }
        );

        return parseResponse(response);
    },


    put: async (endpoint, body) => {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(body),
            }
        );

        return parseResponse(response);
    },


    delete: async (endpoint) => {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "DELETE",
            }
        );

        return parseResponse(response);
    },
};


export default api;
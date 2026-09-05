import api from "./api";


const TOKEN_KEY = "zan_gates_admin_token";


const adminApi = {

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    login: async (username, password) => {

        const response = await api.post(
            "/admin/login",
            {
                username,
                password,
            }
        );

        const token = response?.data?.token;

        if (!token) {
            throw new Error(
                "Authentication token was not returned by the server."
            );
        }

        localStorage.setItem(
            TOKEN_KEY,
            token
        );

        return response;
    },


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    logout: () => {

        localStorage.removeItem(
            TOKEN_KEY
        );
    },


    /*
    |--------------------------------------------------------------------------
    | GET TOKEN
    |--------------------------------------------------------------------------
    */

    getToken: () => {

        return localStorage.getItem(
            TOKEN_KEY
        );
    },


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED REQUEST
    |--------------------------------------------------------------------------
    */

    authenticatedRequest: async (
        endpoint,
        options = {}
    ) => {

        const token =
            adminApi.getToken();

        if (!token) {
            throw new Error(
                "Administrator authentication is required."
            );
        }


        const headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        };


        const response = await fetch(
            `http://localhost:8000/api${endpoint}`,
            {
                ...options,
                headers,
            }
        );


        let data;

        try {
            data = await response.json();

        } catch {
            throw new Error(
                "The server returned an invalid response."
            );
        }


        if (
            response.status === 401
        ) {

            adminApi.logout();

            const error =
                new Error(
                    "Your administrator session has expired."
                );

            error.code = "AUTH_EXPIRED";

            throw error;
        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "API request failed."
            );
        }


        return data;
    },


    /*
    |--------------------------------------------------------------------------
    | CURRENT ADMIN
    |--------------------------------------------------------------------------
    */

    me: async () => {

        return adminApi.authenticatedRequest(
            "/admin/me"
        );
    },


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    dashboard: async () => {

        return adminApi.authenticatedRequest(
            "/admin/dashboard"
        );
    },


    /*
    |--------------------------------------------------------------------------
    | BOOKINGS
    |--------------------------------------------------------------------------
    */

    bookings: async (query = "") => {

        return adminApi.authenticatedRequest(
            `/admin/bookings${query}`
        );
    },


    /*
    |--------------------------------------------------------------------------
    | BOOKING DETAILS
    |--------------------------------------------------------------------------
    */

    booking: async (id) => {

        return adminApi.authenticatedRequest(
            `/admin/bookings/${id}`
        );
    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING STATUS
    |--------------------------------------------------------------------------
    */

    updateBookingStatus: async (
        id,
        status
    ) => {

        return adminApi.authenticatedRequest(
            `/admin/bookings/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    status,
                }),
            }
        );
    },
};


export default adminApi;
import api from "./api";


/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
|
| The public API client in api.js already points to the Railway backend.
|
| VITE_API_BASE_URL can optionally be configured in Railway.
|
| Production fallback:
|
| https://zan-gates-backend-production.up.railway.app/api
|
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://zan-gates-backend-production.up.railway.app/api";


/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const TOKEN_KEY =
    "zan_gates_admin_token";


/*
|--------------------------------------------------------------------------
| ADMIN API
|--------------------------------------------------------------------------
*/

const adminApi = {


    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    |
    | Public endpoint.
    |
    | POST /api/admin/login
    |
    */

    login: async (
        username,
        password
    ) => {

        const response =
            await api.post(
                "/admin/login",
                {
                    username,
                    password,
                }
            );


        const token =
            response?.data?.token;


        if (
            !token ||
            typeof token !== "string"
        ) {

            throw new Error(
                "Authentication token was not returned by the server."
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Store JWT
        |--------------------------------------------------------------------------
        */

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
    | CHECK AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    isAuthenticated: () => {

        return Boolean(
            adminApi.getToken()
        );
    },


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED REQUEST
    |--------------------------------------------------------------------------
    |
    | All protected administrator API requests pass through this method.
    |
    | Automatically:
    |
    | - reads JWT
    | - adds Authorization header
    | - handles JSON
    | - handles 401
    | - clears expired token
    | - handles 403
    | - returns API response
    |
    */

    authenticatedRequest: async (
        endpoint,
        options = {}
    ) => {


        /*
        |--------------------------------------------------------------------------
        | TOKEN
        |--------------------------------------------------------------------------
        */

        const token =
            adminApi.getToken();


        if (!token) {

            const error =
                new Error(
                    "Administrator authentication is required."
                );

            error.code =
                "AUTH_REQUIRED";

            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | REQUEST OPTIONS
        |--------------------------------------------------------------------------
        */

        const requestOptions = {
            ...options,
        };


        /*
        |--------------------------------------------------------------------------
        | HEADERS
        |--------------------------------------------------------------------------
        */

        const headers = {
            Accept:
                "application/json",

            ...(options.headers || {}),

            Authorization:
                `Bearer ${token}`,
        };


        /*
        |--------------------------------------------------------------------------
        | JSON CONTENT TYPE
        |--------------------------------------------------------------------------
        |
        | Only add Content-Type automatically when a body exists.
        |
        */

        if (
            requestOptions.body &&
            !headers["Content-Type"] &&
            !headers["content-type"]
        ) {

            headers["Content-Type"] =
                "application/json";
        }


        requestOptions.headers =
            headers;


        /*
        |--------------------------------------------------------------------------
        | REQUEST
        |--------------------------------------------------------------------------
        */

        let response;


        try {

            response =
                await fetch(
                    `${API_BASE_URL}${endpoint}`,
                    requestOptions
                );

        } catch (error) {

            console.error(
                "Admin API network error:",
                error
            );


            throw new Error(
                "Unable to connect to the server. Please make sure the PHP API is running."
            );
        }


        /*
        |--------------------------------------------------------------------------
        | HANDLE EMPTY RESPONSE
        |--------------------------------------------------------------------------
        */

        let data = null;


        const contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            try {

                data =
                    await response.json();

            } catch (error) {

                console.error(
                    "Invalid JSON response:",
                    error
                );


                throw new Error(
                    "The server returned an invalid JSON response."
                );
            }

        } else {

            /*
            |--------------------------------------------------------------------------
            | Try JSON anyway if the response has content
            |--------------------------------------------------------------------------
            */

            const text =
                await response.text();


            if (
                text.trim() !== ""
            ) {

                try {

                    data =
                        JSON.parse(text);

                } catch {

                    throw new Error(
                        "The server returned an invalid response."
                    );
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | AUTHENTICATION EXPIRED / INVALID
        |--------------------------------------------------------------------------
        */

        if (
            response.status === 401
        ) {

            adminApi.logout();


            const error =
                new Error(
                    "Your administrator session has expired."
                );


            error.code =
                "AUTH_EXPIRED";


            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | FORBIDDEN
        |--------------------------------------------------------------------------
        */

        if (
            response.status === 403
        ) {

            const error =
                new Error(
                    data?.message ||
                    "Administrator access is required."
                );


            error.code =
                "FORBIDDEN";


            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | OTHER API ERRORS
        |--------------------------------------------------------------------------
        */

        if (
            !response.ok ||
            data?.success === false
        ) {

            const error =
                new Error(
                    data?.message ||
                    "API request failed."
                );


            error.status =
                response.status;


            error.response =
                data;


            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        return data;
    },


    /*
    |--------------------------------------------------------------------------
    | CURRENT ADMIN
    |--------------------------------------------------------------------------
    |
    | GET /api/admin/me
    |
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
    |
    | GET /api/admin/dashboard
    |
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
    |
    | GET /api/admin/bookings
    |
    */

    bookings: async (
        query = ""
    ) => {

        return adminApi.authenticatedRequest(
            `/admin/bookings${query}`
        );
    },


    /*
    |--------------------------------------------------------------------------
    | BOOKING DETAILS
    |--------------------------------------------------------------------------
    |
    | GET /api/admin/bookings/{id}
    |
    */

    booking: async (
        id
    ) => {

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {

            throw new Error(
                "Booking ID is required."
            );
        }


        const bookingId =
            encodeURIComponent(
                String(id)
            );


        return adminApi.authenticatedRequest(
            `/admin/bookings/${bookingId}`
        );
    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKING STATUS
    |--------------------------------------------------------------------------
    |
    | PUT /api/admin/bookings/{id}/status
    |
    */

    updateBookingStatus: async (
        id,
        status
    ) => {

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {

            throw new Error(
                "Booking ID is required."
            );
        }


        const allowedStatuses = [
            "PENDING",
            "CONFIRMED",
            "CANCELLED",
            "COMPLETED",
        ];


        const normalizedStatus =
            String(status || "")
                .trim()
                .toUpperCase();


        if (
            !allowedStatuses.includes(
                normalizedStatus
            )
        ) {

            throw new Error(
                "Invalid booking status."
            );
        }


        const bookingId =
            encodeURIComponent(
                String(id)
            );


        return adminApi.authenticatedRequest(
            `/admin/bookings/${bookingId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    status:
                        normalizedStatus,
                }),
            }
        );
    },
};


export default adminApi;
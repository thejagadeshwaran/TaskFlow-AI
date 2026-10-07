import axios from "axios";

// ==========================================
// AXIOS API INSTANCE
// ==========================================

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,

    timeout: 10000,

    headers: {
        "Content-Type": "application/json"
    }
});


// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        console.log(
            "================================="
        );

        console.log(
            "📤 API REQUEST"
        );

        console.log(
            "Method:",
            config.method?.toUpperCase()
        );

        console.log(
            "URL:",
            config.url
        );

        console.log(
            "Base URL:",
            config.baseURL
        );

        console.log(
            "Token exists:",
            !!token
        );


        // ==========================================
        // ADD TOKEN
        // ==========================================

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        console.error(
            "❌ REQUEST ERROR:",
            error
        );

        return Promise.reject(error);

    }

);


// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(

    (response) => {

        console.log(
            "📥 API RESPONSE"
        );

        console.log(
            "Status:",
            response.status
        );

        console.log(
            "URL:",
            response.config.url
        );

        console.log(
            "Data:",
            response.data
        );

        console.log(
            "================================="
        );

        return response;

    },

    (error) => {

        console.error(
            "================================="
        );

        console.error(
            "❌ API RESPONSE ERROR"
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "URL:",
            error.config?.url
        );

        console.error(
            "Server response:",
            error.response?.data
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "================================="
        );

        return Promise.reject(error);

    }

);


export default api;
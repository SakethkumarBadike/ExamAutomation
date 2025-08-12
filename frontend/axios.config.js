import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Sends cookies
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isLoginRequest = originalRequest.url.includes("/auth/login/") || originalRequest.url.includes("/auth/refresh/");
        // Try refreshing token on 401
        if (isLoginRequest) {
            // If it's a login or refresh request, just reject the error
            return Promise.reject(error);
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await api.post("/auth/refresh/", {
                    refresh_token: Cookies.get("refresh_token"),
                });

                const { access_token } = response.data;
                Cookies.set("access_token", access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);

                // 🔥 Clear tokens
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");

                // 🔁 Redirect to login page
                window.location.href = "/signin"; // Or use router.push if inside a component

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

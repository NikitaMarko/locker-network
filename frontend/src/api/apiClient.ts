import axios from "axios";
import {SERVER_URL} from "../config/env/env.ts";
import {refreshTokenRequest} from "./authApi.ts";


let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};


export const apiClient = axios.create({
    // baseURL: import.meta.env.VITE_API_URL_CLOUDFRONT ?? import.meta.env.VITE_API_URL_BACKEND_LOCAL,
    baseURL: SERVER_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});


apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    console.log("TOKEN :", JSON.stringify(token));
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});



apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.config.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (token && originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshTokenRequest(); // реализуем ниже
                localStorage.setItem('access_token', newToken);

                processQueue(null, newToken);
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('access_token');
                window.location.href = '/login?expired=true';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

import axios, { AxiosError } from "axios";
import { SERVER_URL } from "../config/env/env.ts";
import {logoutApi, refreshTokenRequest} from "./authApi.ts";

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
    baseURL: SERVER_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
        const originalRequest = error.config as any;

        if (originalRequest._skipInterceptor) {
            return Promise.reject(error);
            }


        const backendMessage = error.response?.data?.error?.message;
        const legacyMessage = error.response?.data?.message;

        if (backendMessage || legacyMessage) {

            error.message = (backendMessage || legacyMessage) as string;
        }
        // ==========================================

        if (originalRequest.url?.includes('/auth/refresh')) {
            localStorage.removeItem('access_token');

            try{
                await logoutApi();
            }catch(e){
                // логируем
            }finally {
                window.location.href = '/login?expired=true';
            }
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
                const newToken = await refreshTokenRequest();
                localStorage.setItem('access_token', newToken);

                processQueue(null, newToken);
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }


        return Promise.reject(error);
    }
);

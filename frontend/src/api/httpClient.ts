// src/api/httpClient.ts

import axios from "axios";
import { BASE_API_URL, USE_MOCK } from "../config/env";

// ---------------------------------------------------------
// AXIOS INSTANCE
// ---------------------------------------------------------
export const http = axios.create({
    baseURL: BASE_API_URL || "http://localhost:8080",
    withCredentials: false,
});

// ---------------------------------------------------------
// 🔹 REQUEST: добавляем токен
// ---------------------------------------------------------
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ---------------------------------------------------------
// 🔹 RESPONSE: обработка ошибок
// ---------------------------------------------------------
http.interceptors.response.use(
    (response) => response,

    async (error) => {

        // ✅ MOCK режим — НЕ ломаем приложение
        if (USE_MOCK) {
            console.warn("MOCK MODE → skip HTTP error handling");
            return Promise.reject(error);
        }

        // -------------------------------------------------
        // ❗ Backend доступен → нормальная обработка
        // -------------------------------------------------
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);
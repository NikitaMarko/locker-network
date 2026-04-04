// src/api/httpClient.ts

import axios from "axios";

export const http = axios.create({
    baseURL: "http://localhost:8080", // 👉 сюда поставьте URL backend
    withCredentials: false,
});

// ---------------------------------------------------------
// 🔹 Добавляем access_token в каждый запрос
// ---------------------------------------------------------
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---------------------------------------------------------
// 🔹 Обработка ошибок (например, 401)
// ---------------------------------------------------------
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Токен недействителен → выходим из системы
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

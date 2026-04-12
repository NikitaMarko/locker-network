import axios from "axios";
import {SERVER_URL} from "../config/env/env.ts";


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
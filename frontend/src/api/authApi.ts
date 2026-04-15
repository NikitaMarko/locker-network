import { apiClient } from "./apiClient";
import type { User } from "../types/user/user.ts";


export interface LoginResponse {
    accessToken: string;
}

export interface MeResponse {
    status: string;
    data: User;
}

export interface RegisterResponse {
    status?: string;
    message?: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>("/auth/login", { email, password });
    return res.data;
}

export async function registerApi(
    email: string,
    password: string,
    name: string,
    phone: string
): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>("/auth/signup", {
        email,
        password,
        name,
        phone,
    });
    return res.data;
}

export async function googleLoginApi(idToken: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>("/auth/google", { idToken });
    return res.data;
}

export async function meApi(): Promise<User | null> {
    try {
        const res = await apiClient.get<MeResponse>("/auth/me");

        return res.data.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            return null;
        }
        throw error;
    }
}

export async function logoutApi(): Promise<void> {
    await apiClient.post("/auth/logout")
}


export async function refreshTokenRequest(): Promise<string> {
    const res = await apiClient.post<{ accessToken: string }>("/auth/refresh");
    return res.data.accessToken;
}

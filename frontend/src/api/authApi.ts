import { http } from "./httpClient";
import type { User } from "../modules/shared/types/user";

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export interface MeResponse {
    user: User;
}

export interface RegisterResponse {
    user: User;
}

// -------------------------
// Авторизация
// -------------------------

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>("/auth/login", { email, password });
    return res.data;
}

// -------------------------
// Google Login
// -------------------------

export async function googleLoginApi(idToken: string): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>("/auth/google", { token: idToken });
    return res.data;
}

// -------------------------
// Refresh
// -------------------------

export async function refreshTokenRequest(): Promise<string> {
    const res = await http.post<{ accessToken: string }>("/auth/refresh");
    return res.data.accessToken;
}

// -------------------------
// Register
// -------------------------

export async function registerApi(
    email: string,
    password: string,
    name: string,
    phone?: string
): Promise<RegisterResponse> {
    const res = await http.post<RegisterResponse>("/auth/register", {
        email,
        password,
        name,
        phone,
    });

    return res.data;
}

// -------------------------
// Me
// -------------------------

export async function meApi(): Promise<User | null> {
    try {
        const res = await http.get<MeResponse>("/auth/me");
        return res.data.user;
    } catch {
        return null;
    }
}

// -------------------------
// Logout
// -------------------------

export async function logoutApi(): Promise<void> {
    await http.post("/auth/logout").catch(() => {});
}

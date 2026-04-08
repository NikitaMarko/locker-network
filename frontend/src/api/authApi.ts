import type { Role } from "../config/roles";
import { http } from "./httpClient";

export interface AuthResponse {
    accessToken?: string;
    user: {
        userId: string;
        email: string;
        name: string;
        role: Role;
        phone?: string;
    };
}

// ---------------------------------------------------------
// LOGIN
// ---------------------------------------------------------
export const loginApi = async (email: string, password: string) => {
    const res = await http.post<AuthResponse>("/auth/login", {
        email,
        password,
    });

    return res.data;
};

// ---------------------------------------------------------
// REGISTER
// ---------------------------------------------------------
export const registerApi = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
}) => {
    const res = await http.post<AuthResponse>("/auth/register", data);
    return res.data;
};

// ---------------------------------------------------------
// GOOGLE LOGIN
// ---------------------------------------------------------
export const googleLoginApi = async (idToken: string) => {
    const res = await http.post<AuthResponse>("/auth/google", {
        idToken,
    });

    return res.data;
};
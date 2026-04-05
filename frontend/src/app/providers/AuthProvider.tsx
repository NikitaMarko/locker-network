import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../modules/shared/types/user";
import { AuthContext } from "./AuthContext";
import { http } from "../../api/httpClient";
import { googleLoginApi } from "../../api/authApi";
import { USE_MOCK } from "../../config/env";
import {BLOCK_TIME, MAX_ATTEMPTS} from "../utils/constans.ts";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const[attempts,setAttempts] = useState(0)
    const [block,setBlock] = useState<number |null>(null);

    // ---------------------------------------------------------
    // Проверяем токен и загружаем пользователя
    // ---------------------------------------------------------
    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setLoading(false);
            return;
        }

        // MOCK: не дергаем backend
        if (USE_MOCK && token === "mock_token") {
            console.log("MOCK TOKEN DETECTED → SKIP /auth/me");

            const mockUser: User = {
                userId: "1",
                name: "Google Test User",
                email: "test@gmail.com",
                role: "ADMIN",
            };

            setUser(mockUser);
            setLoading(false);
            return;
        }

        // REAL BACKEND
        http.get("/auth/me")
            .then((res) => setUser(res.data.user))
            .catch(() => {
                localStorage.removeItem("access_token");
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    // ---------------------------------------------------------
    // login
    // ---------------------------------------------------------
    const login = async (email: string, password: string): Promise<User> => {

        if (block && Date.now() < block) {
            const mins = Math.ceil((block - Date.now()) / 60000);
            const error = new Error(`Too many attempts. Wait ${mins} minutes.`);
            error.name = "BLOCK_TIME";
            throw error;
        }

        try {
            const res = await http.post("/auth/login", { email, password });
            setAttempts(0);
            setBlock(null);
            localStorage.setItem("access_token", res.data.accessToken);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setBlock(Date.now() + BLOCK_TIME);
            }

            throw err;
        }
    };

    // ---------------------------------------------------------
    // register
    // ---------------------------------------------------------
    const register = async (
        email: string,
        password: string,
        name: string
    ): Promise<User> => {
        const res = await http.post("/auth/register", {
            email,
            password,
            name,
        });

        localStorage.setItem("access_token", res.data.accessToken);
        setUser(res.data.user);

        return res.data.user;
    };

    // ---------------------------------------------------------
    // Google Login
    // ---------------------------------------------------------
    const googleLogin = async (idToken: string): Promise<User> => {
        // =========================
        // MOCK РЕЖИМ
        // =========================
        if (USE_MOCK) {
            console.warn("USING MOCK GOOGLE LOGIN");

            const mockUser: User = {
                userId: "1",
                name: "Google Test User",
                email: "test@gmail.com",
                role: "ADMIN",
            };

            localStorage.setItem("access_token", "mock_token");
            setUser(mockUser);

            return mockUser;
        }

        // =========================
        // REAL BACKEND
        // =========================
        try {
            console.log("GOOGLE LOGIN → sending token to backend");

            const res = await googleLoginApi(idToken);

            localStorage.setItem("access_token", res.accessToken);
            setUser(res.user);

            return res.user;

        } catch (e) {
            console.error("GOOGLE LOGIN ERROR:", e);
            throw e;
        }
    };

    // ---------------------------------------------------------
    // logout
    // ---------------------------------------------------------
    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, googleLogin }}
        >
            {children}
        </AuthContext.Provider>
    );
}

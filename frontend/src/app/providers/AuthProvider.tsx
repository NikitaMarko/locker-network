import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../modules/shared/types/user";
import { AuthContext } from "./AuthContext";
import { http } from "../../api/httpClient";
import { googleLoginApi, loginApi, registerApi } from "../../api/authApi";
import { USE_MOCK } from "../../config/env";
import { BLOCK_TIME, MAX_ATTEMPTS } from "../utils/constans.ts";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [attempts, setAttempts] = useState(0);
    const [block, setBlock] = useState<number | null>(null);

    // INIT
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("access_token");

            if (USE_MOCK) return;
            if (!token) return;

            try {
                const res = await http.get("/auth/me");
                setUser(res.data.user);
            } catch {
                localStorage.removeItem("access_token");
                setUser(null);
            }
        };

        initAuth().finally(() => setLoading(false));
    }, []);

    // LOGIN
    const login = async (email: string, password: string): Promise<User> => {

        if (block && Date.now() < block) {
            const mins = Math.ceil((block - Date.now()) / 60000);
            const error = new Error(`Too many attempts. Wait ${mins} minutes.`);
            error.name = "BLOCK_TIME";
            throw error;
        }

        try {
            if (USE_MOCK) {
                const mockUser: User = {
                    userId: "1",
                    email,
                    name: "Mock User",
                    role: "USER",
                };

                localStorage.setItem("access_token", "mock_token");
                setUser(mockUser);

                setAttempts(0);
                setBlock(null);

                return mockUser;
            }

            const res = await loginApi(email, password);

            setAttempts(0);
            setBlock(null);

            localStorage.setItem("access_token", res.accessToken);
            setUser(res.user);

            return res.user;

        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setBlock(Date.now() + BLOCK_TIME);
            }

            throw err;
        }
    };

    // REGISTER
    const register = async (
        email: string,
        password: string,
        name: string,
        phone?: string
    ): Promise<User> => {

        if (USE_MOCK) {
            return {
                userId: "1",
                email,
                name,
                role: "USER",
                phone,
            };
        }

        const res = await registerApi({
            email,
            password,
            name,
            phone,
        });

        return res.user;
    };

    // GOOGLE LOGIN
    const googleLogin = async (idToken: string): Promise<User> => {

        if (USE_MOCK) {
            const mockUser: User = {
                userId: "1",
                name: "Google Mock User",
                email: "mock@gmail.com",
                role: "USER",
            };

            localStorage.setItem("access_token", "mock_token");
            setUser(mockUser);

            return mockUser;
        }

        const res = await googleLoginApi(idToken);

        localStorage.setItem("access_token", res.accessToken);
        setUser(res.user);

        return res.user;
    };

    // LOGOUT (без перезагрузки)
    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, googleLogin }}
        >
            {children}
        </AuthContext.Provider>
    );
}
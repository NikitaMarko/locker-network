
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../modules/shared/types/user";
import { AuthContext } from "./AuthContext";
import { http } from "../../api/httpClient";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // ---------------------------------------------------------
    // Проверяем токен и загружаем текущего пользователя
    // ---------------------------------------------------------
    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setLoading(false);
            return;
        }

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
        const res = await http.post("/auth/login", { email, password });

        localStorage.setItem("access_token", res.data.accessToken);
        setUser(res.data.user);

        return res.data.user;
    };

    // ---------------------------------------------------------
    // регистрация
    // ---------------------------------------------------------
    const register = async (email: string, password: string, name: string): Promise<User> => {
        const res = await http.post("/auth/register", { email, password, name });

        localStorage.setItem("access_token", res.data.accessToken);
        setUser(res.data.user);

        return res.data.user;
    };

    // ---------------------------------------------------------
    // Logout
    // ---------------------------------------------------------
    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

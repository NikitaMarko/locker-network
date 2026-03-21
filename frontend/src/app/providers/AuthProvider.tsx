// src/app/providers/AuthProvider.tsx

import { useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../modules/shared/types/user";
import { AuthContext } from "./AuthContext";
import { http } from "../../api/httpClient";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

    // 🔹 Временный пользователь для разработки
    const fakeUser: User = {
        userId: "demo-1",
        email: "demo@example.com",
        name: "Demo User",
        role: "USER",
        phone: "+1234567890",
    };

    // 🔹 Начальное состояние — пользователь авторизован
    const [user, setUser] = useState<User | null>(fakeUser);

    // 🔹 Пока backend не подключён — загрузки нет
    const loading = false;

    // ---------------------------------------------------------
    // 🔸 Реальный useEffect для продакшена (пока отключён)
    // ---------------------------------------------------------
    /*
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
    */

    // 🔹 login возвращает User
    const login = async (email: string, password: string): Promise<User> => {
        // ВРЕМЕННЫЙ ЛОГИН
        setUser(fakeUser);
        return fakeUser;

        /*
        // Реальный логин
        const res = await http.post("/auth/login", { email, password });
        localStorage.setItem("access_token", res.data.accessToken);
        setUser(res.data.user);
        return res.data.user;
        */
    };

    // 🔹 register возвращает User
    const register = async (email: string, password: string, name: string): Promise<User> => {
        // ВРЕМЕННАЯ РЕГИСТРАЦИЯ
        setUser(fakeUser);
        return fakeUser;

        /*
        // Реальная регистрация
        const res = await http.post("/auth/register", { email, password, name });
        localStorage.setItem("access_token", res.data.accessToken);
        setUser(res.data.user);
        return res.data.user;
        */
    };

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

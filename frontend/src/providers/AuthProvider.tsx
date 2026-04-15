import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/user/user.ts";
import { AuthContext } from "./AuthContext";
import {googleLoginApi, loginApi, registerApi, meApi, logoutApi} from "../api/authApi";
import { BLOCK_TIME, MAX_ATTEMPTS } from "../config/constants/constants.ts";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [attempts, setAttempts] = useState(0);
    const [block, setBlock] = useState<number | null>(null);


    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const currentUser = await meApi();
                setUser(currentUser);
            } catch {
                localStorage.removeItem("access_token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);


    const login = async (email: string, password: string): Promise<User> => {
        if (block && Date.now() < block) {
            const mins = Math.ceil((block - Date.now()) / 60000);
            const error = new Error(`Too many attempts. Wait ${mins} minutes.`);
            error.name = "BLOCK_TIME";
            throw error;
        }

        try {
            const res = await loginApi(email, password);
            setAttempts(0);
            setBlock(null);

            localStorage.setItem("access_token", res.accessToken);
            const currentUser = await meApi();

            if (!currentUser) {
                throw new Error("Failed to load user profile");
            }

            setUser(currentUser);
            return currentUser;

        } catch (err) {
            console.error("error in progress to get login", err);
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= MAX_ATTEMPTS) {
                setBlock(Date.now() + BLOCK_TIME);
            }
            throw err;
        }
    };


    const register = async (email: string, password: string, name: string, phone: string): Promise<any> => {
        return await registerApi(email, password, name, phone);
    };


    const googleLogin = async (idToken: string): Promise<User> => {

        const res = await googleLoginApi(idToken);
        localStorage.setItem("access_token", res.accessToken);

        const currentUser = await meApi();

        if (!currentUser) {
            throw new Error("Failed to load user profile");
        }

        setUser(currentUser);
        return currentUser;
    };

    const logout = async () => {
        try{
            await logoutApi();
        }catch (err){
            // логируем
        }finally {
            localStorage.removeItem("access_token");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
}

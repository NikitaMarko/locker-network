import { createContext } from "react";
import type { User } from "../types/user/user.ts";

export type AuthContextValue = {
    user: User | null;
    loading: boolean;


    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name: string, phone: string) => Promise<User>;
    googleLogin: (idToken: string) => Promise<User>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
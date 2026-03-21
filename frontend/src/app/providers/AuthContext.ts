import { createContext } from "react";
import type { User } from "../../modules/shared/types/user";

export type AuthContextValue = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name: string) => Promise<User>; // ← добавили
    logout: () => void;
};


export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication Store Module
 * Manages authentication state with clean architecture
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { loginApi, meApi, type LoginResponse, type User } from "../api/authApi";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    initializeAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ============================================================
// AUTH STORE IMPLEMENTATION
// ============================================================

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set, get) => ({
                // State
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                // Actions
                login: async (email: string, password: string) => {
                    set({ isLoading: true, error: null });

                    try {
                        // 1. Делаем логин и получаем ТОЛЬКО токен
                        const response: LoginResponse = await loginApi(email, password);

                        // 2. Сразу кладем токен в localStorage, чтобы apiClient мог его читать
                        localStorage.setItem("access_token", response.accessToken);

                        // 3. Дергаем meApi, чтобы получить данные пользователя (роль, имя и т.д.)
                        const user = await meApi();

                        if (!user) {
                            throw new Error("Failed to fetch user data after login");
                        }

                        set({
                            user: user,
                            token: response.accessToken,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    } catch (err) {
                        const errorMessage =
                            err instanceof Error ? err.message : "Login failed. Please try again.";

                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: errorMessage,
                        });

                        localStorage.removeItem("access_token");

                        throw new Error(errorMessage);
                    }
                },

                logout: () => {
                    /**
                     * Clears authentication state on logout
                     */
                    localStorage.removeItem("access_token");

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                },

                clearError: () => {
                    set({ error: null });
                },

                initializeAuth: () => {
                    const state = get();
                    if (state.token && state.user) {
                        /** Select only the authentication status */
                        localStorage.setItem("access_token", state.token);
                        set({ isAuthenticated: true });
                    }
                },
            }),
            {
                name: "auth-storage", // LocalStorage key для Zustand
                partialize: (state) => ({
                    user: state.user,
                    token: state.token,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        ),
        { name: "AuthStore" }
    )
);

// ============================================================
// SELECTOR HOOKS
// ============================================================
/** Select only the authentication status */
export const useIsAuthenticated = () =>
    useAuthStore((state) => state.isAuthenticated);
/** Select the current user */
export const useCurrentUser = () => useAuthStore((state) => state.user);
/** Select loading state */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
/** Select error message */
export const useAuthError = () => useAuthStore((state) => state.error);
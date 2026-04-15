/**
 * Authentication Store Module
 * Manages authentication state with clean architecture
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { loginApi, type LoginResponse, type User } from "../api/authApi";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/** Authentication state structure */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/** Authentication actions */
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

/** Combined auth store type */
export type AuthStore = AuthState & AuthActions;

// ============================================================
// AUTH STORE IMPLEMENTATION
// ============================================================

/**
 * Creates the authentication store with Zustand
 * Handles login, logout, token management, and error states
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ─────────────────────────────────────────────────────
        // State
        // ─────────────────────────────────────────────────────
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // ─────────────────────────────────────────────────────
        // Actions
        // ─────────────────────────────────────────────────────

        /**
         * Authenticates user and stores session
         */
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const response: LoginResponse = await loginApi(email, password);

            set({
              user: response.user,
              token: response.token,
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

            throw new Error(errorMessage);
          }
        },

        /**
         * Clears authentication state on logout
         */
        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        },

        /**
         * Clears any error messages
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Initializes auth state from stored session
         * Called on app startup
         */
        initializeAuth: () => {
          const state = get();
          if (state.token && state.user) {
            set({ isAuthenticated: true });
          }
        },
      }),
      {
        name: "auth-storage", // LocalStorage key
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
// SELECTOR HOOKS (Performance Optimization)
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

/**
 * Login Page Component
 * Clean, maintainable login form with proper error handling
 */

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useIsAuthenticated, useAuthLoading, useAuthError } from "../../store/authStore";
import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import "./LoginPage.scss";

// ============================================================
// COMPONENT PROPS
// ============================================================

interface LoginPageProps {
  /** Optional redirect path after successful login */
  redirectTo?: string;
}

// ============================================================
// COMPONENT
// ============================================================

/**
 * Login page with form validation and error handling
 * Follows Single Responsibility Principle - handles only login UI logic
 */
export const LoginPage = ({ redirectTo = "/" }: LoginPageProps) => {
  // ─────────────────────────────────────────────────────────
  // Hooks
  // ─────────────────────────────────────────────────────────

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();

  // ─────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────

  /** Redirect if already authenticated */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // ─────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────

  /**
   * Handles form submission
   * Validates inputs before calling login API
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Basic validation
      if (!email || !password) {
        return;
      }

      try {
        await login(email, password);
        // Navigation happens via useEffect when isAuthenticated changes
      } catch {
        // Error is handled by the store
      }
    },
    [login]
  );

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <div className="login-page">
      <div className="login-page__container">
        <h1 className="login-page__title">Welcome Back</h1>
        <p className="login-page__subtitle">Sign in to your account</p>

        <form className="login-page__form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-page__error" role="alert">
              {error}
            </div>
          )}

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            required
            autoComplete="email"
          />

          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="login-page__footer">
          <span>Don't have an account?</span>
          <a href="/register" className="login-page__link">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default LoginPage;

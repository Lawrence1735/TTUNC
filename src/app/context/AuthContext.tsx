/**
 * AuthContext.tsx
 * Global auth state. Replaces the mockUsers-based login in App.tsx.
 *
 * Usage:
 *   Wrap your app in <AuthProvider> then call useAuth() anywhere.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService, type AuthUser } from '../services/authService';
import { type AxiosError } from 'axios';

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Call on login form submit */
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Call on logout button */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getStoredUser(),
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * On mount, if we have a stored token, verify it against the server.
   * This catches expired tokens that were left in localStorage.
   */
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    authService
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('auth_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
      });
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const { user: loggedInUser } = await authService.login({ email, password });
        setUser(loggedInUser);
        return { success: true };
      } catch (err) {
        const axiosErr = err as AxiosError<{ message: string }>;
        const message =
          axiosErr.response?.data?.message ?? 'Invalid email or password.';
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

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
import { clearToken, getToken } from '../services/api';
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
    selectedRole?: string,
  ) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
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
   * On mount, if we have a token, verify it against the server.
   */
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    authService
      .me()
      .then((freshUser) => {
        setUser(freshUser);
      })
      .catch(() => {
        // Token invalid — clear auth state
        clearToken();
        setUser(null);
      });
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      selectedRole?: string,
    ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
      setIsLoading(true);
      try {
        const { user: loggedInUser } = await authService.login({ email, password });

        const normalizedSelected = selectedRole === 'trainee' ? 'student' : selectedRole;
        const normalizedActual = loggedInUser.role === 'trainee' ? 'student' : loggedInUser.role;
        if (normalizedSelected && normalizedActual !== normalizedSelected) {
          await authService.logout();
          return {
            success: false,
            error: `Login As mismatch: this account is ${loggedInUser.role}, not ${selectedRole}.`,
          };
        }

        setUser(loggedInUser);
        return { success: true, user: loggedInUser };
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

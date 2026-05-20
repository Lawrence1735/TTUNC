/**
 * authService.ts
 * Wraps POST /api/v1/auth/login, POST /api/v1/auth/logout, GET /api/v1/auth/me
 */

import { api, setToken, clearToken } from './api';

// ── Types (mirrors UserResource from Laravel) ─────────────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'trainee';
  talent_group: string | null;
  student_id: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ── Auth service ──────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Authenticate and store the token.
   * Returns the user so the caller can update app state immediately.
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    setToken(data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data;
  },

  /**
   * Revoke the current token on the server, then clear local storage.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearToken();
    }
  },

  /**
   * Fetch the currently authenticated user from the server.
   */
  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  },

  /**
   * Rehydrate user from localStorage (sync, no network).
   * Use this on app start to avoid a flash of unauthenticated state.
   */
  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
};

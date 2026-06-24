/**
 * authService.ts
 * Wraps POST /api/v1/auth/login, POST /api/v1/auth/logout, GET /api/v1/auth/me
 */

import { api, setToken, clearToken } from './api';

// ── Types (mirrors UserResource from Laravel) ─────────────────────────────────
export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'scholar' | 'student' | 'trainee';
  talent_group?: string | null;
  talentGroup?: string;
  student_id?: string | null;
  phone?: string;
  is_active?: boolean;
  trainingStatus?: string;
  applicationStatus?: string;
  created_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  email: string;
  role?: 'admin' | 'director' | 'scholar' | 'trainee' | 'student';
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// ── Auth service ──────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Authenticate and store the token.
   * Returns the user so the caller can update app state immediately.
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('auth/login', payload);
    // Normalize snake_case backend fields to camelCase
    const user: AuthUser = {
      ...data.user,
      talentGroup: (data.user as any).talent_group ?? data.user.talentGroup,
      trainingStatus: (data.user as any).training_status ?? data.user.trainingStatus,
      applicationStatus: (data.user as any).application_status ?? data.user.applicationStatus,
    };
    setToken(data.token);
    return { token: data.token, user };
  },

  async logout(): Promise<void> {
    try {
      await api.post('logout');
    } finally {
      clearToken();
    }
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('me');
    return data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('auth/forgot-password', payload);
    return data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('auth/reset-password', payload);
    return data;
  },

  /**
   * Rehydrate user from storage.
   * Intentionally returns null: authentication state is validated from backend /me.
   */
  getStoredUser(): AuthUser | null {
    return null;
  },
};

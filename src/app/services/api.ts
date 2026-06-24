/**
 * api.ts
 * Base Axios client for TalentTrackUNC.
 * All requests go to the Laravel backend at /api/v1.
 */

import axios, { AxiosError, type AxiosInstance } from 'axios';

let inMemoryToken: string | null = null;
const TOKEN_STORAGE_KEY = 'ttunc_auth_token';

const readStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

const writeStoredToken = (token: string | null) => {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

inMemoryToken = readStoredToken();

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// ── Axios instance ─────────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false, // Using token auth (Sanctum), not cookie sessions
});

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = inMemoryToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const isAuthLoginRequest = requestUrl.includes('auth/login');

      // Keep login failures local to the login form. Only clear stale auth state
      // for protected endpoint 401 responses.
      if (!isAuthLoginRequest) {
        inMemoryToken = null;
      }
    }
    return Promise.reject(error);
  },
);

// ── Token helpers ─────────────────────────────────────────────────────────────
export const setToken = (token: string) => {
  inMemoryToken = token;
  writeStoredToken(token);
};
export const clearToken = () => {
  inMemoryToken = null;
  writeStoredToken(null);
};
export const getToken = () => inMemoryToken ?? readStoredToken();

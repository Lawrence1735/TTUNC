/**
 * api.ts
 * Base Axios client for TalentTrackUNC.
 * All requests go to the Laravel backend at /api/v1.
 */

import axios, { AxiosError, type AxiosInstance } from 'axios';

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
  const token = localStorage.getItem('auth_token');
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
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

// ── Token helpers ─────────────────────────────────────────────────────────────
export const setToken = (token: string) => localStorage.setItem('auth_token', token);
export const clearToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};
export const getToken = () => localStorage.getItem('auth_token');

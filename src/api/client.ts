import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Case transformation utilities
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformKeys(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);

  const transformed: any = {};
  for (const key in obj) {
    const camelKey = toCamelCase(key);
    transformed[camelKey] = transformKeys(obj[key]);
  }
  return transformed;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: error handling + case transformation
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Transform response data from snake_case to camelCase
    if (response.data) {
      response.data = transformKeys(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401 Unauthorized: attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }
        );

        const { token: newToken } = refreshResponse.data;
        if (newToken) {
          // Update stored token
          localStorage.setItem('auth_token', newToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors or failed refresh, reject
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }

    // Create a more useful error object
    const errorData = {
      status: error.response?.status,
      message: error.response?.statusText || error.message,
      data: error.response?.data,
      errors: (error.response?.data as any)?.errors || {},
    };

    return Promise.reject(errorData);
  }
);

export default apiClient;

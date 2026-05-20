import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import apiClient from '../api/client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'student' | 'scholar';
  studentId?: string;
  phone?: string;
  talentGroup?: string;
  applicationStatus?: string;
  trainingStatus?: string;
  yearLevel?: string;
  course?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  assignedInstrument?: string;
  assignedVoice?: string;
  scholarshipPercentage?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Decode JWT to get expiration time
  const getTokenExpiration = (jwtToken: string): number | null => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;
      const decoded = JSON.parse(atob(parts[1]));
      return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
    } catch {
      return null;
    }
  };

  // Schedule token refresh before expiration
  const scheduleTokenRefresh = (jwtToken: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expirationTime = getTokenExpiration(jwtToken);
    if (!expirationTime) return;

    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;
    
    // Refresh token 5 minutes before expiration
    const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 1000);

    refreshTimeoutRef.current = setTimeout(() => {
      refreshTokenFn();
    }, refreshTime);
  };

  // Attempt to refresh the token
  const refreshTokenFn = async (): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token: newToken } = response.data;

      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        scheduleTokenRefresh(newToken);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      // Clear auth on refresh failure
      clearAuth();
      return false;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token_expiration');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        // STRICT LOADING LATCH: Check for localStorage immediately
        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // IMMEDIATELY restore from localStorage
            setToken(storedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
            scheduleTokenRefresh(storedToken);

            // Non-blocking: Try to refresh user data, but don't break session if it fails
            try {
              const response = await apiClient.get('/auth/me');
              if (response.data) {
                const updatedUser = response.data;
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
              }
            } catch (meErr) {
              // If /auth/me fails, DON'T clear auth - we already have valid data
              console.warn('Failed to refresh user data from /auth/me:', meErr);
              // Token is still valid until exp claim says otherwise
              // Keep using stored session
            }
          } catch (parseErr) {
            console.error('Failed to parse stored user data:', parseErr);
            clearAuth();
          }
        } else {
          // No stored credentials
          setIsAuthenticated(false);
        }
      } finally {
        // CRITICAL: Set isLoading to false BEFORE any routing happens
        // This prevents ProtectedRoute from redirecting while session restores
        setIsLoading(false);
      }
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token: responseToken, user: responseUser } = response.data;

      // Save to localStorage
      localStorage.setItem('auth_token', responseToken);
      localStorage.setItem('auth_user', JSON.stringify(responseUser));

      // Update state
      setToken(responseToken);
      setUser(responseUser);
      setIsAuthenticated(true);

      // Schedule token refresh
      scheduleTokenRefresh(responseToken);

      return { success: true };
    } catch (err: any) {
      const errorMsg = err.data?.message || 'Invalid credentials';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Even if logout API fails, clear local auth
      console.error('Logout API error:', err);
    } finally {
      clearAuth();
    }
  };

  const me = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data;

      // Update localStorage and state
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      // If /me fails, user is not authenticated
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        me,
        setUser,
        refreshToken: refreshTokenFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

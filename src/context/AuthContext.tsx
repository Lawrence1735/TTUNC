import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { api as apiClient } from '../app/services/api';
import { clearToken as clearApiToken, getToken as getApiToken, setToken as setApiToken } from '../app/services/api';
import { toast } from 'sonner';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'student' | 'scholar' | 'trainee';
  studentId?: string;
  phone?: string;
  talentGroup?: string;
  applicationStatus?: string;
  trainingStatus?: string;
  yearLevel?: string;
  course?: string;
  department?: string;
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
  login: (email: string, password: string, selectedRole?: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
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
      const response = await apiClient.post('auth/refresh');
      const { token: newToken } = response.data;

      if (newToken) {
        setApiToken(newToken);
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
    clearApiToken();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getApiToken();

        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          scheduleTokenRefresh(storedToken);

          try {
            const response = await apiClient.get('me');
            if (response.data) {
              const raw = response.data;
              const normalizedUser: AuthUser = {
                id: raw.id,
                name: raw.name,
                email: raw.email,
                role: raw.role,
                talentGroup: raw.talent_group ?? raw.talentGroup,
                studentId: raw.student_id ?? raw.studentId,
                phone: raw.phone,
                applicationStatus: raw.application_status ?? raw.applicationStatus,
                trainingStatus: raw.training_status ?? raw.trainingStatus,
                yearLevel: raw.year_level ?? raw.yearLevel,
                course: raw.course,
                department: raw.department,
                address: raw.address,
                createdAt: raw.created_at ?? raw.createdAt,
              };
              setUser(normalizedUser);
            }
          } catch (meErr) {
            console.warn('Failed to refresh user data from /auth/me:', meErr);
          }
        } else {
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
    password: string,
    selectedRole?: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await apiClient.post('auth/login', {
        email,
        password,
        ...(selectedRole ? { role: selectedRole } : {}),
      });

      const { token: responseToken, user: responseUser } = response.data;

      // Normalize snake_case fields from backend
      const normalizedUser: AuthUser = {
        id: responseUser.id,
        name: responseUser.name,
        email: responseUser.email,
        role: responseUser.role,
        talentGroup: responseUser.talent_group ?? responseUser.talentGroup,
        studentId: responseUser.student_id ?? responseUser.studentId,
        phone: responseUser.phone,
        applicationStatus: responseUser.application_status ?? responseUser.applicationStatus,
        trainingStatus: responseUser.training_status ?? responseUser.trainingStatus,
        yearLevel: responseUser.year_level ?? responseUser.yearLevel,
        course: responseUser.course,
        department: responseUser.department,
        address: responseUser.address,
      };

      setApiToken(responseToken);

      // Update state
      setToken(responseToken);
      setUser(normalizedUser);
      setIsAuthenticated(true);

      // Schedule token refresh
      scheduleTokenRefresh(responseToken);

      return { success: true, user: normalizedUser };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.data?.message || 'Invalid credentials';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('logout');
    } catch (err) {
      // Even if logout API fails, clear local auth
      console.error('Logout API error:', err);
    } finally {
      clearAuth();
    }
  };

  const me = async (): Promise<void> => {
    try {
      const response = await apiClient.get('me');
      const raw = response.data;
      const normalizedUser: AuthUser = {
        id: raw.id,
        name: raw.name,
        email: raw.email,
        role: raw.role,
        talentGroup: raw.talent_group ?? raw.talentGroup,
        studentId: raw.student_id ?? raw.studentId,
        phone: raw.phone,
        applicationStatus: raw.application_status ?? raw.applicationStatus,
        trainingStatus: raw.training_status ?? raw.trainingStatus,
        yearLevel: raw.year_level ?? raw.yearLevel,
        course: raw.course,
        department: raw.department,
        address: raw.address,
        createdAt: raw.created_at ?? raw.createdAt,
      };
      setUser(normalizedUser);
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

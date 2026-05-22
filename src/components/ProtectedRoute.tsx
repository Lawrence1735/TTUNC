import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7A1E1E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6C757D]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // AuthContext handles redirect in client.ts
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#7A1E1E] mb-2">Unauthorized</h1>
          <p className="text-[#6C757D]">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

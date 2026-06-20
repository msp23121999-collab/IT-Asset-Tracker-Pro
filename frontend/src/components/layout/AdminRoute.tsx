import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { auditService } from '@/services/auditService';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If not loading, user exists, but they don't have admin privileges
    if (!isLoading && user && user.role !== 'super_admin' && user.role !== 'it_admin') {
      auditService.logUnauthorizedAccess(user, location.pathname);
    }
  }, [isLoading, user, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'super_admin' && user.role !== 'it_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

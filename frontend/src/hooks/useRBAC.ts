import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/types/user';
import type { UserRole } from '@/types/user';

export const useRBAC = () => {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };

  const isSuperAdmin = (): boolean => {
    return isAuthenticated && user?.role === 'super_admin';
  };

  const isITAdmin = (): boolean => {
    return isAuthenticated && (user?.role === 'it_admin' || user?.role === 'super_admin');
  };

  const isEmployee = (): boolean => {
    return isAuthenticated && user?.role === 'employee';
  };

  return {
    role: user?.role || null,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isITAdmin,
    isEmployee,
  };
};

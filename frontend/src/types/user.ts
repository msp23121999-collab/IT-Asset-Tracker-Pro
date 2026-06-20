// ============================================================
// User & Auth Types — RBAC roles and session management
// Used by: AuthContext, useAuth, useRBAC, route guards
// ============================================================

export type UserRole = 'super_admin' | 'it_admin' | 'employee';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// RBAC Permission Matrix
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'assets.create', 'assets.read', 'assets.update', 'assets.delete', 'assets.archive',
    'assets.bulk_import', 'assets.bulk_export',
    'employees.create', 'employees.read', 'employees.update', 'employees.delete',
    'assignments.create', 'assignments.approve', 'assignments.reject',
    'reports.generate', 'reports.export',
    'settings.manage', 'settings.departments', 'settings.categories',
    'audit.view',
    'users.manage', 'users.roles',
    'notifications.manage',
    'ai.insights',
  ],
  it_admin: [
    'assets.create', 'assets.read', 'assets.update', 'assets.archive',
    'assets.bulk_import', 'assets.bulk_export',
    'employees.read', 'employees.update',
    'assignments.create', 'assignments.approve', 'assignments.reject',
    'reports.generate', 'reports.export',
    'settings.manage',
    'audit.view',
    'notifications.manage',
    'ai.insights',
  ],
  employee: [
    'assets.read',
    'employees.read',
    'assignments.create',
    'reports.generate',
    'notifications.view',
  ],
};

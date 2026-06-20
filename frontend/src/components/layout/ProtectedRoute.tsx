import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasRole, hasPermission } = useRBAC();
  const location = useLocation();

  // Premium loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#071224] flex flex-col items-center justify-center z-50 text-[#E2E8F0] font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#18B6FF]/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#18B6FF]/20 border-t-[#18B6FF] rounded-full animate-spin"></div>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="text-[#18B6FF] animate-pulse" size={20} />
            <span className="font-semibold tracking-wider text-sm">IT Asset Tracker Pro</span>
          </div>
          <span className="text-xs text-[#94A3B8]">Securing your connection...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page and remember the original request location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Role guards
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <AccessDenied reason={`This section is restricted to: ${allowedRoles.join(', ')}`} />;
  }

  // Check Permission guards
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied reason={`You do not have the required permission: "${requiredPermission}"`} />;
  }

  return children ? <>{children}</> : null;
};

// Access Denied inline card
const AccessDenied: React.FC<{ reason: string }> = ({ reason }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[#E2E8F0] bg-[#071224] rounded-xl border border-[#19304D]/80">
      <div className="w-16 h-16 bg-[#FF4D4D]/10 border border-[#FF4D4D]/25 rounded-2xl flex items-center justify-center mb-4 text-[#FF4D4D] shadow-[0_0_15px_rgba(255,77,77,0.1)]">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
      <p className="text-sm text-[#94A3B8] max-w-md mb-1 leading-relaxed">
        You do not have the necessary security credentials to access this department console.
      </p>
      <p className="text-xs text-[#FF4D4D] bg-[#FF4D4D]/5 px-3 py-1.5 rounded-lg border border-[#FF4D4D]/15 mt-3 font-mono font-medium">
        {reason}
      </p>
      <div className="text-xs text-[#64748B] mt-8">
        If you believe this is an error, please contact your workspace Super Administrator.
      </div>
    </div>
  );
};

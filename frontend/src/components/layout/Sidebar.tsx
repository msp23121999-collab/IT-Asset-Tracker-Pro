import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  Users, 
  AppWindow, 
  KeyRound, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ADMIN_NAV_ITEMS, 
  ADMIN_BOTTOM_NAV,
  EMPLOYEE_NAV_ITEMS,
  EMPLOYEE_BOTTOM_NAV
} from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Monitor: <Monitor size={20} />,
  Users: <Users size={20} />,
  AppWindow: <AppWindow size={20} />,
  KeyRound: <KeyRound size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  BarChart3: <BarChart3 size={20} />,
  Settings: <Settings size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
  UserCheck: <UserCheck size={20} />,
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Role Badge Config
  const getRoleConfig = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          color: 'text-[#18B6FF] border-[#18B6FF]/30 bg-[#18B6FF]/5',
          icon: <ShieldAlert size={10} className="text-[#18B6FF]" />
        };
      case 'it_admin':
        return {
          label: 'IT Admin',
          color: 'text-[#00D084] border-[#00D084]/30 bg-[#00D084]/5',
          icon: <ShieldCheck size={10} className="text-[#00D084]" />
        };
      default:
        return {
          label: 'Employee',
          color: 'text-[#FFB020] border-[#FFB020]/30 bg-[#FFB020]/5',
          icon: <UserCheck size={10} className="text-[#FFB020]" />
        };
    }
  };

  const roleConfig = getRoleConfig(user?.role);

  return (
    <aside className="w-66 bg-sidebar border-r border-borderLight flex flex-col h-full text-textSecondary font-sans">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-borderLight mb-4 relative shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#18B6FF]/10 border border-[#18B6FF]/20 flex items-center justify-center shadow-[0_0_10px_rgba(24,182,255,0.1)]">
            <span className="font-bold text-[#18B6FF] text-sm">AT</span>
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-none">Asset Tracker</div>
            <div className="text-[10px] text-textMuted mt-0.5 font-mono">v2.1 Enterprise</div>
          </div>
        </div>

        {/* Mock MacOS window dots */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D]/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFB020]/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D084]/80"></div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto min-h-0 py-2">
        {((user?.role === 'super_admin' || user?.role === 'it_admin') 
          ? ADMIN_NAV_ITEMS 
          : EMPLOYEE_NAV_ITEMS
        ).map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group",
                isActive 
                  ? "bg-[#18B6FF]/10 text-[#18B6FF] font-semibold border border-[#18B6FF]/25 shadow-[0_0_15px_rgba(24,182,255,0.05)]" 
                  : "hover:bg-card hover:text-foreground border border-transparent"
              )
            }
          >
            <span className="group-hover:scale-105 transition-transform duration-200">
              {iconMap[item.icon]}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile & Settings Section */}
      <div className="p-4 border-t border-borderLight bg-[#0D1B32]/30 space-y-3 shrink-0">
        {/* Settings Navigation Link */}
        {((user?.role === 'super_admin' || user?.role === 'it_admin') 
          ? ADMIN_BOTTOM_NAV 
          : EMPLOYEE_BOTTOM_NAV
        ).map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                isActive 
                  ? "bg-[#18B6FF]/10 text-[#18B6FF] font-semibold border border-[#18B6FF]/25" 
                  : "hover:bg-card hover:text-foreground border border-transparent"
              )
            }
          >
            {iconMap[item.icon]}
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-borderLight/50 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar circle */}
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#18B6FF]/20 to-[#00D084]/20 border border-borderLight flex items-center justify-center font-bold text-[#E2E8F0] text-sm shrink-0 shadow-md">
                {getInitials(user.displayName)}
              </div>
              
              {/* Details */}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate leading-tight" title={user.displayName}>
                  {user.displayName}
                </div>
                <div className="text-[10px] text-textMuted truncate mt-0.5" title={user.email}>
                  {user.email}
                </div>
                
                {/* Role Badge */}
                <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold mt-1", roleConfig.color)}>
                  {roleConfig.icon}
                  {roleConfig.label}
                </div>
              </div>
            </div>

            {/* Logout Icon */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-textMuted hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded-lg transition-all cursor-pointer shadow-sm"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

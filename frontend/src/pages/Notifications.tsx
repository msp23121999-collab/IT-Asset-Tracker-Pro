import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { ShieldAlert, Bell, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Notifications: React.FC = () => {
  const { notifications, isLoading, markAsRead, deleteNotification, unreadCount } = useNotifications();

  const getIcon = (type: string, isRead: boolean) => {
    const colorClass = isRead ? 'text-textMuted' : (type === 'warranty' ? 'text-[#FFB020]' : 'text-[#18B6FF]');
    switch (type) {
      case 'warranty': return <ShieldAlert size={20} className={colorClass} />;
      case 'assignment': return <CheckCircle2 size={20} className={colorClass} />;
      default: return <Bell size={20} className={colorClass} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent flex items-center gap-3">
            Notifications
            {isLoading && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-[#FF4D4D]/20 text-[#FF4D4D] px-2 py-0.5 rounded border border-[#FF4D4D]/30">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-textMuted mt-1">Alerts, warranty reminders, and messages from IT.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {notifications.length === 0 ? (
          <div className="bg-card border border-borderLight rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg h-64 opacity-80">
            <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center mb-4">
              <Bell size={24} className="text-textMuted" />
            </div>
            <h3 className="text-foreground font-medium mb-2">You're all caught up!</h3>
            <p className="text-sm text-textMuted max-w-[250px]">You have no new notifications.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                className={`group bg-card border rounded-xl p-4 transition-all flex items-start gap-4 ${
                  !notif.isRead 
                    ? 'border-[#18B6FF]/50 shadow-[0_0_15px_rgba(24,182,255,0.1)] bg-gradient-to-r from-[#18B6FF]/5 to-transparent' 
                    : 'border-borderLight hover:border-borderLight/80 opacity-80'
                }`}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif.id);
                }}
              >
                <div className="w-10 h-10 rounded-full bg-sidebar border border-borderLight flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type, notif.isRead)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-white' : 'font-semibold text-foreground'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-textSecondary' : 'text-textMuted'}`}>
                    {notif.message}
                  </p>
                  
                  {notif.assetId && (
                    <div className="mt-3 inline-block">
                      <span className="text-[11px] font-mono bg-sidebar border border-borderLight px-2 py-1 rounded text-textMuted">
                        Asset ID: {notif.assetId}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="shrink-0 flex items-center gap-2">
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                      className="text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primaryHover px-2 py-1 bg-primary/10 rounded border border-primary/20 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                    className="p-1.5 text-textMuted hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

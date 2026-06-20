import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { differenceInCalendarDays, parseISO, isValid, format } from 'date-fns';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import type { Asset } from '@/types/asset';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  metadata: {
    recipientEmail: string;
    emailType: string;
    assetId: string;
    daysRemaining: number;
    deliveryStatus: string;
  };
}

export const WarrantyDashboard: React.FC = () => {
  const { assets, isLoading: assetsLoading } = useAssets();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!db) {
        setLogsLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'audit_logs'),
          where('action', '==', 'EMAIL_SENT'),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AuditLog[];
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Calculate upcoming from active assets
  const upcoming20: Asset[] = [];
  const upcoming5: Asset[] = [];

  if (assets) {
    assets.forEach(asset => {
      if (!asset.warrantyEnd || !asset.assignedToEmail || !['active', 'in_use'].includes(asset.status)) return;
      
      const endDate = parseISO(asset.warrantyEnd);
      if (!isValid(endDate)) return;
      
      const daysLeft = differenceInCalendarDays(endDate, new Date());
      
      // Upcoming 20: 20 <= days <= 30 (just a window to show it's coming soon)
      if (daysLeft >= 20 && daysLeft <= 30 && !asset.twentyDayReminderSent) {
        upcoming20.push(asset);
      }
      
      // Upcoming 5: 5 <= days < 20
      if (daysLeft >= 5 && daysLeft < 20 && !asset.fiveDayReminderSent) {
        upcoming5.push(asset);
      }
    });
  }

  const sentLogs = logs.filter(log => log.metadata?.deliveryStatus === 'success');
  const failedLogs = logs.filter(log => log.metadata?.deliveryStatus === 'failed');

  if (assetsLoading || logsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="text-primary" /> Warranty Notifications
        </h1>
        <p className="text-textMuted mt-1">Automated warranty reminder system dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming 20-Day" count={upcoming20.length} icon={<Clock size={20} />} color="text-primary" bg="bg-primary/10" border="border-primary/20" />
        <StatCard title="Upcoming 5-Day" count={upcoming5.length} icon={<AlertTriangle size={20} />} color="text-[#FFB020]" bg="bg-[#FFB020]/10" border="border-[#FFB020]/20" />
        <StatCard title="Successfully Sent" count={sentLogs.length} icon={<CheckCircle2 size={20} />} color="text-[#00D084]" bg="bg-[#00D084]/10" border="border-[#00D084]/20" />
        <StatCard title="Failed Deliveries" count={failedLogs.length} icon={<XCircle size={20} />} color="text-[#FF4D4D]" bg="bg-[#FF4D4D]/10" border="border-[#FF4D4D]/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Section */}
        <div className="bg-card border border-borderLight rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-borderLight bg-sidebar/50">
            <h2 className="font-semibold text-foreground">Upcoming Reminders (Scheduled)</h2>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px]">
            {upcoming20.length === 0 && upcoming5.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm">No upcoming scheduled reminders.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-borderLight bg-sidebar text-textMuted uppercase tracking-wider text-xs">
                    <th className="p-3 font-medium">Asset</th>
                    <th className="p-3 font-medium">Employee</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Warranty Ends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {[...upcoming5, ...upcoming20].map(asset => {
                    const is5Day = upcoming5.includes(asset);
                    return (
                      <tr key={asset.id} className="hover:bg-sidebar/50 transition-colors group">
                        <td className="p-3">
                          <p className="font-medium text-foreground">{asset.name || asset.model}</p>
                          <p className="text-xs text-textMuted font-mono">{asset.assetId}</p>
                        </td>
                        <td className="p-3 text-textSecondary">{asset.assignedToName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${is5Day ? 'bg-[#FFB020]/10 text-[#FFB020] border border-[#FFB020]/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {is5Day ? '5-Day Notice' : '20-Day Notice'}
                          </span>
                        </td>
                        <td className="p-3 text-textSecondary">{asset.warrantyEnd}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="bg-card border border-borderLight rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-borderLight bg-sidebar/50">
            <h2 className="font-semibold text-foreground">Delivery History</h2>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px]">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm">No email delivery history found.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-borderLight bg-sidebar text-textMuted uppercase tracking-wider text-xs">
                    <th className="p-3 font-medium">Timestamp</th>
                    <th className="p-3 font-medium">Recipient</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {logs.map(log => {
                    const isSuccess = log.metadata?.deliveryStatus === 'success';
                    return (
                      <tr key={log.id} className="hover:bg-sidebar/50 transition-colors group">
                        <td className="p-3 text-textSecondary whitespace-nowrap">
                          {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                        </td>
                        <td className="p-3">
                          <p className="text-textSecondary">{log.metadata?.recipientEmail}</p>
                          <p className="text-xs text-textMuted font-mono">{log.metadata?.assetId}</p>
                        </td>
                        <td className="p-3 text-textSecondary">
                          {log.metadata?.emailType === 'warranty_20_days' ? '20-Day Notice' : '5-Day Notice'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {isSuccess ? (
                              <CheckCircle2 size={14} className="text-[#00D084]" />
                            ) : (
                              <XCircle size={14} className="text-[#FF4D4D]" />
                            )}
                            <span className={`text-xs font-medium ${isSuccess ? 'text-[#00D084]' : 'text-[#FF4D4D]'}`}>
                              {isSuccess ? 'Sent' : 'Failed'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, icon, color, bg, border }: any) => (
  <div className={`bg-card border ${border} rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-borderLight transition-colors`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-textMuted uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-foreground">{count}</span>
    </div>
  </div>
);

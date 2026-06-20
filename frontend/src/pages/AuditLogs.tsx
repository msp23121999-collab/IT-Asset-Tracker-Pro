import React, { useEffect, useState } from 'react';
import { auditService } from '@/services/auditService';
import { DataTable } from '@/components/shared/DataTable';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.fetchAuditLogs(500);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Time',
      cell: (info: any) => format(new Date(info.getValue()), 'PP pp')
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: (info: any) => (
        <span className="font-semibold text-white">
          {info.getValue()?.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      accessorKey: 'email',
      header: 'User Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: (info: any) => (
        <span className="px-2 py-1 rounded bg-[#18B6FF]/10 text-[#18B6FF] text-xs">
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: (info: any) => info.getValue() || <span className="text-textMuted">-</span>
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background text-textPrimary p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#FF4D4D] bg-clip-text text-transparent flex items-center gap-2">
            <ShieldAlert className="text-[#FF4D4D]" /> Audit Logs
          </h1>
          <p className="text-sm text-textMuted mt-1">Review system access, modifications, and Firebase transactions.</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-card border border-borderLight hover:bg-cardHover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-card border border-borderLight rounded-xl overflow-hidden flex flex-col">
        <DataTable
          data={logs}
          columns={columns}
        />
      </div>
    </div>
  );
};

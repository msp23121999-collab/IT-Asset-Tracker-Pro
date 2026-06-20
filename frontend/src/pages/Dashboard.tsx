import React from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AssetDistributionChart } from '@/components/dashboard/AssetDistributionChart';
import { DepartmentChart } from '@/components/dashboard/DepartmentChart';
import { LifecycleChart } from '@/components/dashboard/LifecycleChart';
import { ProcurementTrends } from '@/components/dashboard/ProcurementTrends';
import { useAssets } from '@/hooks/useAssets';
import { Activity, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { assets } = useAssets();
  
  // Generate realistic recent activities dynamically from in_use or maintenance assets
  const recentActivities = React.useMemo(() => {
    const activities: Array<{
      id: string;
      user: string;
      action: string;
      target: string;
      time: string;
      type: 'check_in' | 'check_out' | 'maintenance' | 'purchase';
    }> = [];

    // Filter some assets to build history
    const maintenanceAssets = assets.filter(a => a.status === 'maintenance').slice(0, 3);
    const inUseAssets = assets.filter(a => a.status === 'in_use').slice(0, 3);
    const recentPurchases = [...assets].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 3);

    maintenanceAssets.forEach((asset, idx) => {
      activities.push({
        id: `act-m-${idx}`,
        user: 'System Diagnostics',
        action: 'Sent to Maintenance',
        target: `${asset.brand} ${asset.model} (${asset.assetId})`,
        time: `${idx + 1} hours ago`,
        type: 'maintenance',
      });
    });

    inUseAssets.forEach((asset, idx) => {
      activities.push({
        id: `act-io-${idx}`,
        user: asset.assignedToName || 'IT Support',
        action: 'Checked Out',
        target: `${asset.brand} ${asset.model} (${asset.assetId})`,
        time: `${(idx + 1) * 2} hours ago`,
        type: 'check_out',
      });
    });

    recentPurchases.forEach((asset, idx) => {
      activities.push({
        id: `act-p-${idx}`,
        user: 'Procurement Dept',
        action: 'Registered Asset',
        target: `${asset.brand} ${asset.model} (${asset.assetId})`,
        time: `${idx + 1} days ago`,
        type: 'purchase',
      });
    });

    return activities.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 6);
  }, [assets]);

  return (
    <div className="flex flex-col gap-6 h-full text-[#E2E8F0] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#18B6FF] bg-clip-text text-transparent">
            Dashboard Console
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Real-time enterprise asset telemetry and stats overview</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end font-medium text-white text-sm">
            Cloud Sync <CheckCircle2 size={16} className="text-[#00D084]" />
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Last Sync: AWS S3 • 1 min ago</div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <StatsCards assets={assets} />

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <ProcurementTrends assets={assets} />
        </div>
        <div>
          <AssetDistributionChart assets={assets} />
        </div>
        <div>
          <LifecycleChart assets={assets} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department chart (takes 2 cols on lg) */}
        <div className="lg:col-span-2">
          <DepartmentChart assets={assets} />
        </div>

        {/* Recent Activity Card */}
        <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#18B6FF]/20 to-transparent"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <Activity size={16} className="text-[#18B6FF]" /> Recent System Activities
            </h3>
            <Link to="/assets" className="text-xs text-[#18B6FF] hover:underline flex items-center gap-0.5">
              View Fleet <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-start text-xs border-b border-[#19304D]/30 pb-3 last:border-0 last:pb-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                  act.type === 'check_out' ? 'bg-[#18B6FF]/5 border-[#18B6FF]/20 text-[#18B6FF]' :
                  act.type === 'maintenance' ? 'bg-[#FFB020]/5 border-[#FFB020]/20 text-[#FFB020]' :
                  act.type === 'purchase' ? 'bg-[#00D084]/5 border-[#00D084]/20 text-[#00D084]' :
                  'bg-[#64748B]/5 border-[#64748B]/20 text-[#94A3B8]'
                }`}>
                  <Clock size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-white truncate">{act.user}</span>
                    <span className="text-[10px] text-[#64748B] font-mono shrink-0 ml-2">{act.time}</span>
                  </div>
                  <div className="text-[#94A3B8]">
                    <span className="text-white/80">{act.action}</span> <span className="font-semibold text-[#18B6FF]">{act.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { Key, Search, AlertTriangle, CheckCircle2, Clock, Shield } from 'lucide-react';
import { addDays, isBefore, differenceInDays } from 'date-fns';

// Derive licenses from assets
const getLicenseFromAsset = (asset: any) => {
  const licenseMap: Record<string, { software: string; type: string; seats: number }> = {
    laptop:  { software: 'Microsoft Office 365', type: 'Per Device', seats: 1 },
    desktop: { software: 'Microsoft Office 365', type: 'Per Device', seats: 1 },
    server:  { software: 'Windows Server 2022', type: 'OEM', seats: 1 },
    phone:   { software: 'Microsoft Intune MDM', type: 'Per User', seats: 1 },
    tablet:  { software: 'Microsoft Intune MDM', type: 'Per User', seats: 1 },
    printer: { software: 'Print Management Suite', type: 'Site License', seats: 1 },
    router:  { software: 'Cisco Smart License', type: 'Subscription', seats: 1 },
    switch:  { software: 'Cisco Smart License', type: 'Subscription', seats: 1 },
    monitor: { software: 'N/A', type: 'Hardware Only', seats: 0 },
    accessory: { software: 'N/A', type: 'Hardware Only', seats: 0 },
    other:   { software: 'General License', type: 'Per Device', seats: 1 },
  };
  return licenseMap[asset.category] || licenseMap['other'];
};

const getLicenseStatus = (warrantyEnd: string) => {
  if (!warrantyEnd) return { label: 'No Expiry', color: '#00D084', urgent: false };
  const expiry = new Date(warrantyEnd);
  const now = new Date();
  const daysLeft = differenceInDays(expiry, now);
  if (daysLeft < 0) return { label: 'Expired', color: '#FF4D4D', urgent: true };
  if (daysLeft <= 90) return { label: `Expires in ${daysLeft}d`, color: '#FFB020', urgent: true };
  return { label: 'Active', color: '#00D084', urgent: false };
};

export const Licenses: React.FC = () => {
  const { assets, isLoading } = useAssets();
  const [search, setSearch] = useState('');

  const licenseData = useMemo(() => {
    return assets
      .filter(a => a.category !== 'monitor' && a.category !== 'accessory')
      .map(a => ({
        asset: a,
        license: getLicenseFromAsset(a),
        status: getLicenseStatus(a.warrantyEnd),
      }))
      .filter(l => {
        if (!search) return true;
        const q = search.toLowerCase();
        return l.asset.assetId.toLowerCase().includes(q) || l.license.software.toLowerCase().includes(q);
      });
  }, [assets, search]);

  const expiredCount = licenseData.filter(l => l.status.label === 'Expired').length;
  const expiringSoonCount = licenseData.filter(l => l.status.urgent && l.status.label !== 'Expired').length;
  const activeCount = licenseData.filter(l => !l.status.urgent).length;

  return (
    <div className="flex flex-col gap-6 h-full text-[#E2E8F0] font-sans overflow-y-auto pr-2 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#00D084] bg-clip-text text-transparent">
            License Management
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Monitor software license compliance, expiry dates, and seat allocation across your fleet</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Licenses', value: activeCount, icon: <CheckCircle2 size={20}/>, color: '#00D084', bg: 'bg-[#00D084]/10' },
          { label: 'Expiring Soon (<90d)', value: expiringSoonCount, icon: <Clock size={20}/>, color: '#FFB020', bg: 'bg-[#FFB020]/10' },
          { label: 'Expired Licenses', value: expiredCount, icon: <AlertTriangle size={20}/>, color: '#FF4D4D', bg: 'bg-[#FF4D4D]/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={16} />
        <input
          type="text"
          placeholder="Search by Asset ID or software..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#071224] border border-[#19304D] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#00D084]/60 outline-none"
        />
      </div>

      {/* License Table */}
      <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#19304D]/80 flex items-center gap-2 bg-[#071224]/50">
          <Shield size={16} className="text-[#00D084]" />
          <h3 className="text-sm font-semibold text-white">License Registry</h3>
          <span className="ml-auto text-xs text-[#94A3B8]">{licenseData.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#19304D]/50 text-[10px] text-[#94A3B8] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 font-medium">Software</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Assigned To</th>
                <th className="px-5 py-3 font-medium">Expiry (Warranty)</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#94A3B8]">Loading license data...</td></tr>
              ) : licenseData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#94A3B8]">
                  <Key size={32} className="mx-auto mb-2 opacity-30" />
                  No licenses found. Add assets in Asset Inventory to see license data here.
                </td></tr>
              ) : licenseData.map(({ asset, license, status }) => (
                <tr key={asset.id} className="border-b border-[#19304D]/30 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-mono text-xs text-[#00D084]">{asset.assetId}</div>
                    <div className="text-[11px] text-[#94A3B8] capitalize">{asset.category}</div>
                  </td>
                  <td className="px-5 py-3 text-[#E2E8F0] text-xs">{license.software}</td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">{license.type}</td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">{asset.assignedToName || 'Unassigned'}</td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">{asset.warrantyEnd || 'Not set'}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border" style={{ color: status.color, borderColor: `${status.color}30`, backgroundColor: `${status.color}10` }}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

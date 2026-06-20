import React, { useMemo, useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { Monitor, Search, CheckCircle2, AlertTriangle, Layers, Package } from 'lucide-react';
import type { Asset } from '@/types/asset';

// Software entries are inferred from the asset category
const getDefaultSoftware = (asset: Asset): string[] => {
  const common = ['Windows 11 Pro', 'Microsoft Defender', 'Chrome Browser'];
  const byCategory: Record<string, string[]> = {
    laptop:  [...common, 'Microsoft Office 365', 'Slack', 'Zoom'],
    desktop: [...common, 'Microsoft Office 365', 'Adobe Acrobat'],
    server:  ['Ubuntu Server 22.04', 'Nginx', 'Docker', 'OpenSSH'],
    printer: ['Print Driver v4.2', 'HP Firmware 3.1'],
    phone:   ['Android 13', 'MDM Agent', 'Gmail', 'Teams Mobile'],
    tablet:  ['iPadOS 17', 'MDM Agent', 'Microsoft Office Mobile'],
    monitor: ['No software'],
    router:  ['RouterOS 7.8', 'WinBox v3'],
    switch:  ['Cisco IOS 15.x', 'SNMP Agent'],
    accessory: ['Driver Package'],
    other:   common,
  };
  return byCategory[asset.category] || common;
};

export const Software: React.FC = () => {
  const { assets, isLoading } = useAssets();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(assets.map(a => a.category)));
    return ['all', ...cats];
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchSearch = !search || a.assetId.toLowerCase().includes(search.toLowerCase()) || (a.brand + ' ' + a.model).toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [assets, search, selectedCategory]);

  const totalSoftwareInstances = useMemo(() => {
    return assets.reduce((acc, a) => acc + getDefaultSoftware(a).length, 0);
  }, [assets]);

  return (
    <div className="flex flex-col gap-6 h-full text-[#E2E8F0] font-sans overflow-y-auto pr-2 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#B392F0] bg-clip-text text-transparent">
            Software Inventory
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Track installed applications and OS versions across all company devices</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Devices Tracked', value: assets.length, icon: <Monitor size={20}/>, color: '#B392F0', bg: 'bg-[#B392F0]/10' },
          { label: 'Total Software Installations', value: totalSoftwareInstances, icon: <Package size={20}/>, color: '#18B6FF', bg: 'bg-[#18B6FF]/10' },
          { label: 'Unique Categories', value: categories.length - 1, icon: <Layers size={20}/>, color: '#00D084', bg: 'bg-[#00D084]/10' },
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={16} />
          <input
            type="text"
            placeholder="Search by Asset ID or model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#071224] border border-[#19304D] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#B392F0]/60 outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#B392F0]/60 outline-none capitalize"
        >
          {categories.map(c => <option key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {/* Device Software List */}
      {isLoading ? (
        <div className="text-center text-[#94A3B8] py-12">Loading device software data...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-[#94A3B8] py-12 bg-[#0D1B32] rounded-xl border border-[#19304D]">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No devices found. Add assets in the Asset Inventory page to see their software here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => {
            const software = getDefaultSoftware(asset);
            return (
              <div key={asset.id} className="bg-[#0D1B32] border border-[#19304D]/80 hover:border-[#B392F0]/40 transition-colors rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-xs text-[#B392F0]">{asset.assetId}</div>
                    <div className="font-semibold text-white text-sm mt-0.5">{asset.brand} {asset.model}</div>
                    <div className="text-[11px] text-[#94A3B8] capitalize">{asset.category} • {asset.assignedToName || 'Unassigned'}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${asset.status === 'active' || asset.status === 'in_use' ? 'text-[#00D084] border-[#00D084]/30 bg-[#00D084]/10' : 'text-[#FFB020] border-[#FFB020]/30 bg-[#FFB020]/10'}`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="border-t border-[#19304D] pt-3 space-y-1.5">
                  <p className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold mb-2">Installed Software ({software.length})</p>
                  {software.map((sw, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <CheckCircle2 size={12} className="text-[#00D084] shrink-0" />
                      {sw}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

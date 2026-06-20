import React, { useMemo, useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { ShoppingCart, Search, Download, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const Procurement: React.FC = () => {
  const { assets, isLoading } = useAssets();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost'>('date');

  const procurementList = useMemo(() => {
    return assets
      .filter(a => a.purchaseDate || a.cost)
      .filter(a => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          a.assetId.toLowerCase().includes(q) ||
          (a.vendor || '').toLowerCase().includes(q) ||
          (a.brand + ' ' + a.model).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'cost') return (b.cost || 0) - (a.cost || 0);
        return (b.purchaseDate || '').localeCompare(a.purchaseDate || '');
      });
  }, [assets, search, sortBy]);

  const stats = useMemo(() => {
    const totalSpend = assets.reduce((sum, a) => sum + (a.cost || 0), 0);
    const vendors = new Set(assets.map(a => a.vendor).filter(Boolean));
    const thisYear = new Date().getFullYear().toString();
    const thisYearSpend = assets
      .filter(a => a.purchaseDate?.startsWith(thisYear))
      .reduce((sum, a) => sum + (a.cost || 0), 0);
    return { totalSpend, vendorCount: vendors.size, thisYearSpend };
  }, [assets]);

  const handleExport = () => {
    const headers = 'Asset ID,Brand,Model,Category,Vendor,Purchase Date,Cost ($),Department';
    const rows = procurementList.map(a =>
      `${a.assetId},${a.brand},${a.model},${a.category},${a.vendor || 'N/A'},${a.purchaseDate || 'N/A'},${a.cost || 0},${a.department || 'N/A'}`
    );
    const csv = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Procurement_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 h-full text-[#E2E8F0] font-sans overflow-y-auto pr-2 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#E2E8F0] to-[#FFB020] bg-clip-text text-transparent">
            Procurement Center
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">Track all hardware purchases, vendor relationships, and spending budgets</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#FFB020]/10 text-[#FFB020] border border-[#FFB020]/30 hover:bg-[#FFB020] hover:text-[#071224] px-4 py-2 rounded-md text-sm font-medium transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Procurement Spend', value: `$${stats.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={20}/>, color: '#FFB020', bg: 'bg-[#FFB020]/10' },
          { label: 'This Year Spend', value: `$${stats.thisYearSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <TrendingUp size={20}/>, color: '#18B6FF', bg: 'bg-[#18B6FF]/10' },
          { label: 'Total Vendors', value: stats.vendorCount || '—', icon: <Package size={20}/>, color: '#00D084', bg: 'bg-[#00D084]/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{stat.value}</h3>
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
            placeholder="Search Asset ID, vendor, model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#071224] border border-[#19304D] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#FFB020]/60 outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'cost')}
          className="bg-[#071224] border border-[#19304D] rounded-lg px-3 py-2 text-sm text-white focus:border-[#FFB020]/60 outline-none"
        >
          <option value="date">Sort by: Purchase Date</option>
          <option value="cost">Sort by: Cost (High → Low)</option>
        </select>
      </div>

      {/* Procurement Table */}
      <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#19304D]/80 flex items-center gap-2 bg-[#071224]/50">
          <ShoppingCart size={16} className="text-[#FFB020]" />
          <h3 className="text-sm font-semibold text-white">Purchase Ledger</h3>
          <span className="ml-auto text-xs text-[#94A3B8]">{procurementList.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#19304D]/50 text-[10px] text-[#94A3B8] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Asset ID</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12}/> Purchase Date</span>
                </th>
                <th className="px-5 py-3 font-medium text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#94A3B8]">Loading procurement data...</td></tr>
              ) : procurementList.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#94A3B8]">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No procurement records yet. Add assets with cost and vendor details in Asset Inventory.</p>
                </td></tr>
              ) : procurementList.map(asset => (
                <tr key={asset.id} className="border-b border-[#19304D]/30 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#FFB020]">{asset.assetId}</td>
                  <td className="px-5 py-3">
                    <div className="text-[#E2E8F0] text-xs font-medium">{asset.brand} {asset.model}</div>
                    <div className="text-[10px] text-[#94A3B8] capitalize">{asset.category}</div>
                  </td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">{asset.vendor || <span className="text-[#475569] italic">Not set</span>}</td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">{asset.department || '—'}</td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">{asset.purchaseDate || <span className="text-[#475569] italic">Not set</span>}</td>
                  <td className="px-5 py-3 text-right font-bold text-[#00D084] text-sm">
                    {asset.cost ? `$${asset.cost.toLocaleString()}` : <span className="text-[#475569] text-xs font-normal italic">Not set</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            {procurementList.length > 0 && (
              <tfoot>
                <tr className="border-t border-[#19304D] bg-[#071224]/50">
                  <td colSpan={5} className="px-5 py-3 text-xs text-[#94A3B8] font-semibold uppercase tracking-wider">Total Spend</td>
                  <td className="px-5 py-3 text-right font-bold text-[#FFB020]">
                    ${procurementList.reduce((s, a) => s + (a.cost || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

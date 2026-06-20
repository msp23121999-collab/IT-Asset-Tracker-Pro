import React from 'react';
import { Monitor, CheckCircle, Flame, AlertTriangle, DollarSign } from 'lucide-react';
import type { Asset } from '@/types/asset';

interface StatsCardsProps {
  assets: Asset[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ assets }) => {
  const stats = React.useMemo(() => {
    let total = assets.length;
    let active = 0;
    let inUse = 0;
    let maintenance = 0;
    let totalValue = 0;
    let expiringWarranty = 0;

    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    assets.forEach((asset) => {
      totalValue += asset.cost || 0;
      if (asset.status === 'active') active++;
      if (asset.status === 'in_use') inUse++;
      if (asset.status === 'maintenance') maintenance++;

      if (asset.warrantyEnd) {
        const expiryDate = new Date(asset.warrantyEnd);
        if (expiryDate >= today && expiryDate <= ninetyDaysFromNow) {
          expiringWarranty++;
        }
      }
    });

    return {
      total,
      active,
      inUse,
      maintenance,
      totalValue,
      expiringWarranty,
    };
  }, [assets]);

  const cards = [
    {
      title: 'Total Assets',
      value: stats.total.toLocaleString(),
      icon: <Monitor size={22} className="text-[#18B6FF]" />,
      bgColor: 'rgba(24, 182, 255, 0.08)',
      borderColor: 'border-[#18B6FF]/20',
      description: 'Hardware items in inventory',
    },
    {
      title: 'Active / Stock',
      value: stats.active.toLocaleString(),
      icon: <CheckCircle size={22} className="text-[#00D084]" />,
      bgColor: 'rgba(0, 208, 132, 0.08)',
      borderColor: 'border-[#00D084]/20',
      description: 'Ready for assignment',
    },
    {
      title: 'In Use',
      value: stats.inUse.toLocaleString(),
      icon: <Monitor size={22} className="text-[#18B6FF]" />,
      bgColor: 'rgba(24, 182, 255, 0.08)',
      borderColor: 'border-[#18B6FF]/20',
      description: 'Assigned to employees',
    },
    {
      title: 'In Repair',
      value: stats.maintenance.toLocaleString(),
      icon: <Flame size={22} className="text-[#FFB020]" />,
      bgColor: 'rgba(255, 176, 32, 0.08)',
      borderColor: 'border-[#FFB020]/20',
      description: 'Undergoing maintenance',
    },
    {
      title: 'Expiring Warranty',
      value: stats.expiringWarranty.toLocaleString(),
      icon: <AlertTriangle size={22} className="text-[#FF4D4D]" />,
      bgColor: 'rgba(255, 77, 77, 0.08)',
      borderColor: 'border-[#FF4D4D]/20',
      description: 'Expires in next 90 days',
    },
    {
      title: 'Total Value',
      value: `$${Math.round(stats.totalValue).toLocaleString()}`,
      icon: <DollarSign size={22} className="text-[#00D084]" />,
      bgColor: 'rgba(0, 208, 132, 0.08)',
      borderColor: 'border-[#00D084]/20',
      description: 'Initial procurement cost',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-[#0D1B32] border ${card.borderColor} rounded-xl p-4 shadow-lg flex flex-col justify-between hover:scale-[1.02] transition-all relative overflow-hidden group`}
        >
          {/* Top border ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#18B6FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#94A3B8] tracking-wide uppercase">{card.title}</span>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-borderLight/30 shrink-0"
              style={{ backgroundColor: card.bgColor }}
            >
              {card.icon}
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
            <div className="text-[10px] text-[#64748B] mt-1 truncate">{card.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

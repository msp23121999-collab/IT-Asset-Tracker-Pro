import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { Asset } from '@/types/asset';

interface LifecycleChartProps {
  assets: Asset[];
}

export const LifecycleChart: React.FC<LifecycleChartProps> = ({ assets }) => {
  const chartData = React.useMemo(() => {
    const lifecycles = {
      'New (< 1 yr)': 0,
      'Good (1-2 yrs)': 0,
      'Fair (2-3 yrs)': 0,
      'Old (3-4 yrs)': 0,
      'Retired (4+ yrs)': 0,
    };

    const currentYear = new Date().getFullYear();

    assets.forEach((asset) => {
      if (asset.purchaseDate) {
        const purchaseYear = new Date(asset.purchaseDate).getFullYear();
        const age = currentYear - purchaseYear;

        if (age < 1) lifecycles['New (< 1 yr)']++;
        else if (age <= 2) lifecycles['Good (1-2 yrs)']++;
        else if (age <= 3) lifecycles['Fair (2-3 yrs)']++;
        else if (age <= 4) lifecycles['Old (3-4 yrs)']++;
        else lifecycles['Retired (4+ yrs)']++;
      } else {
        // Fallback based on condition
        if (asset.condition === 'new') lifecycles['New (< 1 yr)']++;
        else if (asset.condition === 'good') lifecycles['Good (1-2 yrs)']++;
        else if (asset.condition === 'fair') lifecycles['Fair (2-3 yrs)']++;
        else lifecycles['Old (3-4 yrs)']++;
      }
    });

    return Object.entries(lifecycles).map(([name, count]) => ({
      name,
      count,
    }));
  }, [assets]);

  return (
    <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 shadow-lg h-80 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D084]/20 to-transparent"></div>
      <h3 className="text-sm font-semibold text-white mb-2 tracking-wide">Asset Age Profile</h3>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D084" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00D084" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#19304D" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A172B',
                borderColor: '#19304D',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00D084"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ASSET_CATEGORY_LABELS } from '@/types/asset';
import type { Asset } from '@/types/asset';

interface AssetDistributionChartProps {
  assets: Asset[];
}

const COLORS = [
  '#18B6FF', // Blue
  '#00D084', // Green
  '#FFB020', // Amber
  '#FF4D4D', // Red
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#64748B', // Slate
];

export const AssetDistributionChart: React.FC<AssetDistributionChartProps> = ({ assets }) => {
  const chartData = React.useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    assets.forEach((asset) => {
      const label = ASSET_CATEGORY_LABELS[asset.category] || asset.category;
      categoryCounts[label] = (categoryCounts[label] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories, group others or ignore for neat display
  }, [assets]);

  return (
    <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 shadow-lg h-80 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#18B6FF]/20 to-transparent"></div>
      <h3 className="text-sm font-semibold text-white mb-2 tracking-wide">Category Distribution</h3>
      
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0D1B32" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A172B',
                borderColor: '#19304D',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#E2E8F0' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

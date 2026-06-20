import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import type { Asset } from '@/types/asset';

interface DepartmentChartProps {
  assets: Asset[];
}

const COLORS = [
  '#18B6FF', // Blue
  '#00D084', // Green
  '#FFB020', // Amber
  '#FF4D4D', // Red
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ assets }) => {
  const chartData = React.useMemo(() => {
    const deptCounts: Record<string, number> = {};
    assets.forEach((asset) => {
      if (asset.department) {
        deptCounts[asset.department] = (deptCounts[asset.department] || 0) + 1;
      }
    });

    return Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Top 7 departments
  }, [assets]);

  return (
    <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 shadow-lg h-80 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#18B6FF]/20 to-transparent"></div>
      <h3 className="text-sm font-semibold text-white mb-2 tracking-wide">Department Allocation</h3>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
              cursor={{ fill: 'rgba(24, 182, 255, 0.04)' }}
              contentStyle={{
                backgroundColor: '#0A172B',
                borderColor: '#19304D',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

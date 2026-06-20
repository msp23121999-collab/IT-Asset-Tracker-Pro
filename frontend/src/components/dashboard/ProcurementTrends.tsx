import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Asset } from '@/types/asset';

interface ProcurementTrendsProps {
  assets: Asset[];
}

export const ProcurementTrends: React.FC<ProcurementTrendsProps> = ({ assets }) => {
  const chartData = React.useMemo(() => {
    const yearlyStats: Record<string, { count: number; cost: number }> = {};

    assets.forEach((asset) => {
      if (asset.purchaseDate) {
        const year = new Date(asset.purchaseDate).getFullYear().toString();
        // Ignore noise in dates if any
        if (year && year !== 'NaN') {
          if (!yearlyStats[year]) {
            yearlyStats[year] = { count: 0, cost: 0 };
          }
          yearlyStats[year].count++;
          yearlyStats[year].cost += asset.cost || 0;
        }
      }
    });

    return Object.entries(yearlyStats)
      .map(([year, data]) => ({
        year,
        assetsAcquired: data.count,
        spending: Math.round(data.cost / 1000), // In thousands
      }))
      .sort((a, b) => a.year.localeCompare(b.year))
      .slice(-6); // Last 6 purchase years
  }, [assets]);

  return (
    <div className="bg-[#0D1B32] border border-[#19304D]/80 rounded-xl p-5 shadow-lg h-80 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#18B6FF]/20 to-transparent"></div>
      <h3 className="text-sm font-semibold text-white mb-2 tracking-wide">Procurement & Spending Trends</h3>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#19304D" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            {/* Double Y-axis for assets acquired vs spending */}
            <YAxis 
              yAxisId="left"
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
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
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="assetsAcquired"
              name="Units Acquired"
              stroke="#18B6FF"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ strokeWidth: 2, r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="spending"
              name="Spend ($k)"
              stroke="#00D084"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

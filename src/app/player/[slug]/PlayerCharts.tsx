'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StockReturn {
  ticker: string;
  basePrice: number;
  currentPrice: number;
  return: number;
}

interface SectorData {
  count: number;
  totalReturn: number;
}

interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  size: string;
}

interface PlayerChartsProps {
  stockReturns: StockReturn[];
  sectorBreakdown: Record<string, SectorData>;
  stockInfo: Record<string, StockInfo>;
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#8b5cf6',
  Semiconductors: '#06b6d4',
  Healthcare: '#22c55e',
  Financials: '#eab308',
  'Consumer Disc.': '#f97316',
  'Consumer Staples': '#ec4899',
  Industrials: '#6366f1',
  Energy: '#ef4444',
  Utilities: '#14b8a6',
  Materials: '#84cc16',
  Communications: '#a855f7',
  Disruptors: '#f43f5e',
  'Clean Energy': '#10b981',
  'Real Estate': '#0ea5e9',
  Other: '#64748b',
};

export function PlayerCharts({ stockReturns, sectorBreakdown, stockInfo }: PlayerChartsProps) {
  // Prepare bar chart data
  const barData = [...stockReturns]
    .sort((a, b) => b.return - a.return)
    .map((stock) => ({
      ticker: stock.ticker,
      return: stock.return * 100,
      fill: stock.return >= 0 ? '#22c55e' : '#ef4444',
    }));

  // Prepare pie chart data
  const pieData = Object.entries(sectorBreakdown).map(([sector, data]) => ({
    name: sector,
    value: data.count,
    avgReturn: (data.totalReturn / data.count) * 100,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stock Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                stroke="#9ca3af"
              />
              <YAxis
                type="category"
                dataKey="ticker"
                width={50}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Return']}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                itemStyle={{ color: '#ffffff' }}
              />
              <Bar dataKey="return" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
                labelLine={{ stroke: '#6b7280' }}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SECTOR_COLORS[entry.name] || SECTOR_COLORS.Other}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} stock${Number(value) > 1 ? 's' : ''} (${props.payload.avgReturn.toFixed(2)}% avg)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                itemStyle={{ color: '#ffffff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

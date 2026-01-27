'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPercent, formatCurrency } from '@/lib/calculations';

interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  size: string;
}

interface StockWithOwner {
  ticker: string;
  owner: string;
  playerId: string;
  basePrice: number;
  currentPrice: number;
  return: number;
  info?: StockInfo;
}

interface StockHeatmapProps {
  stocks: StockWithOwner[];
  sectors: string[];
}

function getColorForReturn(returnPct: number): string {
  // Clamp return between -20% and +20% for color scaling
  const clampedReturn = Math.max(-0.2, Math.min(0.2, returnPct));

  if (returnPct >= 0) {
    // Green gradient for positive returns
    const intensity = Math.min(returnPct / 0.15, 1);
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`;
  } else {
    // Red gradient for negative returns
    const intensity = Math.min(Math.abs(returnPct) / 0.15, 1);
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`;
  }
}

export function StockHeatmap({ stocks, sectors }: StockHeatmapProps) {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [hoveredStock, setHoveredStock] = useState<StockWithOwner | null>(null);

  const filteredStocks = selectedSector === 'all'
    ? stocks
    : stocks.filter((s) => s.info?.sector === selectedSector);

  // Sort by return for better visualization
  const sortedStocks = [...filteredStocks].sort((a, b) => b.return - a.return);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector}>
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Worst</span>
          <div className="flex h-4">
            <div className="w-6 bg-red-500/80 rounded-l" />
            <div className="w-6 bg-red-500/40" />
            <div className="w-6 bg-gray-500/40" />
            <div className="w-6 bg-green-500/40" />
            <div className="w-6 bg-green-500/80 rounded-r" />
          </div>
          <span>Best</span>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {sortedStocks.map((stock, index) => (
          <motion.div
            key={stock.ticker}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className="relative"
            onMouseEnter={() => setHoveredStock(stock)}
            onMouseLeave={() => setHoveredStock(null)}
          >
            <Link href={`/player/${stock.playerId}`}>
              <div
                className="aspect-square rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer transition-transform hover:scale-110 hover:z-10 border border-white/10"
                style={{ backgroundColor: getColorForReturn(stock.return) }}
              >
                <span className="font-bold text-xs md:text-sm text-white drop-shadow-md">
                  {stock.ticker}
                </span>
                <span className="text-[9px] font-mono text-white/70 drop-shadow-md">
                  {formatCurrency(stock.basePrice)}
                </span>
                <span className="text-[10px] font-mono text-white/90 drop-shadow-md">
                  {formatCurrency(stock.currentPrice)}
                </span>
                <span className="text-[10px] text-white/80 drop-shadow-md">
                  {formatPercent(stock.return, 1)}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Hover Details Card */}
      {hoveredStock && (
        <Card className="fixed bottom-4 right-4 w-72 z-50 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>{hoveredStock.ticker}</span>
              <Badge
                className={
                  hoveredStock.return >= 0
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                }
              >
                {formatPercent(hoveredStock.return)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{hoveredStock.info?.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-xs">Owner</p>
                <p className="font-medium">{hoveredStock.owner}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sector</p>
                <p className="font-medium">{hoveredStock.info?.sector}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Base Price</p>
                <p className="font-mono">{formatCurrency(hoveredStock.basePrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Current Price</p>
                <p className="font-mono">{formatCurrency(hoveredStock.currentPrice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Stocks</p>
              <p className="text-2xl font-bold">{sortedStocks.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Positive</p>
              <p className="text-2xl font-bold text-green-500">
                {sortedStocks.filter((s) => s.return >= 0).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Negative</p>
              <p className="text-2xl font-bold text-red-500">
                {sortedStocks.filter((s) => s.return < 0).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Return</p>
              <p className={`text-2xl font-bold ${
                sortedStocks.reduce((sum, s) => sum + s.return, 0) / sortedStocks.length >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {formatPercent(sortedStocks.reduce((sum, s) => sum + s.return, 0) / sortedStocks.length)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

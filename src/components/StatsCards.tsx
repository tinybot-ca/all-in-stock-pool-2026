'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Flame } from 'lucide-react';
import { PlayerStanding } from '@/lib/types';
import { formatPercent } from '@/lib/calculations';

interface StatsCardsProps {
  standings: PlayerStanding[];
  lastUpdated?: Date | null;
}

// Format currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function StatsCards({ standings, lastUpdated }: StatsCardsProps) {
  // Find best performing stock today
  const allStocks = standings.flatMap((s) =>
    s.stockReturns.map((sr) => ({ ...sr, owner: s.player.name }))
  );
  const bestStock = allStocks.reduce((best, stock) =>
    stock.return > best.return ? stock : best
  );
  const worstStock = allStocks.reduce((worst, stock) =>
    stock.return < worst.return ? stock : worst
  );

  // Most volatile portfolio (highest spread between best and worst)
  const volatility = standings.map((s) => ({
    player: s.player.name,
    spread: s.bestStock.return - s.worstStock.return,
  }));
  const mostVolatile = volatility.reduce((max, v) => (v.spread > max.spread ? v : max));

  // Leader
  const leader = standings[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leader</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leader.player.name}</div>
          <p className={`text-xs ${leader.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercent(leader.totalReturn)} total return
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Stock</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bestStock.ticker}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatPrice(bestStock.basePrice)} → {formatPrice(bestStock.currentPrice)}
          </div>
          <p className="text-xs text-green-500 mt-1">
            {formatPercent(bestStock.return)} ({bestStock.owner})
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatTime(lastUpdated)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Worst Stock</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{worstStock.ticker}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatPrice(worstStock.basePrice)} → {formatPrice(worstStock.currentPrice)}
          </div>
          <p className="text-xs text-red-500 mt-1">
            {formatPercent(worstStock.return)} ({worstStock.owner})
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatTime(lastUpdated)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Volatile</CardTitle>
          <Activity className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostVolatile.player}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercent(mostVolatile.spread)} spread
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

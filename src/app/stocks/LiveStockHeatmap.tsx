'use client';

import { useLivePrices } from '@/hooks/useLivePrices';
import { LiveIndicator } from '@/components/LiveIndicator';
import { StockHeatmap } from './StockHeatmap';
import { calculatePlayerStandings } from '@/lib/calculations';
import { Player, CurrentPrices } from '@/lib/types';

interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  size: string;
}

interface LiveStockHeatmapProps {
  players: Player[];
  staticPrices: CurrentPrices;
  stockPool: StockInfo[];
}

export function LiveStockHeatmap({ players, staticPrices, stockPool }: LiveStockHeatmapProps) {
  const {
    livePrices,
    isLoading,
    lastUpdated,
    marketStatus,
    isLive,
    refresh,
  } = useLivePrices(staticPrices.prices);

  const pricesForCalculation: CurrentPrices = {
    lastUpdated: lastUpdated?.toISOString() || staticPrices.lastUpdated,
    prices: livePrices,
  };

  const standings = calculatePlayerStandings(players, pricesForCalculation);

  // Build a map of all stocks with their owners and returns
  const stocksWithOwners = standings.flatMap((standing) =>
    standing.stockReturns.map((stock) => ({
      ticker: stock.ticker,
      owner: standing.player.name,
      playerId: standing.player.id,
      basePrice: stock.basePrice,
      currentPrice: stock.currentPrice,
      return: stock.return,
      info: stockPool.find((s) => s.ticker === stock.ticker),
    }))
  );

  // Get unique sectors
  const sectors = [...new Set(stocksWithOwners.map((s) => s.info?.sector).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LiveIndicator
          isLive={isLive}
          isLoading={isLoading}
          marketStatus={marketStatus}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
      </div>
      <StockHeatmap stocks={stocksWithOwners} sectors={sectors} />
    </div>
  );
}

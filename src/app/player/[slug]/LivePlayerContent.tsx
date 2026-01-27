'use client';

import { TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LiveIndicator } from '@/components/LiveIndicator';
import { useLivePrices } from '@/hooks/useLivePrices';
import { calculatePlayerStandings, formatPercent, formatCurrency } from '@/lib/calculations';
import { Player, CurrentPrices } from '@/lib/types';
import { PlayerCharts } from './PlayerCharts';

interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  size: string;
}

interface LivePlayerContentProps {
  player: Player;
  allPlayers: Player[];
  staticPrices: CurrentPrices;
  stockInfo: Record<string, StockInfo>;
}

export function LivePlayerContent({
  player,
  allPlayers,
  staticPrices,
  stockInfo,
}: LivePlayerContentProps) {
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

  const standings = calculatePlayerStandings(allPlayers, pricesForCalculation);
  const playerStanding = standings.find((s) => s.player.id === player.id)!;

  // Calculate sector breakdown
  const sectorBreakdown = playerStanding.stockReturns.reduce(
    (acc, stock) => {
      const info = stockInfo[stock.ticker];
      const sector = info?.sector || 'Other';
      if (!acc[sector]) {
        acc[sector] = { count: 0, totalReturn: 0 };
      }
      acc[sector].count++;
      acc[sector].totalReturn += stock.return;
      return acc;
    },
    {} as Record<string, { count: number; totalReturn: number }>
  );

  const sortedStocks = [...playerStanding.stockReturns].sort((a, b) => b.return - a.return);

  return (
    <>
      {/* Live Indicator */}
      <div className="flex justify-end">
        <LiveIndicator
          isLive={isLive}
          isLoading={isLoading}
          marketStatus={marketStatus}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
      </div>

      {/* Player Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {playerStanding.rank === 1 && <Trophy className="h-10 w-10 text-yellow-500" />}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground">
              Rank #{playerStanding.rank} • Draft Position #{player.draftPosition}
            </p>
          </div>
        </div>
        <Badge
          className={`text-2xl px-4 py-2 ${
            playerStanding.totalReturn >= 0
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-900/40 text-red-300'
          }`}
        >
          {formatPercent(playerStanding.totalReturn)}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-xl font-bold">{playerStanding.bestStock.ticker}</span>
            </div>
            <p className="text-sm text-green-500">{formatPercent(playerStanding.bestStock.return)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Worst Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-xl font-bold">{playerStanding.worstStock.ticker}</span>
            </div>
            <p className="text-sm text-red-500">{formatPercent(playerStanding.worstStock.return)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Positive Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {playerStanding.stockReturns.filter((s) => s.return >= 0).length}/10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(
                playerStanding.stockReturns.reduce((sum, s) => sum + s.currentPrice, 0) / 10
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <PlayerCharts
        stockReturns={playerStanding.stockReturns}
        sectorBreakdown={sectorBreakdown}
        stockInfo={stockInfo}
      />

      {/* Full Portfolio Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStocks.map((stock) => {
                const info = stockInfo[stock.ticker];
                return (
                  <TableRow key={stock.ticker}>
                    <TableCell className="font-medium">
                      <div>
                        <span className="font-bold">{stock.ticker}</span>
                        <p className="text-xs text-muted-foreground">{info?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{info?.sector || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(stock.basePrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(stock.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          stock.return >= 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-900/40 text-red-300'
                        }
                      >
                        {formatPercent(stock.return)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

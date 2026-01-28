'use client';

import { useLivePrices } from '@/hooks/useLivePrices';
import { Leaderboard } from '@/components/Leaderboard';
import { LiveIndicator } from '@/components/LiveIndicator';
import { StatsCards } from '@/components/StatsCards';
import { Countdown } from '@/components/Countdown';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function Home() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;

  // Single source of truth for live prices
  const {
    livePrices,
    isLoading,
    lastUpdated,
    marketStatus,
    isLive,
    refresh,
  } = useLivePrices(prices.prices);

  const pricesForCalculation: CurrentPrices = {
    lastUpdated: lastUpdated?.toISOString() || prices.lastUpdated,
    prices: livePrices,
  };

  const standings = calculatePlayerStandings(data.players, pricesForCalculation);

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          All-In Stock Pool 2026
        </h1>
        <p className="text-muted-foreground text-lg">
          10 Players. 100 Stocks. 1 Grand Prize.
        </p>
      </div>

      {/* Countdown Timer */}
      <Countdown
        endDate={data.contestInfo.endDate}
        prizeAmount={data.contestInfo.prizeAmount}
      />

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

      {/* Quick Stats - shares same standings data */}
      <StatsCards standings={standings} lastUpdated={lastUpdated} />

      {/* Main Leaderboard - shares same standings data */}
      <Leaderboard standings={standings} />
    </main>
  );
}

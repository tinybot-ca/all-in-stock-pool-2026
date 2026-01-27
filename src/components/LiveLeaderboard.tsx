'use client';

import { useLivePrices } from '@/hooks/useLivePrices';
import { Leaderboard } from './Leaderboard';
import { LiveIndicator } from './LiveIndicator';
import { calculatePlayerStandings } from '@/lib/calculations';
import { Player, CurrentPrices } from '@/lib/types';

interface LiveLeaderboardProps {
  players: Player[];
  staticPrices: CurrentPrices;
}

export function LiveLeaderboard({ players, staticPrices }: LiveLeaderboardProps) {
  const {
    livePrices,
    isLoading,
    lastUpdated,
    marketStatus,
    isLive,
    refresh,
  } = useLivePrices(staticPrices.prices);

  // Calculate standings with live or static prices
  const pricesForCalculation: CurrentPrices = {
    lastUpdated: lastUpdated?.toISOString() || staticPrices.lastUpdated,
    prices: livePrices,
  };

  const standings = calculatePlayerStandings(players, pricesForCalculation);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LiveIndicator
          isLive={isLive}
          isLoading={isLoading}
          marketStatus={marketStatus}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
      </div>
      <Leaderboard standings={standings} />
    </div>
  );
}

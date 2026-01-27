'use client';

import { RaceChart } from './RaceChart';
import { LiveIndicator } from '@/components/LiveIndicator';
import { useLivePrices } from '@/hooks/useLivePrices';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function RacePage() {
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

  // For now, we'll simulate historical data with the current standings
  // In production, this would load from history files
  const raceData = standings.map((standing) => ({
    id: standing.player.id,
    name: standing.player.name,
    currentReturn: standing.totalReturn,
  }));

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Race to the Top</h1>
        <p className="text-muted-foreground">
          Watch the competition unfold over time
        </p>
      </div>

      <div className="flex justify-end">
        <LiveIndicator
          isLive={isLive}
          isLoading={isLoading}
          marketStatus={marketStatus}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
      </div>

      <RaceChart players={raceData} />
    </main>
  );
}

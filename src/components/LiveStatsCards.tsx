'use client';

import { useLivePrices } from '@/hooks/useLivePrices';
import { StatsCards } from './StatsCards';
import { calculatePlayerStandings } from '@/lib/calculations';
import { Player, CurrentPrices } from '@/lib/types';

interface LiveStatsCardsProps {
  players: Player[];
  staticPrices: CurrentPrices;
}

export function LiveStatsCards({ players, staticPrices }: LiveStatsCardsProps) {
  const { livePrices, lastUpdated } = useLivePrices(staticPrices.prices);

  const pricesForCalculation: CurrentPrices = {
    lastUpdated: lastUpdated?.toISOString() || staticPrices.lastUpdated,
    prices: livePrices,
  };

  const standings = calculatePlayerStandings(players, pricesForCalculation);

  return <StatsCards standings={standings} />;
}

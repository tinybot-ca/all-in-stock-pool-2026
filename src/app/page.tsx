import { Leaderboard } from '@/components/Leaderboard';
import { Countdown } from '@/components/Countdown';
import { StatsCards } from '@/components/StatsCards';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function Home() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;
  const standings = calculatePlayerStandings(data.players, prices);

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

      {/* Quick Stats */}
      <StatsCards standings={standings} />

      {/* Main Leaderboard */}
      <Leaderboard standings={standings} />

      {/* Last Updated */}
      <p className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(prices.lastUpdated).toLocaleString()}
      </p>
    </main>
  );
}

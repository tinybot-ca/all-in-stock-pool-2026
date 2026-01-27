import { RaceChart } from './RaceChart';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function RacePage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;
  const standings = calculatePlayerStandings(data.players, prices);

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

      <RaceChart players={raceData} />
    </main>
  );
}

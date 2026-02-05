import { RaceChart } from './RaceChart';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import { PlayersData, CurrentPrices } from '@/lib/types';
import { calculatePlayerReturn } from '@/lib/calculations';
import fs from 'fs';
import path from 'path';

// Load all historical price files
function loadHistoricalData(startDate: string): { date: string; prices: Record<string, number> }[] {
  const historyDir = path.join(process.cwd(), 'src/data/history');
  const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json')).sort();

  const history: { date: string; prices: Record<string, number> }[] = [];

  for (const file of files) {
    const date = file.replace('.json', '');
    const filePath = path.join(historyDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CurrentPrices;
    history.push({ date, prices: data.prices });
  }

  return history;
}

export default function RacePage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;

  // Load historical data
  const historicalData = loadHistoricalData(data.contestInfo.startDate);

  // Calculate daily returns for each player
  const raceData = data.players.map((player) => {
    // Day 0: all returns are 0 (base prices)
    const dailyReturns = [0];

    // Calculate return for each historical day
    for (const dayData of historicalData) {
      const dayReturn = calculatePlayerReturn(player, dayData.prices);
      dailyReturns.push(dayReturn);
    }

    // Add current prices as the final data point
    const currentReturn = calculatePlayerReturn(player, prices.prices);
    if (historicalData.length === 0 ||
        historicalData[historicalData.length - 1].date !== new Date().toISOString().split('T')[0]) {
      dailyReturns.push(currentReturn);
    }

    return {
      id: player.id,
      name: player.name,
      dailyReturns,
    };
  });

  // Build dates array for display
  const dates = ['Day 0 (Base)', ...historicalData.map(h => h.date), 'Today'];

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Race to the Top</h1>
        <p className="text-muted-foreground">
          Watch the competition unfold over time
        </p>
      </div>

      <RaceChart
        players={raceData}
        dates={dates}
        contestStartDate={data.contestInfo.startDate}
      />
    </main>
  );
}

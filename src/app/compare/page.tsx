import { CompareView } from './CompareView';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import stockPool from '@/data/stockPool.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function ComparePage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;
  const standings = calculatePlayerStandings(data.players, prices);

  // Get stock info
  const stockInfo = stockPool.stocks.reduce(
    (acc, stock) => {
      acc[stock.ticker] = stock;
      return acc;
    },
    {} as Record<string, (typeof stockPool.stocks)[0]>
  );

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Head-to-Head Comparison</h1>
        <p className="text-muted-foreground">
          Select two players to compare their portfolios side by side
        </p>
      </div>

      <CompareView standings={standings} stockInfo={stockInfo} />
    </main>
  );
}

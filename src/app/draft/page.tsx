import { DraftRecap } from './DraftRecap';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import draftResults from '@/data/draftResults.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function DraftPage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;
  const standings = calculatePlayerStandings(data.players, prices);

  // Build stock returns map
  const stockReturns = standings.flatMap((s) =>
    s.stockReturns.map((sr) => ({
      ticker: sr.ticker,
      return: sr.return,
    }))
  ).reduce(
    (acc, sr) => {
      acc[sr.ticker] = sr.return;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Draft Recap</h1>
        <p className="text-muted-foreground">
          Relive the snake draft and see how each pick has performed
        </p>
      </div>

      <DraftRecap
        picks={draftResults.picks}
        draftOrder={draftResults.draftOrder}
        stockReturns={stockReturns}
      />
    </main>
  );
}

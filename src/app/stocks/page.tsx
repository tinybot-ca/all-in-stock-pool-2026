import { StockHeatmap } from './StockHeatmap';
import { calculatePlayerStandings } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import stockPool from '@/data/stockPool.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function StocksPage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;
  const standings = calculatePlayerStandings(data.players, prices);

  // Build a map of all stocks with their owners and returns
  const stocksWithOwners = standings.flatMap((standing) =>
    standing.stockReturns.map((stock) => ({
      ticker: stock.ticker,
      owner: standing.player.name,
      playerId: standing.player.id,
      basePrice: stock.basePrice,
      currentPrice: stock.currentPrice,
      return: stock.return,
      info: stockPool.stocks.find((s) => s.ticker === stock.ticker),
    }))
  );

  // Get unique sectors
  const sectors = [...new Set(stocksWithOwners.map((s) => s.info?.sector).filter(Boolean))] as string[];

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stock Heatmap</h1>
        <p className="text-muted-foreground">
          All 100 stocks colored by performance. Hover for details.
        </p>
      </div>

      <StockHeatmap stocks={stocksWithOwners} sectors={sectors} />
    </main>
  );
}

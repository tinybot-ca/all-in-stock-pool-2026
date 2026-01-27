import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import stockPool from '@/data/stockPool.json';
import { PlayersData, CurrentPrices } from '@/lib/types';
import { LiveStockHeatmap } from './LiveStockHeatmap';

export default function StocksPage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stock Heatmap</h1>
        <p className="text-muted-foreground">
          All 100 stocks colored by performance. Hover for details.
        </p>
      </div>

      <LiveStockHeatmap
        players={data.players}
        staticPrices={prices}
        stockPool={stockPool.stocks}
      />
    </main>
  );
}

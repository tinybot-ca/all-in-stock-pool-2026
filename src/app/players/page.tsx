import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculatePlayerStandings, formatPercent } from '@/lib/calculations';
import playersData from '@/data/players.json';
import currentPrices from '@/data/currentPrices.json';
import { PlayersData, CurrentPrices } from '@/lib/types';

export default function PlayersPage() {
  const data = playersData as PlayersData;
  const prices = currentPrices as CurrentPrices;
  const standings = calculatePlayerStandings(data.players, prices);

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">All Players</h1>
        <p className="text-muted-foreground">Click on a player to view their full portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {standings.map((standing) => (
          <Link key={standing.player.id} href={`/player/${standing.player.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{standing.rank}</span>
                    {standing.player.name}
                  </CardTitle>
                  <Badge
                    className={
                      standing.totalReturn >= 0
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }
                  >
                    {formatPercent(standing.totalReturn)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {standing.stockReturns.slice(0, 5).map((stock) => (
                      <Badge key={stock.ticker} variant="outline" className="text-xs">
                        {stock.ticker}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +5 more
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Best: {standing.bestStock.ticker}</span>
                    <span>Worst: {standing.worstStock.ticker}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

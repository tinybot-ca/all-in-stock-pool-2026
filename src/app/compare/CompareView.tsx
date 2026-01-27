'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Swords, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { PlayerStanding } from '@/lib/types';
import { formatPercent, formatCurrency } from '@/lib/calculations';

interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  size: string;
}

interface CompareViewProps {
  standings: PlayerStanding[];
  stockInfo: Record<string, StockInfo>;
}

export function CompareView({ standings, stockInfo }: CompareViewProps) {
  const [player1Id, setPlayer1Id] = useState<string>(standings[0]?.player.id || '');
  const [player2Id, setPlayer2Id] = useState<string>(standings[1]?.player.id || '');

  const player1 = standings.find((s) => s.player.id === player1Id);
  const player2 = standings.find((s) => s.player.id === player2Id);

  if (!player1 || !player2) {
    return <div>Select two players to compare</div>;
  }

  // Calculate sector comparison
  const getSectorBreakdown = (standing: PlayerStanding) => {
    const sectors: Record<string, number> = {};
    standing.stockReturns.forEach((stock) => {
      const sector = stockInfo[stock.ticker]?.sector || 'Other';
      sectors[sector] = (sectors[sector] || 0) + 1;
    });
    return sectors;
  };

  const p1Sectors = getSectorBreakdown(player1);
  const p2Sectors = getSectorBreakdown(player2);
  const allSectors = [...new Set([...Object.keys(p1Sectors), ...Object.keys(p2Sectors)])];

  // Determine winner of each comparison
  const returnWinner = player1.totalReturn > player2.totalReturn ? 'p1' : 'p2';
  const bestStockWinner = player1.bestStock.return > player2.bestStock.return ? 'p1' : 'p2';
  const positiveCountP1 = player1.stockReturns.filter((s) => s.return >= 0).length;
  const positiveCountP2 = player2.stockReturns.filter((s) => s.return >= 0).length;
  const positiveWinner = positiveCountP1 > positiveCountP2 ? 'p1' : positiveCountP1 < positiveCountP2 ? 'p2' : 'tie';

  return (
    <div className="space-y-6">
      {/* Player Selectors */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <Select value={player1Id} onValueChange={setPlayer1Id}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Player 1" />
          </SelectTrigger>
          <SelectContent>
            {standings.map((standing) => (
              <SelectItem key={standing.player.id} value={standing.player.id}>
                #{standing.rank} {standing.player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Swords className="h-8 w-8 text-muted-foreground" />

        <Select value={player2Id} onValueChange={setPlayer2Id}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Player 2" />
          </SelectTrigger>
          <SelectContent>
            {standings.map((standing) => (
              <SelectItem key={standing.player.id} value={standing.player.id}>
                #{standing.rank} {standing.player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 Card */}
        <Card className={returnWinner === 'p1' ? 'border-green-500/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {returnWinner === 'p1' && <Trophy className="h-5 w-5 text-yellow-500" />}
                {player1.player.name}
              </span>
              <Badge>Rank #{player1.rank}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className={`text-4xl font-bold ${player1.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(player1.totalReturn)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Best Stock</p>
                <p className="font-bold">{player1.bestStock.ticker}</p>
                <p className="text-sm text-green-500">{formatPercent(player1.bestStock.return)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Worst Stock</p>
                <p className="font-bold">{player1.worstStock.ticker}</p>
                <p className="text-sm text-red-500">{formatPercent(player1.worstStock.return)}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Positive Stocks</p>
              <p className="text-2xl font-bold">{positiveCountP1}/10</p>
            </div>
          </CardContent>
        </Card>

        {/* Player 2 Card */}
        <Card className={returnWinner === 'p2' ? 'border-green-500/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {returnWinner === 'p2' && <Trophy className="h-5 w-5 text-yellow-500" />}
                {player2.player.name}
              </span>
              <Badge>Rank #{player2.rank}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className={`text-4xl font-bold ${player2.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(player2.totalReturn)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Best Stock</p>
                <p className="font-bold">{player2.bestStock.ticker}</p>
                <p className="text-sm text-green-500">{formatPercent(player2.bestStock.return)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Worst Stock</p>
                <p className="font-bold">{player2.worstStock.ticker}</p>
                <p className="text-sm text-red-500">{formatPercent(player2.worstStock.return)}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Positive Stocks</p>
              <p className="text-2xl font-bold">{positiveCountP2}/10</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Allocation Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sector</TableHead>
                <TableHead className="text-center">{player1.player.name}</TableHead>
                <TableHead className="text-center">{player2.player.name}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSectors.map((sector) => (
                <TableRow key={sector}>
                  <TableCell>{sector}</TableCell>
                  <TableCell className="text-center">
                    {p1Sectors[sector] || 0} stock{(p1Sectors[sector] || 0) !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="text-center">
                    {p2Sectors[sector] || 0} stock{(p2Sectors[sector] || 0) !== 1 ? 's' : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Side by Side Stocks */}
      <Card>
        <CardHeader>
          <CardTitle>Stock-by-Stock Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">{player1.player.name}</h3>
              <div className="space-y-2">
                {[...player1.stockReturns]
                  .sort((a, b) => b.return - a.return)
                  .map((stock) => (
                    <div key={stock.ticker} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-mono">{stock.ticker}</span>
                      <Badge
                        className={
                          stock.return >= 0
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }
                      >
                        {formatPercent(stock.return)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{player2.player.name}</h3>
              <div className="space-y-2">
                {[...player2.stockReturns]
                  .sort((a, b) => b.return - a.return)
                  .map((stock) => (
                    <div key={stock.ticker} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-mono">{stock.ticker}</span>
                      <Badge
                        className={
                          stock.return >= 0
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }
                      >
                        {formatPercent(stock.return)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

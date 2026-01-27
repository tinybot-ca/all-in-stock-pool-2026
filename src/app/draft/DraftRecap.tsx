'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPercent } from '@/lib/calculations';

interface Pick {
  round: number;
  pick: number;
  player: string;
  stock: string;
  rankUsed: number;
}

interface DraftRecapProps {
  picks: Pick[];
  draftOrder: string[];
  stockReturns: Record<string, number>;
}

const PLAYER_COLORS: Record<string, string> = {
  LC: '#8b5cf6',
  Aditya: '#06b6d4',
  'Michael W': '#22c55e',
  'James L': '#eab308',
  Tulinh: '#f97316',
  Avi: '#ec4899',
  Matt: '#6366f1',
  'Andrea A': '#ef4444',
  Derek: '#14b8a6',
  Young: '#84cc16',
};

export function DraftRecap({ picks, draftOrder, stockReturns }: DraftRecapProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  // Get rounds
  const rounds = [...new Set(picks.map((p) => p.round))];

  // Best and worst picks
  const sortedPicks = [...picks].sort(
    (a, b) => (stockReturns[b.stock] || 0) - (stockReturns[a.stock] || 0)
  );
  const bestPicks = sortedPicks.slice(0, 5);
  const worstPicks = sortedPicks.slice(-5).reverse();

  // Most contested picks (highest rank used relative to draft position)
  const contestedPicks = [...picks]
    .map((p) => ({
      ...p,
      contestLevel: p.rankUsed - Math.ceil(p.pick / draftOrder.length),
    }))
    .sort((a, b) => b.contestLevel - a.contestLevel)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Draft Timeline</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="table">Full Results</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          {/* Round Selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={selectedRound === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedRound(null)}
            >
              All Rounds
            </Badge>
            {rounds.map((round) => (
              <Badge
                key={round}
                variant={selectedRound === round ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedRound(round)}
              >
                Round {round}
              </Badge>
            ))}
          </div>

          {/* Draft Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Snake Draft Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-11 gap-1 mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Round</div>
                    {draftOrder.map((player) => (
                      <div
                        key={player}
                        className="text-xs font-medium text-center truncate"
                        style={{ color: PLAYER_COLORS[player] }}
                      >
                        {player}
                      </div>
                    ))}
                  </div>

                  {/* Round Rows */}
                  {rounds.map((round) => {
                    const roundPicks = picks.filter((p) => p.round === round);
                    const isSnakeReverse = round % 2 === 0;
                    const orderedPicks = isSnakeReverse
                      ? [...roundPicks].reverse()
                      : roundPicks;

                    const isHighlighted = selectedRound === null || selectedRound === round;

                    return (
                      <motion.div
                        key={round}
                        className={`grid grid-cols-11 gap-1 mb-1 ${
                          isHighlighted ? '' : 'opacity-30'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isHighlighted ? 1 : 0.3, y: 0 }}
                        transition={{ delay: round * 0.05 }}
                      >
                        <div className="flex items-center text-sm text-muted-foreground">
                          R{round}
                        </div>
                        {draftOrder.map((player, idx) => {
                          const pick = roundPicks.find((p) => p.player === player);
                          const stockReturn = pick ? stockReturns[pick.stock] || 0 : 0;

                          return (
                            <div
                              key={`${round}-${player}`}
                              className={`p-2 rounded text-center text-xs ${
                                pick ? 'border' : 'bg-muted/20'
                              }`}
                              style={{
                                borderColor: pick ? PLAYER_COLORS[player] : undefined,
                                backgroundColor: pick
                                  ? stockReturn >= 0
                                    ? 'rgba(34, 197, 94, 0.2)'
                                    : 'rgba(239, 68, 68, 0.2)'
                                  : undefined,
                              }}
                            >
                              {pick && (
                                <>
                                  <div className="font-bold">{pick.stock}</div>
                                  <div
                                    className={`text-[10px] ${
                                      stockReturn >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}
                                  >
                                    {formatPercent(stockReturn, 1)}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Best Picks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-500">Best Picks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bestPicks.map((pick, idx) => (
                  <div
                    key={pick.pick}
                    className="flex items-center justify-between p-2 bg-green-500/10 rounded"
                  >
                    <div>
                      <span className="text-muted-foreground text-xs">#{idx + 1}</span>
                      <span className="font-bold ml-2">{pick.stock}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        (Pick #{pick.pick})
                      </span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">
                      {formatPercent(stockReturns[pick.stock] || 0)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Worst Picks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Worst Picks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {worstPicks.map((pick, idx) => (
                  <div
                    key={pick.pick}
                    className="flex items-center justify-between p-2 bg-red-500/10 rounded"
                  >
                    <div>
                      <span className="text-muted-foreground text-xs">#{idx + 1}</span>
                      <span className="font-bold ml-2">{pick.stock}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        (Pick #{pick.pick})
                      </span>
                    </div>
                    <Badge className="bg-red-500/20 text-red-500">
                      {formatPercent(stockReturns[pick.stock] || 0)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Most Contested */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-500">Deep Reaches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contestedPicks.map((pick, idx) => (
                  <div
                    key={pick.pick}
                    className="flex items-center justify-between p-2 bg-purple-500/10 rounded"
                  >
                    <div>
                      <span className="font-bold">{pick.stock}</span>
                      <span className="text-muted-foreground text-xs ml-2">by {pick.player}</span>
                    </div>
                    <Badge variant="outline" className="text-purple-400">
                      Rank #{pick.rankUsed}
                    </Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  Stocks picked much lower than their list ranking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Draft Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Draft Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Picks</p>
                  <p className="text-2xl font-bold">{picks.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Positive Return</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatPercent(
                      picks
                        .filter((p) => (stockReturns[p.stock] || 0) >= 0)
                        .reduce((sum, p) => sum + (stockReturns[p.stock] || 0), 0) /
                        picks.filter((p) => (stockReturns[p.stock] || 0) >= 0).length || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Negative Return</p>
                  <p className="text-2xl font-bold text-red-500">
                    {formatPercent(
                      picks
                        .filter((p) => (stockReturns[p.stock] || 0) < 0)
                        .reduce((sum, p) => sum + (stockReturns[p.stock] || 0), 0) /
                        picks.filter((p) => (stockReturns[p.stock] || 0) < 0).length || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rank Used</p>
                  <p className="text-2xl font-bold">
                    {(picks.reduce((sum, p) => sum + p.rankUsed, 0) / picks.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pick</TableHead>
                    <TableHead>Round</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rank Used</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {picks.map((pick) => {
                    const stockReturn = stockReturns[pick.stock] || 0;
                    return (
                      <TableRow key={pick.pick}>
                        <TableCell className="font-mono">#{pick.pick}</TableCell>
                        <TableCell>{pick.round}</TableCell>
                        <TableCell>
                          <span style={{ color: PLAYER_COLORS[pick.player] }}>{pick.player}</span>
                        </TableCell>
                        <TableCell className="font-bold">{pick.stock}</TableCell>
                        <TableCell className="text-muted-foreground">#{pick.rankUsed}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={
                              stockReturn >= 0
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
                            }
                          >
                            {formatPercent(stockReturn)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

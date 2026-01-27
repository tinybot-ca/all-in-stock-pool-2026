'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerStanding } from '@/lib/types';
import { formatPercent } from '@/lib/calculations';

interface LeaderboardProps {
  standings: PlayerStanding[];
  compact?: boolean;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <span className="text-gray-400 font-bold">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold">🥉</span>;
  return <span className="text-gray-500 font-mono">{rank}</span>;
}

function getRankChange(current: number, previous?: number) {
  if (previous === undefined) return null;
  const diff = previous - current;
  if (diff > 0) {
    return (
      <span className="flex items-center gap-0.5 text-green-500 text-xs">
        <TrendingUp className="h-3 w-3" />
        {diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-xs">
        <TrendingDown className="h-3 w-3" />
        {Math.abs(diff)}
      </span>
    );
  }
  return <Minus className="h-3 w-3 text-gray-400" />;
}

export function Leaderboard({ standings, compact = false }: LeaderboardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {standings.map((standing, index) => (
            <motion.div
              key={standing.player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/player/${standing.player.id}`}>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.02] cursor-pointer ${
                    standing.rank === 1
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30'
                      : standing.rank === 2
                        ? 'bg-gradient-to-r from-gray-400/20 to-gray-300/10 border border-gray-400/30'
                        : standing.rank === 3
                          ? 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border border-amber-600/30'
                          : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">{getRankIcon(standing.rank)}</div>
                    <div className="flex items-center gap-2">
                      {getRankChange(standing.rank, standing.previousRank)}
                    </div>
                    <div>
                      <p className="font-semibold">{standing.player.name}</p>
                      {!compact && (
                        <p className="text-xs text-muted-foreground">
                          Best: {standing.bestStock.ticker} ({formatPercent(standing.bestStock.return)})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={standing.totalReturn >= 0 ? 'default' : 'destructive'}
                      className={`text-sm font-mono ${
                        standing.totalReturn >= 0
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-600/60 text-red-100 hover:bg-red-600/70'
                      }`}
                    >
                      {formatPercent(standing.totalReturn)}
                    </Badge>
                    {!compact && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Worst: {standing.worstStock.ticker} ({formatPercent(standing.worstStock.return)})
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

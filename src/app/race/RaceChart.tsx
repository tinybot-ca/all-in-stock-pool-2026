'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/lib/calculations';

interface PlayerData {
  id: string;
  name: string;
  currentReturn: number;
}

interface RaceChartProps {
  players: PlayerData[];
  contestStartDate?: string;
}

const COLORS = [
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#22c55e', // Green
  '#eab308', // Yellow
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#84cc16', // Lime
];

export function RaceChart({ players, contestStartDate = '2026-01-27' }: RaceChartProps) {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on load
  const [frame, setFrame] = useState(0);

  // Calculate days elapsed since contest start
  const startDate = new Date(contestStartDate);
  const today = new Date();
  const daysElapsed = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Total frames = days elapsed (minimum 1)
  const totalFrames = Math.max(1, daysElapsed);

  // Sort players by their animated return value
  const sortedPlayers = [...players]
    .map((player, index) => ({
      ...player,
      color: COLORS[index % COLORS.length],
      animatedReturn: totalFrames > 1
        ? player.currentReturn * (frame / totalFrames)
        : player.currentReturn, // If only 1 day, show full return
    }))
    .sort((a, b) => b.animatedReturn - a.animatedReturn);

  // Find max return for scaling
  const maxReturn = Math.max(...players.map((p) => Math.abs(p.currentReturn)));
  const scale = maxReturn > 0 ? 100 / maxReturn : 1;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && frame < totalFrames) {
      // Speed depends on total frames - faster for fewer days
      const speed = totalFrames <= 5 ? 500 : totalFrames <= 30 ? 100 : 50;
      interval = setInterval(() => {
        setFrame((f) => Math.min(f + 1, totalFrames));
      }, speed);
    }
    if (frame >= totalFrames) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frame, totalFrames]);

  const handleReset = () => {
    setFrame(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (frame >= totalFrames) {
      setFrame(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance Race</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              style={{ width: `${(frame / totalFrames) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {frame === 0
              ? 'Day 0 (Base prices - Jan 26 close)'
              : `Day ${frame}${frame === daysElapsed ? ' (Today)' : ''}`
            }
          </p>
        </div>

        {/* Race bars */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedPlayers.map((player, index) => {
              const barWidth = Math.abs(player.animatedReturn * scale);
              const isPositive = player.animatedReturn >= 0;

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-6 text-center text-sm text-muted-foreground font-mono">
                    {index + 1}
                  </div>
                  <div className="w-24 text-sm font-medium truncate">{player.name}</div>
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 h-8 bg-muted/30 rounded-md overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-md"
                        style={{
                          backgroundColor: isPositive ? '#22c55e' : '#ef4444',
                          width: `${Math.max(barWidth, 2)}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(barWidth, 2)}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                      <div
                        className="absolute inset-y-0 left-2 flex items-center text-white text-sm font-bold drop-shadow-md"
                        style={{ opacity: barWidth > 10 ? 1 : 0 }}
                      >
                        {player.name}
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-mono">
                      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                        {formatPercent(player.animatedReturn)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          <p>
            {daysElapsed <= 2
              ? "The contest just started! Day 0 shows base prices (Jan 26 close), Day 1 is the first trading day (Jan 27)."
              : "This animation shows how standings have changed since the start of the contest. Day 0 = base prices, Day 1 = Jan 27. Click play to watch the race unfold!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

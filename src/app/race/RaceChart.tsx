'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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

// Number of interpolation steps between each day for smoother animation
const STEPS_PER_DAY = 10;
// Height of each row in pixels for position animation
const ROW_HEIGHT = 44; // 32px bar + 12px gap (space-y-3)

export function RaceChart({ players, contestStartDate = '2026-01-27' }: RaceChartProps) {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on load
  const [frame, setFrame] = useState(0);

  // Calculate days elapsed since contest start
  // Jan 27 = Day 1, Jan 28 = Day 2, etc.
  const startDate = new Date(contestStartDate + 'T00:00:00');
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysDiff = Math.floor((todayMidnight.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(1, daysDiff + 1); // +1 because contest start date is Day 1

  // Total frames = days elapsed * steps per day (for smoother animation)
  const totalFrames = Math.max(1, daysElapsed * STEPS_PER_DAY);

  // Current day (for display purposes)
  const currentDay = Math.floor(frame / STEPS_PER_DAY);

  // Progress within the animation (0 to 1)
  const animationProgress = frame / totalFrames;

  // Calculate animated returns and sort players
  const sortedPlayers = useMemo(() => {
    return [...players]
      .map((player, index) => ({
        ...player,
        color: COLORS[index % COLORS.length],
        originalIndex: index,
        animatedReturn: frame === 0 ? 0 : player.currentReturn * animationProgress,
      }))
      .sort((a, b) => b.animatedReturn - a.animatedReturn);
  }, [players, frame, animationProgress]);

  // Create a map of player positions for smooth vertical transitions
  const playerPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    sortedPlayers.forEach((player, index) => {
      positions[player.id] = index;
    });
    return positions;
  }, [sortedPlayers]);

  // Find max return for scaling
  const maxReturn = Math.max(...players.map((p) => Math.abs(p.currentReturn)));
  const scale = maxReturn > 0 ? 100 / maxReturn : 1;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && frame < totalFrames) {
      // Speed: 50ms per step gives smooth animation
      // Total animation time = daysElapsed * STEPS_PER_DAY * 50ms
      const speed = 50;
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
              initial={{ width: 0 }}
              animate={{ width: `${animationProgress * 100}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {currentDay === 0
              ? 'Day 0 (Base prices - Jan 26 close)'
              : `Day ${currentDay}${currentDay === daysElapsed ? ' (Today)' : ''}`
            }
          </p>
        </div>

        {/* Race bars - using absolute positioning for smooth vertical transitions */}
        <div className="relative" style={{ height: players.length * ROW_HEIGHT }}>
          {players.map((player, originalIndex) => {
            const animatedReturn = frame === 0 ? 0 : player.currentReturn * animationProgress;
            const barWidth = Math.abs(animatedReturn * scale);
            const isPositive = animatedReturn >= 0;
            const currentPosition = playerPositions[player.id] ?? originalIndex;
            const color = COLORS[originalIndex % COLORS.length];

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: originalIndex * ROW_HEIGHT }}
                animate={{
                  opacity: 1,
                  y: currentPosition * ROW_HEIGHT
                }}
                transition={{
                  y: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  },
                  opacity: { duration: 0.3 }
                }}
                className="absolute left-0 right-0 flex items-center gap-4"
                style={{ height: ROW_HEIGHT - 12 }}
              >
                <div className="w-6 text-center text-sm text-muted-foreground font-mono">
                  {currentPosition + 1}
                </div>
                <div className="w-24 text-sm font-medium truncate">{player.name}</div>
                <div className="flex-1 flex items-center">
                  <div className="flex-1 h-8 bg-muted/30 rounded-md overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-md"
                      style={{
                        backgroundColor: isPositive ? '#22c55e' : '#ef4444',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(barWidth, 2)}%` }}
                      transition={{ duration: 0.05, ease: 'linear' }}
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
                      {formatPercent(animatedReturn)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          <p>
            {daysElapsed <= 2
              ? "The contest just started! Day 0 shows base prices (Jan 26 close), Day 1 is the first trading day (Jan 27). Watch players move up and down as standings change!"
              : "This animation shows how standings have changed since the start of the contest. Day 0 = base prices, Day 1 = Jan 27. Watch players move up and down as their rankings change!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

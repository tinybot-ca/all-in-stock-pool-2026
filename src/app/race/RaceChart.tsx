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
  dailyReturns: number[]; // Array of returns for each day
}

interface RaceChartProps {
  players: PlayerData[];
  dates: string[];
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
const STEPS_PER_DAY = 15;
// Height of each row in pixels for position animation
const ROW_HEIGHT = 44;

export function RaceChart({ players, dates, contestStartDate = '2026-01-27' }: RaceChartProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [frame, setFrame] = useState(0);

  // Total days of data (including day 0)
  const totalDays = players[0]?.dailyReturns.length || 1;

  // Total frames = (days - 1) * steps per day (we animate between days)
  const totalFrames = Math.max(1, (totalDays - 1) * STEPS_PER_DAY);

  // Current day index (which day we're displaying)
  const currentDayIndex = Math.min(
    Math.floor(frame / STEPS_PER_DAY),
    totalDays - 1
  );

  // Progress within current day (0 to 1)
  const dayProgress = (frame % STEPS_PER_DAY) / STEPS_PER_DAY;

  // Progress across entire animation (0 to 1)
  const animationProgress = frame / totalFrames;

  // Interpolate returns between days for smooth animation
  const getInterpolatedReturn = (dailyReturns: number[]) => {
    const currentDay = currentDayIndex;
    const nextDay = Math.min(currentDay + 1, dailyReturns.length - 1);

    const currentReturn = dailyReturns[currentDay] ?? 0;
    const nextReturn = dailyReturns[nextDay] ?? currentReturn;

    // Linear interpolation between current and next day
    return currentReturn + (nextReturn - currentReturn) * dayProgress;
  };

  // Calculate animated returns and sort players for current frame
  const sortedPlayers = useMemo(() => {
    return [...players]
      .map((player, index) => ({
        ...player,
        color: COLORS[index % COLORS.length],
        originalIndex: index,
        animatedReturn: getInterpolatedReturn(player.dailyReturns),
      }))
      .sort((a, b) => b.animatedReturn - a.animatedReturn);
  }, [players, frame, currentDayIndex, dayProgress]);

  // Create a map of player positions for smooth vertical transitions
  const playerPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    sortedPlayers.forEach((player, index) => {
      positions[player.id] = index;
    });
    return positions;
  }, [sortedPlayers]);

  // Find max return for scaling bars
  const maxReturn = useMemo(() => {
    let max = 0;
    for (const player of players) {
      for (const ret of player.dailyReturns) {
        if (Math.abs(ret) > max) max = Math.abs(ret);
      }
    }
    return max || 0.1;
  }, [players]);

  const scale = 100 / maxReturn;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && frame < totalFrames) {
      const speed = 60; // ms per frame
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

  // Get display label for current day
  const currentDateLabel = dates[currentDayIndex] || `Day ${currentDayIndex}`;

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
            {currentDateLabel}
          </p>
        </div>

        {/* Race bars - using absolute positioning for smooth vertical transitions */}
        <div className="relative" style={{ height: players.length * ROW_HEIGHT }}>
          {players.map((player, originalIndex) => {
            const animatedReturn = getInterpolatedReturn(player.dailyReturns);
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
                className="absolute left-0 right-0 flex items-center gap-2 sm:gap-4"
                style={{ height: ROW_HEIGHT - 12 }}
              >
                <div className="w-5 sm:w-6 text-center text-xs sm:text-sm text-muted-foreground font-mono">
                  {currentPosition + 1}
                </div>
                <div className="w-16 sm:w-24 text-xs sm:text-sm font-medium truncate">{player.name}</div>
                <div className="flex-1 flex items-center">
                  <div className="flex-1 h-6 sm:h-8 bg-muted/30 rounded-md overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-md"
                      style={{
                        backgroundColor: isPositive ? '#22c55e' : '#ef4444',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(barWidth, 1)}%` }}
                      transition={{ duration: 0.05, ease: 'linear' }}
                    />
                    <div
                      className="absolute inset-y-0 left-2 flex items-center text-white text-xs sm:text-sm font-bold drop-shadow-md"
                      style={{ opacity: barWidth > 15 ? 1 : 0 }}
                    >
                      {player.name}
                    </div>
                  </div>
                  <div className="w-16 sm:w-20 text-right text-xs sm:text-sm font-mono">
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
            Watch players move up and down as their rankings change each day.
            Day 0 shows base prices (Jan 26 close).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

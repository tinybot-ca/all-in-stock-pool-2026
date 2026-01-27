'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Timer, DollarSign } from 'lucide-react';

interface CountdownProps {
  endDate: string;
  prizeAmount: number;
}

export function Countdown({ endDate, prizeAmount }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/20 border-purple-500/30">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-10 w-10 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Grand Prize</p>
              <p className="text-3xl font-bold text-green-500">
                ${prizeAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Timer className="h-8 w-8 text-purple-500" />
            <div className="flex gap-2">
              <TimeUnit value={timeLeft.days} label="days" />
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <TimeUnit value={timeLeft.hours} label="hrs" />
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <TimeUnit value={timeLeft.minutes} label="min" />
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <TimeUnit value={timeLeft.seconds} label="sec" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-mono font-bold tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Radio, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive: boolean;
  isLoading?: boolean;
  marketStatus?: { isOpen: boolean; message: string } | null;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  compact?: boolean;
}

export function LiveIndicator({
  isLive,
  isLoading,
  marketStatus,
  lastUpdated,
  onRefresh,
  compact = false,
}: LiveIndicatorProps) {
  if (compact) {
    return (
      <Badge
        className={cn(
          'gap-1 text-xs',
          isLive
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        )}
        variant="outline"
      >
        {isLive ? (
          <>
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE
          </>
        ) : (
          <>
            <Clock className="h-3 w-3" />
            {marketStatus?.message || 'Daily Close'}
          </>
        )}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Badge
        className={cn(
          'gap-1.5',
          isLive
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        )}
        variant="outline"
      >
        {isLive ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </>
        ) : (
          <>
            <Clock className="h-3 w-3" />
            {marketStatus?.message || 'Daily Close'}
          </>
        )}
      </Badge>

      {lastUpdated && (
        <span className="text-muted-foreground text-xs">
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
          title="Refresh prices"
        >
          <RefreshCw className={cn('h-4 w-4 text-muted-foreground', isLoading && 'animate-spin')} />
        </button>
      )}
    </div>
  );
}

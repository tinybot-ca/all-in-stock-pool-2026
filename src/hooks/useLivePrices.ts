'use client';

import { useState, useEffect, useCallback } from 'react';
import { LivePriceData } from '@/lib/finnhub';

interface LivePricesResponse {
  prices: Record<string, LivePriceData>;
  timestamp: number;
  marketStatus: { isOpen: boolean; message: string };
  cached?: boolean;
  stale?: boolean;
  message?: string;
}

interface UseLivePricesResult {
  livePrices: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  marketStatus: { isOpen: boolean; message: string } | null;
  isLive: boolean;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL = 60 * 1000; // 1 minute

export function useLivePrices(
  staticPrices: Record<string, number>
): UseLivePricesResult {
  const [livePrices, setLivePrices] = useState<Record<string, number>>(staticPrices);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [marketStatus, setMarketStatus] = useState<{ isOpen: boolean; message: string } | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchLivePrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/live-prices');

      if (!response.ok) {
        throw new Error('Failed to fetch live prices');
      }

      const data: LivePricesResponse = await response.json();

      setMarketStatus(data.marketStatus);
      setLastUpdated(new Date(data.timestamp));

      // If we got live prices, merge with static prices
      if (data.prices && Object.keys(data.prices).length > 0) {
        const mergedPrices = { ...staticPrices };
        Object.entries(data.prices).forEach(([ticker, priceData]) => {
          mergedPrices[ticker] = priceData.price;
        });
        setLivePrices(mergedPrices);
        setIsLive(true);
      } else {
        // Market closed or no data - use static prices
        setLivePrices(staticPrices);
        setIsLive(false);
      }
    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLivePrices(staticPrices);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [staticPrices]);

  // Initial fetch
  useEffect(() => {
    fetchLivePrices();
  }, [fetchLivePrices]);

  // Poll for updates when market is open
  useEffect(() => {
    if (!marketStatus?.isOpen) {
      return;
    }

    const interval = setInterval(fetchLivePrices, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [marketStatus?.isOpen, fetchLivePrices]);

  return {
    livePrices,
    isLoading,
    error,
    lastUpdated,
    marketStatus,
    isLive,
    refresh: fetchLivePrices,
  };
}

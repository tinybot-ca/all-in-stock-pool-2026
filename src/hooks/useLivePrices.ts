'use client';

import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  ticker: string;
  price: number;
  updatedAt: number;
}

interface LivePricesResponse {
  prices: Record<string, PriceData>;
  timestamp: number;
  marketStatus: { isOpen: boolean; message: string };
  cached?: boolean;
  source?: string;
  message?: string;
}

interface UseLivePricesResult {
  livePrices: Record<string, number>;
  priceTimestamps: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  marketStatus: { isOpen: boolean; message: string } | null;
  isLive: boolean;
  refresh: () => Promise<void>;
}

export function useLivePrices(
  staticPrices: Record<string, number>
): UseLivePricesResult {
  const [livePrices, setLivePrices] = useState<Record<string, number>>(staticPrices);
  const [priceTimestamps, setPriceTimestamps] = useState<Record<string, number>>({});
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

      // Update prices and timestamps
      if (data.prices && Object.keys(data.prices).length > 0) {
        const mergedPrices = { ...staticPrices };
        const timestamps: Record<string, number> = {};

        Object.entries(data.prices).forEach(([ticker, priceData]) => {
          mergedPrices[ticker] = priceData.price;
          if (priceData.updatedAt) {
            timestamps[ticker] = priceData.updatedAt;
          }
        });

        setLivePrices(mergedPrices);
        setPriceTimestamps(timestamps);
        setIsLive(data.source !== 'static');
      } else {
        setLivePrices(staticPrices);
        setPriceTimestamps({});
        setIsLive(false);
      }
    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLivePrices(staticPrices);
      setPriceTimestamps({});
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [staticPrices]);

  // Initial fetch only
  useEffect(() => {
    fetchLivePrices();
  }, [fetchLivePrices]);

  return {
    livePrices,
    priceTimestamps,
    isLoading,
    error,
    lastUpdated,
    marketStatus,
    isLive,
    refresh: fetchLivePrices,
  };
}

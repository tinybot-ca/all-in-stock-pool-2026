import { NextResponse } from 'next/server';
import { getMarketStatus } from '@/lib/finnhub';
import { getCachedPrices } from '@/lib/redis';
import currentPrices from '@/data/currentPrices.json';

export async function GET() {
  const marketStatus = getMarketStatus();
  const now = Date.now();

  // If market is closed, return static prices
  if (!marketStatus.isOpen) {
    const staticTimestamp = new Date(currentPrices.lastUpdated).getTime();

    const prices: Record<string, {
      ticker: string;
      price: number;
      updatedAt: number;
    }> = {};

    Object.entries(currentPrices.prices).forEach(([ticker, price]) => {
      prices[ticker] = {
        ticker,
        price: price as number,
        updatedAt: staticTimestamp,
      };
    });

    return NextResponse.json({
      prices,
      timestamp: staticTimestamp,
      marketStatus,
      cached: true,
      source: 'static',
      message: 'Market closed - showing closing prices.',
    });
  }

  // Market is open - try to get live prices from Redis
  try {
    const cachedData = await getCachedPrices();

    if (cachedData && Object.keys(cachedData.prices).length > 0) {
      // Convert cached format to API response format
      const prices: Record<string, {
        ticker: string;
        price: number;
        updatedAt: number;
      }> = {};

      Object.entries(cachedData.prices).forEach(([ticker, data]) => {
        prices[ticker] = {
          ticker,
          price: data.price,
          updatedAt: data.updatedAt,
        };
      });

      return NextResponse.json({
        prices,
        timestamp: cachedData.timestamp,
        marketStatus: cachedData.marketStatus,
        cached: true,
        source: 'redis',
        message: 'Live prices from cache.',
      });
    }
  } catch (error) {
    console.error('[API] Error reading from Redis:', error);
  }

  // Fallback to static prices if Redis is empty or fails
  const staticTimestamp = new Date(currentPrices.lastUpdated).getTime();

  const prices: Record<string, {
    ticker: string;
    price: number;
    updatedAt: number;
  }> = {};

  Object.entries(currentPrices.prices).forEach(([ticker, price]) => {
    prices[ticker] = {
      ticker,
      price: price as number,
      updatedAt: staticTimestamp,
    };
  });

  return NextResponse.json({
    prices,
    timestamp: staticTimestamp,
    marketStatus,
    cached: true,
    source: 'static-fallback',
    message: 'Using cached prices (live data unavailable).',
  });
}

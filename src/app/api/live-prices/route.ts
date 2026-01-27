import { NextResponse } from 'next/server';
import { fetchQuotes, isMarketOpen, getMarketStatus, LivePriceData } from '@/lib/finnhub';
import playersData from '@/data/players.json';

// Server-side cache
interface CacheData {
  prices: Record<string, LivePriceData>;
  timestamp: number;
  marketStatus: { isOpen: boolean; message: string };
}

let cache: CacheData | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

// Get all unique tickers from players
function getAllTickers(): string[] {
  const tickers = new Set<string>();
  playersData.players.forEach((player) => {
    player.stocks.forEach((stock) => {
      tickers.add(stock.ticker);
    });
  });
  return Array.from(tickers);
}

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    );
  }

  const now = Date.now();
  const marketStatus = getMarketStatus();

  // Return cached data if still valid
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      prices: cache.prices,
      timestamp: cache.timestamp,
      marketStatus: cache.marketStatus,
      cached: true,
    });
  }

  // If market is closed, return empty with status (client will use static prices)
  if (!marketStatus.isOpen) {
    return NextResponse.json({
      prices: {},
      timestamp: now,
      marketStatus,
      cached: false,
      message: 'Market closed - use daily close prices',
    });
  }

  // Fetch fresh quotes
  try {
    const tickers = getAllTickers();
    console.log(`Fetching live prices for ${tickers.length} stocks...`);

    const prices = await fetchQuotes(tickers, apiKey);

    // Update cache
    cache = {
      prices,
      timestamp: now,
      marketStatus,
    };

    console.log(`Fetched ${Object.keys(prices).length} prices successfully`);

    return NextResponse.json({
      prices,
      timestamp: now,
      marketStatus,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching live prices:', error);

    // Return cached data if available, even if stale
    if (cache) {
      return NextResponse.json({
        prices: cache.prices,
        timestamp: cache.timestamp,
        marketStatus: cache.marketStatus,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch live prices' },
      { status: 500 }
    );
  }
}

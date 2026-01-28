import { NextResponse } from 'next/server';
import { fetchQuotes, getMarketStatus, LivePriceData } from '@/lib/finnhub';
import playersData from '@/data/players.json';

// Reference the global cache set by the cron job
declare global {
  // eslint-disable-next-line no-var
  var priceCache: {
    prices: Record<string, { price: number; change: number; changePercent: number }>;
    timestamp: number;
    marketStatus: { isOpen: boolean; message: string };
  } | null;
}

global.priceCache = global.priceCache || null;

// Local fallback cache (in case cron hasn't run yet)
interface CacheData {
  prices: Record<string, LivePriceData>;
  timestamp: number;
  marketStatus: { isOpen: boolean; message: string };
}

let localCache: CacheData | null = null;
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

  // If market is closed, return empty (client will use static prices)
  if (!marketStatus.isOpen) {
    return NextResponse.json({
      prices: {},
      timestamp: now,
      marketStatus,
      cached: false,
      message: 'Market closed - use daily close prices',
    });
  }

  // Check if we have fresh data from the cron job
  if (global.priceCache && now - global.priceCache.timestamp < CACHE_TTL) {
    // Convert from cron cache format to expected format
    const prices: Record<string, LivePriceData> = {};
    Object.entries(global.priceCache.prices).forEach(([ticker, data]) => {
      prices[ticker] = {
        ticker,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        high: 0,
        low: 0,
        open: 0,
        previousClose: 0,
      };
    });

    return NextResponse.json({
      prices,
      timestamp: global.priceCache.timestamp,
      marketStatus: global.priceCache.marketStatus,
      cached: true,
      source: 'cron',
    });
  }

  // Fallback: Check local cache
  if (localCache && now - localCache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      prices: localCache.prices,
      timestamp: localCache.timestamp,
      marketStatus: localCache.marketStatus,
      cached: true,
      source: 'local',
    });
  }

  // Last resort: Fetch directly (shouldn't happen often if cron is running)
  try {
    const tickers = getAllTickers();
    console.log(`[API] Fetching live prices for ${tickers.length} stocks (cron cache miss)...`);

    const prices = await fetchQuotes(tickers, apiKey);

    // Update local cache
    localCache = {
      prices,
      timestamp: now,
      marketStatus,
    };

    console.log(`[API] Fetched ${Object.keys(prices).length} prices successfully`);

    return NextResponse.json({
      prices,
      timestamp: now,
      marketStatus,
      cached: false,
      source: 'direct',
    });
  } catch (error) {
    console.error('[API] Error fetching live prices:', error);

    // Return stale cache if available
    if (localCache) {
      return NextResponse.json({
        prices: localCache.prices,
        timestamp: localCache.timestamp,
        marketStatus: localCache.marketStatus,
        cached: true,
        stale: true,
        source: 'local-stale',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch live prices' },
      { status: 500 }
    );
  }
}

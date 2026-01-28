import { NextResponse } from 'next/server';
import { fetchQuotes, isMarketOpen, getMarketStatus } from '@/lib/finnhub';
import playersData from '@/data/players.json';

// In-memory cache that persists across requests (within the same serverless instance)
// This will be shared with the live-prices endpoint
declare global {
  // eslint-disable-next-line no-var
  var priceCache: {
    prices: Record<string, { price: number; change: number; changePercent: number; updatedAt: number }>;
    timestamp: number;
    marketStatus: { isOpen: boolean; message: string };
  } | null;
  // eslint-disable-next-line no-var
  var lastBatchGroup: number;
}

global.priceCache = global.priceCache || null;
global.lastBatchGroup = global.lastBatchGroup || 0;

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

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow requests without auth for testing locally
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Finnhub API key not configured' },
      { status: 500 }
    );
  }

  const marketStatus = getMarketStatus();

  // Skip fetching if market is closed
  if (!marketStatus.isOpen) {
    return NextResponse.json({
      success: true,
      message: 'Market closed - skipping price fetch',
      marketStatus,
      timestamp: Date.now(),
    });
  }

  try {
    const allTickers = getAllTickers();

    // Split tickers into 2 groups to stay under Finnhub's 60 calls/min limit
    // Alternate between groups each minute
    const midpoint = Math.ceil(allTickers.length / 2);
    const group1 = allTickers.slice(0, midpoint);
    const group2 = allTickers.slice(midpoint);

    // Alternate which group we fetch
    global.lastBatchGroup = (global.lastBatchGroup + 1) % 2;
    const tickersToFetch = global.lastBatchGroup === 0 ? group1 : group2;

    console.log(`[Cron] Fetching group ${global.lastBatchGroup + 1}/2: ${tickersToFetch.length} stocks...`);

    const quotes = await fetchQuotes(tickersToFetch, apiKey);
    const now = Date.now();

    // Transform to simpler format with individual timestamps
    const newPrices: Record<string, { price: number; change: number; changePercent: number; updatedAt: number }> = {};
    Object.entries(quotes).forEach(([ticker, data]) => {
      newPrices[ticker] = {
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        updatedAt: now,
      };
    });

    // Merge with existing cache (keep prices from other group)
    const existingPrices = global.priceCache?.prices || {};
    const mergedPrices = { ...existingPrices, ...newPrices };

    // Update global cache
    global.priceCache = {
      prices: mergedPrices,
      timestamp: Date.now(),
      marketStatus,
    };

    console.log(`[Cron] Updated ${Object.keys(newPrices).length} prices (total cached: ${Object.keys(mergedPrices).length})`);

    return NextResponse.json({
      success: true,
      message: `Updated group ${global.lastBatchGroup + 1}/2: ${Object.keys(newPrices).length} prices`,
      totalCached: Object.keys(mergedPrices).length,
      marketStatus,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Cron] Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices', details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { fetchQuotes, getMarketStatus } from '@/lib/finnhub';
import { updatePricesInCache, CachedPrice } from '@/lib/redis';
import playersData from '@/data/players.json';

// Track which batch group to fetch (persists in Redis)
import { redis } from '@/lib/redis';

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
    const midpoint = Math.ceil(allTickers.length / 2);
    const group1 = allTickers.slice(0, midpoint);
    const group2 = allTickers.slice(midpoint);

    // Get and toggle batch group from Redis
    const lastBatch = await redis.get<number>('last-batch-group') || 0;
    const currentBatch = (lastBatch + 1) % 2;
    await redis.set('last-batch-group', currentBatch);

    const tickersToFetch = currentBatch === 0 ? group1 : group2;

    console.log(`[Cron] Fetching group ${currentBatch + 1}/2: ${tickersToFetch.length} stocks...`);

    const quotes = await fetchQuotes(tickersToFetch, apiKey);
    const now = Date.now();

    // Transform to cached format with individual timestamps
    const newPrices: Record<string, CachedPrice> = {};
    Object.entries(quotes).forEach(([ticker, data]) => {
      newPrices[ticker] = {
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        updatedAt: now,
      };
    });

    // Update Redis cache (merges with existing prices)
    await updatePricesInCache(newPrices, marketStatus);

    console.log(`[Cron] Updated ${Object.keys(newPrices).length} prices in Redis`);

    return NextResponse.json({
      success: true,
      message: `Updated group ${currentBatch + 1}/2: ${Object.keys(newPrices).length} prices`,
      marketStatus,
      timestamp: now,
    });
  } catch (error) {
    console.error('[Cron] Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices', details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { fetchQuotes, isMarketOpen, getMarketStatus } from '@/lib/finnhub';
import playersData from '@/data/players.json';

// In-memory cache that persists across requests (within the same serverless instance)
// This will be shared with the live-prices endpoint
declare global {
  // eslint-disable-next-line no-var
  var priceCache: {
    prices: Record<string, { price: number; change: number; changePercent: number }>;
    timestamp: number;
    marketStatus: { isOpen: boolean; message: string };
  } | null;
}

global.priceCache = global.priceCache || null;

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
    const tickers = getAllTickers();
    console.log(`[Cron] Fetching live prices for ${tickers.length} stocks...`);

    const quotes = await fetchQuotes(tickers, apiKey);

    // Transform to simpler format
    const prices: Record<string, { price: number; change: number; changePercent: number }> = {};
    Object.entries(quotes).forEach(([ticker, data]) => {
      prices[ticker] = {
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
      };
    });

    // Update global cache
    global.priceCache = {
      prices,
      timestamp: Date.now(),
      marketStatus,
    };

    console.log(`[Cron] Updated ${Object.keys(prices).length} prices successfully`);

    return NextResponse.json({
      success: true,
      message: `Updated ${Object.keys(prices).length} prices`,
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

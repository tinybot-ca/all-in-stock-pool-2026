import { NextResponse } from 'next/server';
import { getMarketStatus } from '@/lib/finnhub';
import currentPrices from '@/data/currentPrices.json';

export async function GET() {
  const marketStatus = getMarketStatus();
  const now = Date.now();

  // Always return the static prices from the JSON file
  // These are updated daily after market close by GitHub Action
  const staticTimestamp = new Date(currentPrices.lastUpdated).getTime();

  // Convert prices to the expected format
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
    message: marketStatus.isOpen
      ? 'Showing latest available prices. Prices update after market close.'
      : 'Market closed - showing closing prices.',
  });
}

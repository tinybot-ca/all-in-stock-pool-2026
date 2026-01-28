/**
 * Finnhub API Client
 *
 * Free tier: 60 calls/minute
 * Endpoint: GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=API_KEY
 */

export interface FinnhubQuote {
  c: number;   // Current price
  d: number;   // Change
  dp: number;  // Percent change
  h: number;   // High price of the day
  l: number;   // Low price of the day
  o: number;   // Open price of the day
  pc: number;  // Previous close price
  t: number;   // Timestamp
}

export interface LivePriceData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export async function fetchQuote(symbol: string, apiKey: string): Promise<FinnhubQuote | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`Rate limited for ${symbol}`);
      }
      return null;
    }

    const data = await response.json();

    // Finnhub returns { c: 0, d: null, dp: null, ... } for invalid symbols
    if (!data.c || data.c === 0) {
      return null;
    }

    return data as FinnhubQuote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function fetchQuotes(
  symbols: string[],
  apiKey: string
): Promise<Record<string, LivePriceData>> {
  const results: Record<string, LivePriceData> = {};

  // Fetch sequentially with delays to stay under Finnhub's 60 calls/min limit
  // 50 stocks with 1s delay = 50 seconds total, completing before next cron run
  const delayMs = 1000;

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];

    const quote = await fetchQuote(symbol, apiKey);
    if (quote) {
      results[symbol] = {
        ticker: symbol,
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        high: quote.h,
        low: quote.l,
        open: quote.o,
        previousClose: quote.pc,
      };
    }

    // Delay between calls (skip after last one)
    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Check if US stock market is currently open
 * Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
 */
export function isMarketOpen(): boolean {
  const now = new Date();

  // Convert to Eastern Time
  const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Weekend check (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return false;
  }

  // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes)
  const marketOpen = 9 * 60 + 30;  // 9:30 AM
  const marketClose = 16 * 60;      // 4:00 PM

  return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

/**
 * Get market status message
 */
export function getMarketStatus(): { isOpen: boolean; message: string } {
  const isOpen = isMarketOpen();

  if (isOpen) {
    return { isOpen: true, message: 'Market Open' };
  }

  const now = new Date();
  const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = etTime.getDay();

  if (day === 0 || day === 6) {
    return { isOpen: false, message: 'Weekend - Market Closed' };
  }

  const hours = etTime.getHours();
  if (hours < 9 || (hours === 9 && etTime.getMinutes() < 30)) {
    return { isOpen: false, message: 'Pre-Market' };
  }

  return { isOpen: false, message: 'After Hours' };
}

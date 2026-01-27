/**
 * Stock Price Fetching Script
 *
 * This script fetches the latest closing prices for all stocks in the pool
 * and updates the currentPrices.json file.
 *
 * Run with: npx ts-node scripts/fetchPrices.ts
 * Or via GitHub Actions daily at 4:30 PM ET
 */

import yahooFinance from 'yahoo-finance2';
import * as fs from 'fs';
import * as path from 'path';

interface PlayersData {
  contestInfo: {
    name: string;
    startDate: string;
    endDate: string;
    prizeAmount: number;
    basePriceDate: string;
    scoring: string;
  };
  players: Array<{
    id: string;
    name: string;
    draftPosition: number;
    stocks: Array<{ ticker: string; basePrice: number }>;
  }>;
}

interface CurrentPrices {
  lastUpdated: string;
  prices: Record<string, number>;
}

async function fetchPrices(): Promise<void> {
  console.log('Starting price fetch...');

  // Load players data to get all tickers
  const playersPath = path.join(__dirname, '../src/data/players.json');
  const playersData: PlayersData = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));

  // Get all unique tickers
  const tickers = new Set<string>();
  playersData.players.forEach((player) => {
    player.stocks.forEach((stock) => {
      tickers.add(stock.ticker);
    });
  });

  const tickerList = Array.from(tickers);
  console.log(`Fetching prices for ${tickerList.length} stocks...`);

  // Fetch prices from Yahoo Finance
  const prices: Record<string, number> = {};
  const errors: string[] = [];

  // Fetch in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < tickerList.length; i += batchSize) {
    const batch = tickerList.slice(i, i + batchSize);
    console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}...`);

    await Promise.all(
      batch.map(async (ticker) => {
        try {
          const quote = await yahooFinance.quote(ticker) as { regularMarketPrice?: number };
          if (quote && quote.regularMarketPrice) {
            prices[ticker] = quote.regularMarketPrice;
            console.log(`  ${ticker}: $${quote.regularMarketPrice}`);
          } else {
            errors.push(ticker);
            console.error(`  ${ticker}: No price data`);
          }
        } catch (error) {
          errors.push(ticker);
          console.error(`  ${ticker}: Error fetching - ${error}`);
        }
      })
    );

    // Small delay between batches
    if (i + batchSize < tickerList.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Load existing prices to fill in any gaps
  const currentPricesPath = path.join(__dirname, '../src/data/currentPrices.json');
  let existingPrices: CurrentPrices = { lastUpdated: '', prices: {} };
  try {
    existingPrices = JSON.parse(fs.readFileSync(currentPricesPath, 'utf-8'));
  } catch {
    console.log('No existing prices file found, creating new one.');
  }

  // Merge with existing prices (use existing for any failed fetches)
  errors.forEach((ticker) => {
    if (existingPrices.prices[ticker]) {
      prices[ticker] = existingPrices.prices[ticker];
      console.log(`Using cached price for ${ticker}: $${prices[ticker]}`);
    }
  });

  // Create the updated prices object
  const updatedPrices: CurrentPrices = {
    lastUpdated: new Date().toISOString(),
    prices,
  };

  // Write to file
  fs.writeFileSync(currentPricesPath, JSON.stringify(updatedPrices, null, 2));
  console.log(`\nPrices updated successfully!`);
  console.log(`Total stocks: ${tickerList.length}`);
  console.log(`Successful fetches: ${tickerList.length - errors.length}`);
  console.log(`Errors: ${errors.length}`);

  // Also save to history folder with date
  const today = new Date().toISOString().split('T')[0];
  const historyPath = path.join(__dirname, '../src/data/history', `${today}.json`);
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(updatedPrices, null, 2));
  console.log(`History saved to: ${historyPath}`);
}

// Run the script
fetchPrices().catch(console.error);

import draftResults from '@/data/draftResults.json';

// Build a map of stock ticker -> pick number
const pickByStock: Record<string, number> = {};
draftResults.picks.forEach((p) => {
  pickByStock[p.stock] = p.pick;
});

/**
 * Get the draft pick number for a stock ticker
 * @param ticker - Stock ticker symbol
 * @returns Pick number (1-100) or undefined if not found
 */
export function getDraftPick(ticker: string): number | undefined {
  return pickByStock[ticker];
}

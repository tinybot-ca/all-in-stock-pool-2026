import { Redis } from '@upstash/redis';

// Initialize Redis client
// You'll need to set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Types
export interface CachedPrice {
  price: number;
  change: number;
  changePercent: number;
  updatedAt: number;
}

export interface PriceCache {
  prices: Record<string, CachedPrice>;
  timestamp: number;
  marketStatus: { isOpen: boolean; message: string };
}

const CACHE_KEY = 'stock-prices';
const CACHE_TTL = 300; // 5 minutes TTL for Redis

// Get cached prices from Redis
export async function getCachedPrices(): Promise<PriceCache | null> {
  try {
    const data = await redis.get<PriceCache>(CACHE_KEY);
    return data;
  } catch (error) {
    console.error('[Redis] Error getting cached prices:', error);
    return null;
  }
}

// Set cached prices in Redis
export async function setCachedPrices(cache: PriceCache): Promise<void> {
  try {
    await redis.set(CACHE_KEY, cache, { ex: CACHE_TTL });
  } catch (error) {
    console.error('[Redis] Error setting cached prices:', error);
  }
}

// Update specific prices in the cache (for batch updates)
export async function updatePricesInCache(
  newPrices: Record<string, CachedPrice>,
  marketStatus: { isOpen: boolean; message: string }
): Promise<void> {
  try {
    // Get existing cache
    const existing = await getCachedPrices();

    // Merge prices
    const mergedPrices = {
      ...(existing?.prices || {}),
      ...newPrices,
    };

    // Save updated cache
    await setCachedPrices({
      prices: mergedPrices,
      timestamp: Date.now(),
      marketStatus,
    });
  } catch (error) {
    console.error('[Redis] Error updating prices in cache:', error);
  }
}

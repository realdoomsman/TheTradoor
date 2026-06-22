import type { DexScreenerPair } from '@/types';

const BASE_URL = 'https://api.dexscreener.com/token-pairs/v1/solana';
const WSOL_MINT = 'So11111111111111111111111111111111111111112';
const CACHE_TTL_MS = 10_000;

// --- In-memory cache ---
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// --- Public API ---

export interface TokenData {
  price: number;
  marketCap: number;
  symbol: string;
  name: string;
  liquidity: number;
}

/**
 * Fetch token data from DEXScreener for a given Solana token mint.
 * Returns the highest-liquidity pair found.
 */
export async function getTokenData(mintAddress: string): Promise<TokenData> {
  const cacheKey = `token:${mintAddress}`;
  const cached = getCached<TokenData>(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${BASE_URL}/${mintAddress}`);
  if (!response.ok) {
    throw new Error(`DEXScreener API error (${response.status})`);
  }

  const pairs: DexScreenerPair[] = await response.json();

  if (!pairs || pairs.length === 0) {
    throw new Error(`No DEXScreener pairs found for mint ${mintAddress}`);
  }

  // Pick the pair with the highest liquidity
  const best = pairs.reduce((a, b) =>
    (a.liquidity?.usd ?? 0) > (b.liquidity?.usd ?? 0) ? a : b,
  );

  const result: TokenData = {
    price: parseFloat(best.priceUsd) || 0,
    marketCap: best.marketCap ?? best.fdv ?? 0,
    symbol: best.baseToken.symbol,
    name: best.baseToken.name,
    liquidity: best.liquidity?.usd ?? 0,
  };

  setCache(cacheKey, result);
  return result;
}

/**
 * Fetch the current SOL price in USD via the WSOL/USDC pair.
 */
export async function getSolPrice(): Promise<number> {
  const cacheKey = 'sol-price';
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const response = await fetch(`${BASE_URL}/${WSOL_MINT}`);
  if (!response.ok) {
    throw new Error(`DEXScreener SOL price fetch failed (${response.status})`);
  }

  const pairs: DexScreenerPair[] = await response.json();

  if (!pairs || pairs.length === 0) {
    throw new Error('No DEXScreener pairs found for Wrapped SOL');
  }

  // Pick the USDC pair with highest liquidity
  const usdcPair = pairs
    .filter(
      (p) =>
        p.quoteToken.symbol === 'USDC' || p.quoteToken.symbol === 'USDT',
    )
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  const price = usdcPair
    ? parseFloat(usdcPair.priceUsd)
    : parseFloat(pairs[0].priceUsd);

  if (!price || isNaN(price)) {
    throw new Error('Could not parse SOL price from DEXScreener');
  }

  setCache(cacheKey, price);
  return price;
}

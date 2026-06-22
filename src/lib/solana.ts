import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  type ConfirmedSignatureInfo,
} from '@solana/web3.js';

/**
 * RPC endpoints in priority order.
 * Helius first (paid, fast), then free public fallbacks.
 */
function getRpcUrls(): string[] {
  const urls: string[] = [];
  if (process.env.HELIUS_RPC_URL) {
    urls.push(process.env.HELIUS_RPC_URL);
  }
  // Free public fallbacks
  urls.push('https://api.mainnet-beta.solana.com');
  urls.push('https://rpc.ankr.com/solana');
  return urls;
}

/** Cached connection instance (module-level singleton). */
let connection: Connection | null = null;
let currentRpcIndex = 0;

/**
 * Returns a lazily-initialised Solana Connection.
 * Falls back to public RPCs if Helius is unavailable.
 */
export function getConnection(): Connection {
  if (!connection) {
    const urls = getRpcUrls();
    const url = urls[currentRpcIndex] || urls[0];
    connection = new Connection(url, 'confirmed');
  }
  return connection;
}

/**
 * Try the current RPC, fall back to next if it fails.
 */
async function withFallback<T>(fn: (conn: Connection) => Promise<T>): Promise<T> {
  const urls = getRpcUrls();

  for (let i = 0; i < urls.length; i++) {
    const idx = (currentRpcIndex + i) % urls.length;
    const conn = new Connection(urls[idx], 'confirmed');
    try {
      const result = await fn(conn);
      // If this worked and we switched, keep using this one
      if (idx !== currentRpcIndex) {
        currentRpcIndex = idx;
        connection = conn;
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`RPC ${urls[idx]} failed: ${msg}, trying next...`);
      if (i === urls.length - 1) throw err;
    }
  }
  throw new Error('All RPC endpoints failed');
}

/** Convenience type re-exported for consumers. */
export interface SignatureResult {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: object | null;
  memo: string | null;
}

/**
 * Fetch the SOL balance for `address` (returned in SOL, not lamports).
 */
export async function getWalletBalance(address: string): Promise<number> {
  const pubkey = new PublicKey(address);
  return withFallback(async (conn) => {
    const lamports = await conn.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  });
}

/**
 * Fetch recent confirmed signatures for `address`.
 * @param limit  Max number of signatures to return (default 100).
 */
export async function fetchRecentSignatures(
  address: string,
  limit = 100,
): Promise<SignatureResult[]> {
  const pubkey = new PublicKey(address);
  return withFallback(async (conn) => {
    const sigs: ConfirmedSignatureInfo[] =
      await conn.getSignaturesForAddress(pubkey, { limit });

    return sigs.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      blockTime: s.blockTime ?? null,
      err: s.err as object | null,
      memo: s.memo ?? null,
    }));
  });
}

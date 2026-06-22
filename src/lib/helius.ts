import type { HeliusTransaction } from '@/types';

const BATCH_SIZE = 100;

/**
 * Fetch parsed transaction details from the Helius Enhanced Transactions API.
 * Signatures are batched into groups of 100 (Helius limit).
 */
export async function fetchParsedTransactions(
  signatures: string[],
): Promise<HeliusTransaction[]> {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey || apiKey === '<placeholder>') {
    throw new Error('HELIUS_API_KEY is not configured');
  }

  const url = `https://api.helius.xyz/v0/transactions/?api-key=${apiKey}`;
  const results: HeliusTransaction[] = [];

  // Split signatures into batches of BATCH_SIZE
  for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
    const batch = signatures.slice(i, i + BATCH_SIZE);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: batch }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Helius API error (${response.status}): ${text}`,
      );
    }

    const parsed: HeliusTransaction[] = await response.json();
    results.push(...parsed);
  }

  return results;
}

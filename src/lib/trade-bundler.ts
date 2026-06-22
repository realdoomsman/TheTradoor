// ============================================================
// Trade Bundler — Pairs buy/sell transactions into unified Trades
// ============================================================

import type { ArchiveTag } from '@/types';

export interface ClassifiedSwap {
  signature: string;
  timestamp: number;
  direction: 'BUY' | 'SELL';
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string | null;
  solAmount: number;
  tokenAmount: number;
  marketCap: number | null;
  price: number | null;
  memo: string | null;
}

export interface TradeBundle {
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string | null;
  action: 'OPEN' | 'CLOSED';

  entrySignature: string;
  entryTimestamp: number;
  entrySolAmount: number;
  entryMarketCap: number | null;
  entryPrice: number | null;

  exitSignature: string | null;
  exitTimestamp: number | null;
  exitSolAmount: number | null;
  exitMarketCap: number | null;
  exitPrice: number | null;

  netPnlSol: number | null;
  roiPercent: number | null;
  holdDurationSec: number | null;
  archiveTag: ArchiveTag | null;
  traderMemo: string | null;
}

/**
 * Bundle classified swap transactions into Trade records.
 * Uses FIFO matching: first buy of Token X is paired with first sell of Token X.
 */
export function bundleTrades(swaps: ClassifiedSwap[]): TradeBundle[] {
  // Sort by timestamp ascending
  const sorted = [...swaps].sort((a, b) => a.timestamp - b.timestamp);

  // FIFO queues per token mint for unmatched buys
  const openBuys = new Map<string, ClassifiedSwap[]>();
  const trades: TradeBundle[] = [];

  for (const swap of sorted) {
    if (swap.direction === 'BUY') {
      // Add to open buys queue
      const queue = openBuys.get(swap.tokenMint) || [];
      queue.push(swap);
      openBuys.set(swap.tokenMint, queue);
    } else if (swap.direction === 'SELL') {
      // Try to match with oldest open buy for this token
      const queue = openBuys.get(swap.tokenMint);

      if (queue && queue.length > 0) {
        const buySwap = queue.shift()!;

        // Calculate PnL
        const netPnlSol = swap.solAmount - buySwap.solAmount;
        const roiPercent =
          buySwap.solAmount > 0
            ? ((swap.solAmount - buySwap.solAmount) / buySwap.solAmount) * 100
            : 0;
        const holdDurationSec = swap.timestamp - buySwap.timestamp;
        const archiveTag = computeArchiveTag(roiPercent);

        trades.push({
          tokenMint: swap.tokenMint,
          tokenSymbol: buySwap.tokenSymbol || swap.tokenSymbol,
          tokenName: buySwap.tokenName || swap.tokenName,
          action: 'CLOSED',
          entrySignature: buySwap.signature,
          entryTimestamp: buySwap.timestamp,
          entrySolAmount: buySwap.solAmount,
          entryMarketCap: buySwap.marketCap,
          entryPrice: buySwap.price,
          exitSignature: swap.signature,
          exitTimestamp: swap.timestamp,
          exitSolAmount: swap.solAmount,
          exitMarketCap: swap.marketCap,
          exitPrice: swap.price,
          netPnlSol,
          roiPercent,
          holdDurationSec,
          archiveTag,
          traderMemo: buySwap.memo || swap.memo,
        });
      } else {
        // Orphan sell — no matching buy found, still record it
        trades.push({
          tokenMint: swap.tokenMint,
          tokenSymbol: swap.tokenSymbol,
          tokenName: swap.tokenName,
          action: 'CLOSED',
          entrySignature: swap.signature,
          entryTimestamp: swap.timestamp,
          entrySolAmount: 0,
          entryMarketCap: null,
          entryPrice: null,
          exitSignature: swap.signature,
          exitTimestamp: swap.timestamp,
          exitSolAmount: swap.solAmount,
          exitMarketCap: swap.marketCap,
          exitPrice: swap.price,
          netPnlSol: swap.solAmount,
          roiPercent: null,
          holdDurationSec: 0,
          archiveTag: 'PROFIT',
          traderMemo: swap.memo,
        });
      }
    }
  }

  // Remaining unmatched buys are open trades
  for (const [, queue] of openBuys) {
    for (const buySwap of queue) {
      trades.push({
        tokenMint: buySwap.tokenMint,
        tokenSymbol: buySwap.tokenSymbol,
        tokenName: buySwap.tokenName,
        action: 'OPEN',
        entrySignature: buySwap.signature,
        entryTimestamp: buySwap.timestamp,
        entrySolAmount: buySwap.solAmount,
        entryMarketCap: buySwap.marketCap,
        entryPrice: buySwap.price,
        exitSignature: null,
        exitTimestamp: null,
        exitSolAmount: null,
        exitMarketCap: null,
        exitPrice: null,
        netPnlSol: null,
        roiPercent: null,
        holdDurationSec: null,
        archiveTag: null,
        traderMemo: buySwap.memo,
      });
    }
  }

  return trades;
}

function computeArchiveTag(roiPercent: number): ArchiveTag {
  if (roiPercent >= 1000) return 'HIMOTHY';
  if (roiPercent > 0) return 'PROFIT';
  return 'REKT';
}

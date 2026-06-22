import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { fetchRecentSignatures, getWalletBalance } from '@/lib/solana';
import { fetchParsedTransactions } from '@/lib/helius';
import { classifyTransaction, extractSwapDetails } from '@/lib/transaction-classifier';
import { calculateMetrics } from '@/lib/metrics-calculator';
import { getSolPrice, getTokenData } from '@/lib/dexscreener';
import type { HeliusTransaction, TransactionType } from '@/types';

interface ClassifiedEntry {
  tx: HeliusTransaction;
  type: TransactionType;
}

export const dynamic = 'force-dynamic';

/**
 * Main sync handler — ingests new transactions, classifies, bundles trades,
 * and updates global metrics. Works with both GET (Vercel cron) and POST.
 */
async function handleSync(): Promise<NextResponse> {
  try {
    const config = getConfig();

    if (config.isDemoMode) {
      return NextResponse.json(
        { message: 'Demo mode active — set TRADOOR_TOKEN_MINT to enable live sync', synced: 0 },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { message: 'Database not available', synced: 0 },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // 1. Fetch recent signatures from chain
    const signatures = await fetchRecentSignatures(config.masterWalletAddress, 200);
    const sigStrings = signatures.map((s) => s.signature);

    // 2. Filter out already-stored signatures
    const existing = await prisma.transaction.findMany({
      where: { signature: { in: sigStrings } },
      select: { signature: true },
    });
    const existingSet = new Set(existing.map((e) => e.signature));
    const newSigs = sigStrings.filter((s) => !existingSet.has(s));

    if (newSigs.length === 0) {
      // Even with no new txs, update wallet balance in metrics
      await updateWalletMetrics(config.masterWalletAddress);
      return NextResponse.json(
        { message: 'No new transactions', synced: 0 },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // 3. Parse via Helius Enhanced API
    const parsed: HeliusTransaction[] = await fetchParsedTransactions(newSigs);

    // 4. Classify and store
    const classified: ClassifiedEntry[] = [];
    let storedCount = 0;

    for (const tx of parsed) {
      const txType: TransactionType = classifyTransaction(tx, config);

      // Skip if already stored (race condition guard)
      const alreadyExists = await prisma.transaction.findUnique({
        where: { signature: tx.signature },
        select: { id: true },
      });
      if (alreadyExists) continue;

      const txRecord = await prisma.transaction.create({
        data: {
          signature: tx.signature,
          blockTime: tx.timestamp,
          type: txType,
          source: tx.source || 'UNKNOWN',
          feeLamports: tx.fee,
          memo: null,
          rawJson: JSON.stringify(tx),
          processed: false,
        },
      });

      classified.push({ tx, type: txType });
      storedCount++;

      // Store burn records
      if (txType === 'BURN') {
        const burnAmount = tx.tokenTransfers
          .filter((tt) => tt.mint === config.tradoorTokenMint)
          .reduce((sum, tt) => sum + tt.tokenAmount, 0);

        if (burnAmount > 0) {
          await prisma.burn.create({
            data: {
              transactionId: txRecord.id,
              timestamp: tx.timestamp,
              tradoorAmount: burnAmount,
              solValueAtBurn: 0,
              usdValueAtBurn: null,
            },
          });
        }
      }

      // Store tax inflows
      if (txType === 'TAX_INFLOW') {
        const inflowAmount = tx.tokenTransfers
          .filter(
            (tt) =>
              tt.mint === config.tradoorTokenMint &&
              tt.toUserAccount === config.masterWalletAddress,
          )
          .reduce((sum, tt) => sum + tt.tokenAmount, 0);

        await prisma.taxInflow.create({
          data: {
            transactionId: txRecord.id,
            timestamp: tx.timestamp,
            solAmount: inflowAmount,
          },
        });
      }
    }

    // 5. Process swaps — match sells to existing open trades in DB
    const tokenNameCache = new Map<string, { symbol: string; name: string | null }>();
    let tradesCreated = 0;
    let tradesClosed = 0;

    for (const entry of classified) {
      if (entry.type !== 'SWAP') continue;
      
      const details = extractSwapDetails(entry.tx, config);
      if (!details) continue;

      // Resolve token name/symbol
      let tokenInfo = tokenNameCache.get(details.tokenMint);
      if (!tokenInfo) {
        try {
          const tokenData = await getTokenData(details.tokenMint);
          tokenInfo = {
            symbol: tokenData?.symbol || 'UNKNOWN',
            name: tokenData?.name || null,
          };
        } catch {
          tokenInfo = { symbol: 'UNKNOWN', name: null };
        }
        tokenNameCache.set(details.tokenMint, tokenInfo);
      }

      const txRecord = await prisma.transaction.findUnique({
        where: { signature: entry.tx.signature },
        select: { id: true },
      });

      if (details.direction === 'BUY') {
        // Check if we already have a trade for this buy tx
        const existingBuyTrade = txRecord ? await prisma.trade.findFirst({
          where: { entryTxId: txRecord.id },
        }) : null;

        if (!existingBuyTrade) {
          await prisma.trade.create({
            data: {
              tokenMint: details.tokenMint,
              tokenSymbol: tokenInfo.symbol,
              tokenName: tokenInfo.name,
              action: 'OPEN',
              entryTxId: txRecord?.id ?? null,
              entryTimestamp: entry.tx.timestamp,
              entrySolAmount: details.solAmount,
              entryMarketCap: null,
              entryPrice: null,
              exitTxId: null,
              exitTimestamp: null,
              exitSolAmount: null,
              exitMarketCap: null,
              exitPrice: null,
              netPnlSol: null,
              roiPercent: null,
              holdDurationSec: null,
              archiveTag: null,
              traderMemo: details.memo,
            },
          });
          tradesCreated++;
        }
      } else if (details.direction === 'SELL') {
        // Find an existing OPEN trade for this token
        const openTrade = await prisma.trade.findFirst({
          where: {
            tokenMint: details.tokenMint,
            action: 'OPEN',
          },
          orderBy: { entryTimestamp: 'asc' }, // FIFO — close oldest first
        });

        if (openTrade) {
          // Close the trade with exit data
          const netPnl = details.solAmount - openTrade.entrySolAmount;
          const roi = openTrade.entrySolAmount > 0
            ? ((details.solAmount - openTrade.entrySolAmount) / openTrade.entrySolAmount) * 100
            : 0;
          const holdDuration = entry.tx.timestamp - openTrade.entryTimestamp;
          const archiveTag = roi >= 1000 ? 'HIMOTHY' : roi > 0 ? 'PROFIT' : 'REKT';

          await prisma.trade.update({
            where: { id: openTrade.id },
            data: {
              action: 'CLOSED',
              exitTxId: txRecord?.id ?? null,
              exitTimestamp: entry.tx.timestamp,
              exitSolAmount: details.solAmount,
              netPnlSol: Math.round(netPnl * 10000) / 10000,
              roiPercent: Math.round(roi * 100) / 100,
              holdDurationSec: holdDuration,
              archiveTag,
            },
          });
          tradesClosed++;
        } else {
          // Orphan sell — no matching buy found, record as closed trade
          await prisma.trade.create({
            data: {
              tokenMint: details.tokenMint,
              tokenSymbol: tokenInfo.symbol,
              tokenName: tokenInfo.name,
              action: 'CLOSED',
              entryTxId: null,
              entryTimestamp: entry.tx.timestamp,
              entrySolAmount: 0,
              entryMarketCap: null,
              entryPrice: null,
              exitTxId: txRecord?.id ?? null,
              exitTimestamp: entry.tx.timestamp,
              exitSolAmount: details.solAmount,
              exitMarketCap: null,
              exitPrice: null,
              netPnlSol: details.solAmount,
              roiPercent: null,
              holdDurationSec: 0,
              archiveTag: 'PROFIT',
              traderMemo: details.memo,
            },
          });
          tradesCreated++;
        }
      }
    }

    // 6. Recalculate global metrics
    await recalculateMetrics(config.masterWalletAddress);

    // Mark transactions as processed
    await prisma.transaction.updateMany({
      where: {
        signature: { in: parsed.map((p) => p.signature) },
        processed: false,
      },
      data: { processed: true },
    });

    return NextResponse.json(
      {
        message: 'Sync complete',
        synced: storedCount,
        tradesCreated,
        tradesClosed,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[sync] Error:', message);
    return NextResponse.json(
      { error: 'SYNC_FAILED', message },
      { status: 500 },
    );
  }
}

/**
 * Update wallet balance + SOL price in metrics (even when no new txs).
 */
async function updateWalletMetrics(walletAddress: string) {
  if (!prisma) return;
  try {
    const [walletSol, solPrice] = await Promise.all([
      getWalletBalance(walletAddress),
      getSolPrice(),
    ]);
    await prisma.globalMetrics.upsert({
      where: { id: 'singleton' },
      update: {
        totalWalletValueSol: walletSol,
        totalWalletValueUsd: walletSol * solPrice,
        lastUpdated: new Date(),
      },
      create: {
        id: 'singleton',
        totalWalletValueSol: walletSol,
        totalWalletValueUsd: walletSol * solPrice,
      },
    });
  } catch (e) {
    console.error('[sync] Failed to update wallet metrics:', e);
  }
}

/**
 * Recalculate all global metrics from DB data.
 */
async function recalculateMetrics(walletAddress: string) {
  if (!prisma) return;

  const [allTrades, allBurns, allInflows] = await Promise.all([
    prisma.trade.findMany(),
    prisma.burn.findMany(),
    prisma.taxInflow.findMany(),
  ]);

  const computed = calculateMetrics(
    allTrades.map((t) => ({
      action: t.action,
      netPnlSol: t.netPnlSol,
      roiPercent: t.roiPercent,
    })),
    allBurns.map((b) => ({
      tradoorAmount: b.tradoorAmount,
      solValueAtBurn: b.solValueAtBurn,
    })),
    allInflows.map((ti) => ({
      timestamp: ti.timestamp,
      solAmount: ti.solAmount,
    })),
  );

  // Sanitize Infinity values for DB storage
  const sanitized = {
    ...computed,
    profitFactor: isFinite(computed.profitFactor) ? computed.profitFactor : 999.99,
    lifetimeRoiPercent: isFinite(computed.lifetimeRoiPercent) ? computed.lifetimeRoiPercent : 0,
  };

  const [walletSol, solPrice] = await Promise.all([
    getWalletBalance(walletAddress),
    getSolPrice(),
  ]);

  await prisma.globalMetrics.upsert({
    where: { id: 'singleton' },
    update: {
      ...sanitized,
      totalWalletValueSol: walletSol,
      totalWalletValueUsd: walletSol * solPrice,
      lastUpdated: new Date(),
    },
    create: {
      id: 'singleton',
      ...sanitized,
      totalWalletValueSol: walletSol,
      totalWalletValueUsd: walletSol * solPrice,
    },
  });
}

// Vercel cron calls GET
export async function GET(): Promise<NextResponse> {
  return handleSync();
}

// Manual trigger via POST
export async function POST(): Promise<NextResponse> {
  return handleSync();
}

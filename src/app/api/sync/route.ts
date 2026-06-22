import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma!;
import { fetchRecentSignatures } from '@/lib/solana';
import { fetchParsedTransactions } from '@/lib/helius';
import { classifyTransaction } from '@/lib/transaction-classifier';
import { bundleTrades, type ClassifiedSwap } from '@/lib/trade-bundler';
import { calculateMetrics } from '@/lib/metrics-calculator';
import { getWalletBalance } from '@/lib/solana';
import { getSolPrice } from '@/lib/dexscreener';
import { extractSwapDetails } from '@/lib/transaction-classifier';
import type { HeliusTransaction, TransactionType } from '@/types';

interface ClassifiedEntry {
  tx: HeliusTransaction;
  type: TransactionType;
}

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  try {
    const config = getConfig();

    if (config.isDemoMode) {
      return NextResponse.json(
        { message: 'Demo mode active', synced: 0 },
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
      return NextResponse.json(
        { message: 'No new transactions', synced: 0 },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // 3. Parse via Helius
    const parsed: HeliusTransaction[] = await fetchParsedTransactions(newSigs);

    // 4. Classify and store
    const classified: ClassifiedEntry[] = [];
    let storedCount = 0;

    for (const tx of parsed) {
      const txType: TransactionType = classifyTransaction(tx, config);

      await prisma.transaction.create({
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
          const txRecord = await prisma.transaction.findUnique({
            where: { signature: tx.signature },
          });
          if (txRecord) {
            await prisma.burn.create({
              data: {
                transactionId: txRecord.id,
                timestamp: tx.timestamp,
                tradoorAmount: burnAmount,
                solValueAtBurn: 0, // Would need price lookup
                usdValueAtBurn: null,
              },
            });
          }
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

        const txRecord = await prisma.transaction.findUnique({
          where: { signature: tx.signature },
        });
        if (txRecord) {
          await prisma.taxInflow.create({
            data: {
              transactionId: txRecord.id,
              timestamp: tx.timestamp,
              solAmount: inflowAmount,
            },
          });
        }
      }
    }

    // 5. Bundle trades — convert classified entries to swap details
    const swaps: ClassifiedSwap[] = [];
    for (const entry of classified) {
      if (entry.type === 'SWAP') {
        const details = extractSwapDetails(entry.tx, config);
        if (details) {
          swaps.push({
            signature: entry.tx.signature,
            timestamp: entry.tx.timestamp,
            direction: details.direction,
            tokenMint: details.tokenMint,
            tokenSymbol: 'UNKNOWN',
            tokenName: null,
            solAmount: details.solAmount,
            tokenAmount: details.tokenAmount,
            marketCap: null,
            price: null,
            memo: details.memo,
          });
        }
      }
    }
    const bundles = bundleTrades(swaps);

    for (const bundle of bundles) {
      const entryTx = await prisma.transaction.findUnique({
        where: { signature: bundle.entrySignature },
      });
      const exitTx = bundle.exitSignature
        ? await prisma.transaction.findUnique({
            where: { signature: bundle.exitSignature },
          })
        : null;

      await prisma.trade.create({
        data: {
          tokenMint: bundle.tokenMint,
          tokenSymbol: bundle.tokenSymbol,
          tokenName: bundle.tokenName,
          action: bundle.action,
          entryTxId: entryTx?.id ?? null,
          entryTimestamp: bundle.entryTimestamp,
          entrySolAmount: bundle.entrySolAmount,
          entryMarketCap: null,
          entryPrice: null,
          exitTxId: exitTx?.id ?? null,
          exitTimestamp: bundle.exitTimestamp,
          exitSolAmount: bundle.exitSolAmount,
          exitMarketCap: null,
          exitPrice: null,
          netPnlSol: bundle.netPnlSol,
          roiPercent: bundle.roiPercent,
          holdDurationSec: bundle.holdDurationSec,
          archiveTag: bundle.archiveTag,
          traderMemo: bundle.traderMemo,
        },
      });
    }

    // 6. Recalculate and store global metrics
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

    // Get wallet value
    const [walletSol, solPrice] = await Promise.all([
      getWalletBalance(config.masterWalletAddress),
      getSolPrice(),
    ]);

    await prisma.globalMetrics.upsert({
      where: { id: 'singleton' },
      update: {
        ...computed,
        totalWalletValueSol: walletSol,
        totalWalletValueUsd: walletSol * solPrice,
        lastUpdated: new Date(),
      },
      create: {
        id: 'singleton',
        ...computed,
        totalWalletValueSol: walletSol,
        totalWalletValueUsd: walletSol * solPrice,
      },
    });

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
        tradesCreated: bundles.length,
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

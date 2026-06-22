import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getDemoMetrics } from '@/lib/demo-data';
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma!;
import type { GlobalMetrics } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const config = getConfig();

    if (config.isDemoMode) {
      return NextResponse.json(getDemoMetrics(), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Fetch singleton metrics row from DB
    const row = await prisma.globalMetrics.findUnique({
      where: { id: 'singleton' },
    });

    if (!row) {
      // Return zeroed metrics if nothing has been synced yet
      const empty: GlobalMetrics = {
        totalWalletValueSol: 0,
        totalWalletValueUsd: 0,
        totalSolProfitGenerated: 0,
        lifetimeRoiPercent: 0,
        profitFactor: 0,
        winRate: 0,
        totalTradesClosed: 0,
        totalWins: 0,
        totalLosses: 0,
        totalTradoorBurned: 0,
        burnSupplyPercent: 0,
        taxInflowRateSolHr: 0,
        lastUpdated: new Date().toISOString(),
      };
      return NextResponse.json(empty, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const metrics: GlobalMetrics = {
      totalWalletValueSol: row.totalWalletValueSol,
      totalWalletValueUsd: row.totalWalletValueUsd,
      totalSolProfitGenerated: row.totalSolProfitGenerated,
      lifetimeRoiPercent: row.lifetimeRoiPercent,
      profitFactor: row.profitFactor,
      winRate: row.winRate,
      totalTradesClosed: row.totalTradesClosed,
      totalWins: row.totalWins,
      totalLosses: row.totalLosses,
      totalTradoorBurned: row.totalTradoorBurned,
      burnSupplyPercent: row.burnSupplyPercent,
      taxInflowRateSolHr: row.taxInflowRateSolHr,
      lastUpdated: row.lastUpdated.toISOString(),
    };

    return NextResponse.json(metrics, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'METRICS_FETCH_FAILED', message },
      { status: 500 },
    );
  }
}

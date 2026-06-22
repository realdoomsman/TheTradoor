import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getDemoLiveTrades } from '@/lib/demo-data';
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma!;
import { getTokenData } from '@/lib/dexscreener';
import type { LiveTrade } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const config = getConfig();

    if (config.isDemoMode) {
      return NextResponse.json(getDemoLiveTrades(), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Fetch open trades from DB
    const rows = await prisma.trade.findMany({
      where: { action: 'OPEN' },
      orderBy: { entryTimestamp: 'desc' },
    });

    // Enrich each with live price data from DEXScreener
    const liveTrades: LiveTrade[] = await Promise.all(
      rows.map(async (r) => {
        let currentPrice = 0;
        let currentMarketCap = 0;
        let currentRoi = 0;

        try {
          const tokenData = await getTokenData(r.tokenMint);
          currentPrice = tokenData.price;
          currentMarketCap = tokenData.marketCap;

          if (r.entryPrice && r.entryPrice > 0) {
            currentRoi = ((currentPrice - r.entryPrice) / r.entryPrice) * 100;
          }
        } catch {
          // If DEXScreener fails, use entry data as fallback
          currentPrice = r.entryPrice ?? 0;
          currentMarketCap = r.entryMarketCap ?? 0;
        }

        return {
          id: r.id,
          tokenMint: r.tokenMint,
          tokenSymbol: r.tokenSymbol,
          tokenName: r.tokenName,
          action: 'OPEN' as const,
          entryTimestamp: r.entryTimestamp,
          entrySolAmount: r.entrySolAmount,
          entryMarketCap: r.entryMarketCap,
          entryPrice: r.entryPrice,
          exitTimestamp: null,
          exitSolAmount: null,
          exitMarketCap: null,
          exitPrice: null,
          netPnlSol: null,
          roiPercent: null,
          holdDurationSec: null,
          archiveTag: null,
          traderMemo: r.traderMemo,
          currentPrice,
          currentMarketCap,
          currentRoi,
          status: 'LIVE' as const,
        };
      }),
    );

    return NextResponse.json(liveTrades, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'LIVE_TRADES_FETCH_FAILED', message },
      { status: 500 },
    );
  }
}

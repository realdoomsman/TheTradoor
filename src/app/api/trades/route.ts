import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getDemoClosedTrades, getDemoLiveTrades } from '@/lib/demo-data';
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma!;
import type { PaginatedResponse, ClosedTrade, LiveTrade, Trade } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const config = getConfig();
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? 'CLOSED';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    if (config.isDemoMode) {
      if (status === 'OPEN') {
        const liveTrades = getDemoLiveTrades();
        const response: PaginatedResponse<LiveTrade> = {
          data: liveTrades,
          page: 1,
          totalPages: 1,
          totalCount: liveTrades.length,
        };
        return NextResponse.json(response, {
          headers: { 'Cache-Control': 'no-store' },
        });
      }

      const result = getDemoClosedTrades(page, limit);
      const response: PaginatedResponse<ClosedTrade> = {
        data: result.data,
        page,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
      return NextResponse.json(response, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Live DB query
    const action = status === 'OPEN' ? 'OPEN' : 'CLOSED';
    const [rows, totalCount] = await Promise.all([
      prisma.trade.findMany({
        where: { action },
        orderBy: { entryTimestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trade.count({ where: { action } }),
    ]);

    const trades: Trade[] = rows.map((r) => ({
      id: r.id,
      tokenMint: r.tokenMint,
      tokenSymbol: r.tokenSymbol,
      tokenName: r.tokenName,
      action: r.action as Trade['action'],
      entryTimestamp: r.entryTimestamp,
      entrySolAmount: r.entrySolAmount,
      entryMarketCap: r.entryMarketCap,
      entryPrice: r.entryPrice,
      exitTimestamp: r.exitTimestamp,
      exitSolAmount: r.exitSolAmount,
      exitMarketCap: r.exitMarketCap,
      exitPrice: r.exitPrice,
      netPnlSol: r.netPnlSol,
      roiPercent: r.roiPercent,
      holdDurationSec: r.holdDurationSec,
      archiveTag: r.archiveTag as Trade['archiveTag'],
      traderMemo: r.traderMemo,
    }));

    const response: PaginatedResponse<Trade> = {
      data: trades,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'TRADES_FETCH_FAILED', message },
      { status: 500 },
    );
  }
}

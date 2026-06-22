import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getDemoBurns } from '@/lib/demo-data';
import { prisma as _prisma } from '@/lib/prisma';
const prisma = _prisma!;
import type { BurnRecord, PaginatedResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const config = getConfig();
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    if (config.isDemoMode) {
      const result = getDemoBurns(page, limit);
      const response: PaginatedResponse<BurnRecord> = {
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
    const [rows, totalCount] = await Promise.all([
      prisma.burn.findMany({
        include: { transaction: { select: { signature: true } } },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.burn.count(),
    ]);

    const burns: BurnRecord[] = rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      tradoorAmount: r.tradoorAmount,
      solValueAtBurn: r.solValueAtBurn,
      usdValueAtBurn: r.usdValueAtBurn,
      txSignature: r.transaction.signature,
      solscanUrl: `https://solscan.io/tx/${r.transaction.signature}`,
    }));

    const response: PaginatedResponse<BurnRecord> = {
      data: burns,
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
      { error: 'BURNS_FETCH_FAILED', message },
      { status: 500 },
    );
  }
}

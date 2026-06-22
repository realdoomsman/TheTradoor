import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getDemoWalletInfo } from '@/lib/demo-data';
import { getWalletBalance } from '@/lib/solana';
import { getSolPrice } from '@/lib/dexscreener';
import type { WalletInfo } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const config = getConfig();
  const walletAddress = config.masterWalletAddress;

  // If no wallet configured at all, use demo
  if (
    !walletAddress ||
    walletAddress === '<MASTER_WALLET_PUBKEY>' ||
    walletAddress.length < 30
  ) {
    return NextResponse.json(getDemoWalletInfo(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Try real wallet balance (works with public RPC, doesn't need Helius)
  try {
    const [balanceSol, solPrice] = await Promise.all([
      getWalletBalance(walletAddress),
      getSolPrice(),
    ]);

    const info: WalletInfo = {
      balanceSol,
      balanceUsd: parseFloat((balanceSol * solPrice).toFixed(2)),
      solPrice,
    };

    return NextResponse.json(info, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Live wallet fetch failed, falling back to demo:', error);
    // Fallback to demo if RPC calls fail
    return NextResponse.json(getDemoWalletInfo(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

// ============================================================
// Demo Data — Pre-launch empty state (no fake numbers)
// ============================================================

import type {
  GlobalMetrics,
  LiveTrade,
  ClosedTrade,
  BurnRecord,
  WalletInfo,
} from '@/types';

// --- Demo Metrics (all zeros — pre-launch) ---
export function getDemoMetrics(): GlobalMetrics {
  return {
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
}

// --- Demo Wallet ---
export function getDemoWalletInfo(): WalletInfo {
  return {
    balanceSol: 0,
    balanceUsd: 0,
    solPrice: 0,
  };
}

// --- Demo Live Trades (empty — no trades yet) ---
export function getDemoLiveTrades(): LiveTrade[] {
  return [];
}

// --- Demo Closed Trades (empty) ---
export function getDemoClosedTrades(
  _page: number,
  _limit: number,
): { data: ClosedTrade[]; totalCount: number; totalPages: number } {
  return { data: [], totalCount: 0, totalPages: 0 };
}

// --- Demo Burns (empty) ---
export function getDemoBurns(
  _page: number,
  _limit: number,
): { data: BurnRecord[]; totalCount: number; totalPages: number } {
  return { data: [], totalCount: 0, totalPages: 0 };
}

// --- Demo SSE Stream Events ---
export function getRandomDemoStreamEvent() {
  return {
    type: 'status',
    data: {
      message: 'awaiting launch',
      timestamp: new Date().toISOString(),
    },
  };
}

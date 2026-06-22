// ============================================================
// Metrics Calculator — Computes global performance metrics
// ============================================================

import type { GlobalMetrics } from '@/types';

interface TradeRecord {
  netPnlSol: number | null;
  roiPercent: number | null;
  action: string;
}

interface BurnRecord {
  tradoorAmount: number;
}

interface TaxInflowRecord {
  solAmount: number;
  timestamp: number;
}

const TOTAL_SUPPLY = Number(process.env.TRADOOR_TOTAL_SUPPLY || '1000000000');

export function calculateMetrics(
  trades: TradeRecord[],
  burns: BurnRecord[],
  taxInflows: TaxInflowRecord[]
): Omit<GlobalMetrics, 'totalWalletValueSol' | 'totalWalletValueUsd' | 'lastUpdated'> {
  // Filter to closed trades only
  const closedTrades = trades.filter(
    (t) => t.action === 'CLOSED' && t.netPnlSol !== null
  );

  const totalTradesClosed = closedTrades.length;
  const wins = closedTrades.filter((t) => (t.netPnlSol ?? 0) > 0);
  const losses = closedTrades.filter((t) => (t.netPnlSol ?? 0) <= 0);

  const totalWins = wins.length;
  const totalLosses = losses.length;
  const winRate = totalTradesClosed > 0 ? (totalWins / totalTradesClosed) * 100 : 0;

  // Total SOL profit
  const totalSolProfitGenerated = closedTrades.reduce(
    (sum, t) => sum + (t.netPnlSol ?? 0),
    0
  );

  // Profit factor = gross gains / gross losses
  const grossGains = wins.reduce((sum, t) => sum + (t.netPnlSol ?? 0), 0);
  const grossLosses = Math.abs(
    losses.reduce((sum, t) => sum + (t.netPnlSol ?? 0), 0)
  );
  const profitFactor = grossLosses > 0 ? grossGains / grossLosses : grossGains > 0 ? Infinity : 0;

  // Lifetime ROI (average)
  const lifetimeRoiPercent =
    closedTrades.length > 0
      ? closedTrades.reduce((sum, t) => sum + (t.roiPercent ?? 0), 0) /
        closedTrades.length
      : 0;

  // Burn metrics
  const totalTradoorBurned = burns.reduce((sum, b) => sum + b.tradoorAmount, 0);
  const burnSupplyPercent = (totalTradoorBurned / TOTAL_SUPPLY) * 100;

  // Tax inflow rate (SOL/hour) — calculated from last 24 hours
  const now = Math.floor(Date.now() / 1000);
  const twentyFourHoursAgo = now - 24 * 60 * 60;
  const recentInflows = taxInflows.filter((t) => t.timestamp >= twentyFourHoursAgo);
  const totalRecentInflowSol = recentInflows.reduce(
    (sum, t) => sum + t.solAmount,
    0
  );

  // Hours elapsed (max 24 for rate calculation)
  const oldestRecentTimestamp =
    recentInflows.length > 0
      ? Math.min(...recentInflows.map((t) => t.timestamp))
      : now;
  const hoursElapsed = Math.max(
    (now - oldestRecentTimestamp) / 3600,
    1 // minimum 1 hour to avoid division by zero
  );
  const taxInflowRateSolHr = totalRecentInflowSol / hoursElapsed;

  return {
    totalSolProfitGenerated: Math.round(totalSolProfitGenerated * 100) / 100,
    lifetimeRoiPercent: Math.round(lifetimeRoiPercent * 10) / 10,
    profitFactor: Math.round(profitFactor * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    totalTradesClosed,
    totalWins,
    totalLosses,
    totalTradoorBurned: Math.round(totalTradoorBurned),
    burnSupplyPercent: Math.round(burnSupplyPercent * 10) / 10,
    taxInflowRateSolHr: Math.round(taxInflowRateSolHr * 10) / 10,
  };
}

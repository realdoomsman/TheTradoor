'use client';

import { useMetrics } from '@/hooks/use-metrics';
import { useWallet } from '@/hooks/use-wallet';
import { useLiveTrades } from '@/hooks/use-live-trades';

function progressBar(percent: number, width: number = 10): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}

export function StatsApp() {
  const { data: metrics, isLoading: metricsLoading } = useMetrics();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: liveTrades } = useLiveTrades();

  const walletSol = wallet?.balanceSol ?? 0;
  const walletUsd = wallet?.balanceUsd ?? 0;
  const openPositions = liveTrades?.length ?? 0;
  const winRate = metrics?.winRate ?? 0;
  const profitFactor = metrics?.profitFactor ?? 0;
  const totalWins = metrics?.totalWins ?? 0;
  const totalLosses = metrics?.totalLosses ?? 0;
  const tradesClosed = metrics?.totalTradesClosed ?? 0;
  const lifetimeRoi = metrics?.lifetimeRoiPercent ?? 0;
  const totalProfit = metrics?.totalSolProfitGenerated ?? 0;

  const isLoading = metricsLoading || walletLoading;

  if (isLoading) {
    return (
      <div className="font-mono text-dim text-sm p-4">
        crunching numbers ser...
      </div>
    );
  }

  const hasClosedTrades = tradesClosed > 0;

  const roiVerdict = !hasClosedTrades ? 'awaiting first closed trade'
    : lifetimeRoi >= 100 ? 'absolutely based'
    : lifetimeRoi >= 50 ? 'pretty based'
    : lifetimeRoi >= 10 ? 'doing ok'
    : lifetimeRoi >= 0 ? 'surviving'
    : lifetimeRoi > -50 ? 'it could be worse'
    : 'oh no';

  return (
    <div className="font-mono space-y-4">
      {/* Treasury Value */}
      <div className="text-center py-3">
        <div className="text-[10px] tracking-widest text-dim uppercase mb-2">
          treasury value
        </div>
        <div className="text-[32px] font-black leading-none text-profit glow-text">
          {walletSol.toFixed(3)} SOL
        </div>
        <div className="text-[13px] text-mid mt-1">
          ${walletUsd.toFixed(2)} USD
        </div>
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* Status row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="info-box text-center">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">open</div>
          <div className="text-lg font-bold text-profit">{openPositions}</div>
        </div>
        <div className="info-box text-center">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">closed</div>
          <div className="text-lg font-bold text-[#ddd]">{tradesClosed}</div>
        </div>
        <div className="info-box text-center">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">profit</div>
          <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* ROI */}
      <div className="text-center py-2">
        <div className="text-[10px] tracking-widest text-dim uppercase mb-1">
          lifetime roi
        </div>
        <div
          className={`text-[28px] font-black leading-none glow-text ${
            lifetimeRoi >= 0 ? 'text-profit' : 'text-loss'
          }`}
        >
          {lifetimeRoi >= 0 ? '+' : ''}{lifetimeRoi.toFixed(1)}%
        </div>
        <div className="text-[10px] text-dim mt-1">
          {roiVerdict}
        </div>
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="info-box">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">win rate</div>
          <div className="text-lg font-bold text-profit">{winRate.toFixed(1)}%</div>
          <div className="text-[10px] text-profit mt-1 font-mono">{progressBar(winRate)}</div>
        </div>

        <div className="info-box">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">profit factor</div>
          <div className="text-lg font-bold text-[#ddd]">{profitFactor.toFixed(2)}x</div>
        </div>

        <div className="info-box">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">wins</div>
          <div className="text-lg font-bold text-profit">{totalWins}</div>
        </div>

        <div className="info-box">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">losses</div>
          <div className="text-lg font-bold text-loss">{totalLosses}</div>
        </div>
      </div>
    </div>
  );
}

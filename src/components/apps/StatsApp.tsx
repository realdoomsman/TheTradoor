'use client';

import { useMetrics } from '@/hooks/use-metrics';

function progressBar(percent: number, width: number = 10): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}

export function StatsApp() {
  const { data: metrics, isLoading } = useMetrics();

  const winRate = metrics?.winRate ?? 0;
  const profitFactor = metrics?.profitFactor ?? 0;
  const totalWins = metrics?.totalWins ?? 0;
  const totalLosses = metrics?.totalLosses ?? 0;
  const tradesClosed = metrics?.totalTradesClosed ?? 0;
  const lifetimeRoi = metrics?.lifetimeRoiPercent ?? 0;

  if (isLoading) {
    return (
      <div className="font-mono text-dim text-sm p-4">
        crunching numbers ser...
      </div>
    );
  }

  const roiVerdict = lifetimeRoi >= 100 ? 'absolutely based'
    : lifetimeRoi >= 50 ? 'pretty based'
    : lifetimeRoi >= 10 ? 'doing ok'
    : lifetimeRoi >= 0 ? 'surviving'
    : lifetimeRoi > -50 ? 'it could be worse'
    : 'oh no';

  return (
    <div className="font-mono space-y-4">
      {/* Big ROI */}
      <div className="text-center py-4">
        <div className="text-[10px] tracking-widest text-dim uppercase mb-2">
          lifetime roi
        </div>
        <div
          className={`text-[36px] font-black leading-none glow-text ${
            lifetimeRoi >= 0 ? 'text-profit' : 'text-loss'
          }`}
        >
          {lifetimeRoi >= 0 ? '+' : ''}{lifetimeRoi.toFixed(1)}%
        </div>
        <div className="text-[11px] text-dim mt-2">
          {roiVerdict}
        </div>
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* 2x3 Grid */}
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

        <div className="info-box">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">total closed</div>
          <div className="text-lg font-bold text-[#ddd]">{tradesClosed}</div>
        </div>

        <div className="info-box">
          <div className="text-[10px] text-dim uppercase tracking-wider mb-1">w/l ratio</div>
          <div className="text-lg font-bold text-[#ddd]">
            {totalLosses > 0 ? (totalWins / totalLosses).toFixed(1) : totalWins.toString()}
          </div>
        </div>
      </div>
    </div>
  );
}

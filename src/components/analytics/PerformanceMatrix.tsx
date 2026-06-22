'use client';

import { useMetrics } from '@/hooks/use-metrics';

function ProgressBar({ percent, width = 20 }: { percent: number; width?: number }) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return (
    <span className="font-mono">
      {'█'.repeat(filled)}
      <span className="text-dim">{'░'.repeat(empty)}</span>
    </span>
  );
}

export function PerformanceMatrix() {
  const { data: metrics } = useMetrics();

  const winRate = metrics?.winRate ?? 0;
  const profitFactor = metrics?.profitFactor ?? 0;
  const totalWins = metrics?.totalWins ?? 0;
  const totalLosses = metrics?.totalLosses ?? 0;
  const totalClosed = metrics?.totalTradesClosed ?? 0;

  const stats = [
    { label: 'WIN RATE', value: <><ProgressBar percent={winRate} /> <span className="ml-2">{winRate.toFixed(1)}%</span></> },
    { label: 'PROFIT FACTOR', value: profitFactor.toFixed(2) },
    { label: 'WINS', value: totalWins },
    { label: 'LOSSES', value: totalLosses },
    { label: 'TOTAL CLOSED', value: totalClosed },
  ];

  return (
    <div className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] tracking-widest text-dim">
          PERFORMANCE
        </span>
        <span className="flex-1 border-t border-[#222]" />
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-[10px] tracking-widest text-dim mb-1">
              {stat.label}
            </div>
            <div className="text-sm">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

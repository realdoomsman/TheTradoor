'use client';

import { useLiveTrades } from '@/hooks/use-live-trades';
import type { LiveTrade } from '@/types';

function formatMcap(value: number | null): string {
  if (value === null) return '--';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatRoi(roi: number): string {
  const sign = roi >= 0 ? '+' : '';
  return `${sign}${roi.toFixed(1)}%`;
}

function getRoiVibe(roi: number): string {
  if (roi >= 1000) return 'HIMOTHY';
  if (roi >= 100) return 'WAGMI';
  if (roi >= 10) return 'comfy';
  if (roi >= 0) return 'vibing';
  if (roi > -50) return 'ngmi';
  return 'rekt';
}

export function AITradingDesk() {
  const { data: trades, isLoading } = useLiveTrades();

  return (
    <div className="font-mono space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-[#00ff41] pulse-dot" />
          <span className="text-[#00ff41] text-xs font-bold status-online">
            AI BOT: SCANNING
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-[#00ff41] pulse-dot" />
          <span className="text-xs font-bold text-mid">
            OPERATORS: WATCHING
          </span>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* How it works - brief */}
      <div className="text-[10px] text-dim leading-relaxed">
        AI scans solana for alpha &rarr; generates trade signals &rarr; human operators review &rarr; approved trades execute via jupiter. rejected = blocked. no auto-yolo.
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* Active Positions */}
      <div>
        <div className="text-[10px] tracking-widest text-dim mb-3 uppercase">
          active positions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-dim text-left text-[10px] uppercase tracking-wider">
                <th className="pb-2 pr-3 font-normal">token</th>
                <th className="pb-2 pr-3 font-normal">mcap</th>
                <th className="pb-2 pr-3 font-normal">sol in</th>
                <th className="pb-2 pr-3 font-normal">roi</th>
                <th className="pb-2 font-normal">vibe</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-dim py-6 text-center">
                    loading ser...
                  </td>
                </tr>
              ) : !trades || trades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div className="text-dim text-xs mb-2">
                      no active positions rn
                    </div>
                    <div className="text-[10px] text-dim">
                      bot is scanning... patience ser
                    </div>
                  </td>
                </tr>
              ) : (
                trades.map((trade: LiveTrade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-[#2a2a2a] table-row-hover"
                  >
                    <td className="py-2.5 pr-3 font-bold text-[#ddd]">
                      ${trade.tokenSymbol}
                    </td>
                    <td className="py-2.5 pr-3 text-mid">
                      {formatMcap(trade.entryMarketCap)}
                    </td>
                    <td className="py-2.5 pr-3 text-mid">
                      {trade.entrySolAmount.toFixed(1)}
                    </td>
                    <td
                      className={`py-2.5 pr-3 font-bold ${
                        trade.currentRoi >= 0 ? 'text-profit' : 'text-loss'
                      }`}
                    >
                      {formatRoi(trade.currentRoi)}
                    </td>
                    <td className="py-2.5">
                      <span className={
                        trade.currentRoi >= 100
                          ? 'badge-legendary'
                          : trade.currentRoi >= 0
                          ? 'badge-profit'
                          : 'badge-loss'
                      }>
                        {getRoiVibe(trade.currentRoi)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

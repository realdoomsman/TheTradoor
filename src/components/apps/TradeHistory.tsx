'use client';

import { useState } from 'react';
import { useClosedTrades } from '@/hooks/use-closed-trades';
import type { ArchiveTag, ClosedTrade } from '@/types';

const PAGE_SIZE = 8;

function formatDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toFixed(2)}`;
}

const TAG_BADGE: Record<ArchiveTag, string> = {
  HIMOTHY: 'badge-legendary',
  PROFIT: 'badge-profit',
  REKT: 'badge-loss',
};

export function TradeHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useClosedTrades(page, PAGE_SIZE);

  const trades = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="font-mono">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-dim text-left border-b border-[#2a2a2a]">
              <th className="pb-2 pr-3 font-normal">DATE</th>
              <th className="pb-2 pr-3 font-normal">TOKEN</th>
              <th className="pb-2 pr-3 font-normal">IN</th>
              <th className="pb-2 pr-3 font-normal">OUT</th>
              <th className="pb-2 pr-3 font-normal">PNL</th>
              <th className="pb-2 pr-3 font-normal">ROI</th>
              <th className="pb-2 font-normal">TAG</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-dim py-4">
                  Loading trades...<span className="cursor-blink">█</span>
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-dim py-4">
                  No trades yet ser. patience.
                </td>
              </tr>
            ) : (
              trades.map((trade: ClosedTrade) => {
                const pnlPositive = trade.netPnlSol >= 0;
                const roiPositive = trade.roiPercent >= 0;
                const tagBadge = TAG_BADGE[trade.archiveTag];

                return (
                  <tr
                    key={trade.id}
                    className="border-b border-[#2a2a2a] hover:bg-[#1e3040] transition-colors"
                  >
                    <td className="py-2 pr-3 text-dim">
                      {formatDate(trade.exitTimestamp)}
                    </td>
                    <td className="py-2 pr-3 font-bold text-[#ddd]">
                      ${trade.tokenSymbol}
                    </td>
                    <td className="py-2 pr-3 text-mid">
                      {trade.entrySolAmount.toFixed(1)} SOL
                    </td>
                    <td className="py-2 pr-3 text-mid">
                      {trade.exitSolAmount.toFixed(1)} SOL
                    </td>
                    <td
                      className={`py-2 pr-3 font-bold ${
                        pnlPositive ? 'text-profit' : 'text-loss'
                      }`}
                    >
                      {formatPnl(trade.netPnlSol)} SOL
                    </td>
                    <td
                      className={`py-2 pr-3 font-bold ${
                        roiPositive ? 'text-profit' : 'text-loss'
                      }`}
                    >
                      {roiPositive ? '+' : ''}
                      {trade.roiPercent.toFixed(1)}%
                    </td>
                    <td className="py-2">
                      <span className={tagBadge}>
                        {trade.archiveTag}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-4 text-[11px]">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className={`bg-transparent border-none cursor-pointer font-mono ${
            page <= 1
              ? 'text-dim cursor-not-allowed'
              : 'text-accent hover:text-[#ddd]'
          }`}
        >
          &lt; PREV
        </button>
        <span className="text-dim">|</span>
        <span className="text-mid">
          PAGE {page}/{totalPages}
        </span>
        <span className="text-dim">|</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className={`bg-transparent border-none cursor-pointer font-mono ${
            page >= totalPages
              ? 'text-dim cursor-not-allowed'
              : 'text-accent hover:text-[#ddd]'
          }`}
        >
          NEXT &gt;
        </button>
      </div>
    </div>
  );
}

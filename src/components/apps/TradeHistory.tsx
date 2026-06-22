'use client';

import { useState } from 'react';
import { useClosedTrades } from '@/hooks/use-closed-trades';
import { useLiveTrades } from '@/hooks/use-live-trades';
import type { ArchiveTag, ClosedTrade, LiveTrade } from '@/types';

const PAGE_SIZE = 8;

function formatDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}.${day} ${h}:${min}`;
}

function formatPnl(pnl: number | null): string {
  if (pnl === null) return '—';
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toFixed(2)}`;
}

const TAG_BADGE: Record<ArchiveTag, string> = {
  HIMOTHY: 'badge-legendary',
  PROFIT: 'badge-profit',
  REKT: 'badge-loss',
};

type Tab = 'ALL' | 'OPEN' | 'CLOSED';

export function TradeHistory() {
  const [tab, setTab] = useState<Tab>('ALL');
  const [page, setPage] = useState(1);
  const { data: closedData, isLoading: closedLoading } = useClosedTrades(page, PAGE_SIZE);
  const { data: liveTrades, isLoading: liveLoading } = useLiveTrades();

  const closedTrades = closedData?.data ?? [];
  const totalPages = closedData?.totalPages ?? 0;
  const openTrades = liveTrades ?? [];
  const isLoading = closedLoading || liveLoading;

  return (
    <div className="font-mono">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(['ALL', 'OPEN', 'CLOSED'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`bg-transparent border border-[#2a2a2a] px-3 py-1 text-[10px] font-mono cursor-pointer transition-colors ${
              tab === t
                ? 'text-[#00ff41] border-[#00ff41] bg-[#00ff4110]'
                : 'text-dim hover:text-mid hover:border-[#444]'
            }`}
          >
            {t} {t === 'OPEN' ? `(${openTrades.length})` : t === 'CLOSED' ? `(${closedData?.totalCount ?? 0})` : `(${openTrades.length + (closedData?.totalCount ?? 0)})`}
          </button>
        ))}
      </div>

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
              <th className="pb-2 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-dim py-4">
                  syncing...<span className="cursor-blink">█</span>
                </td>
              </tr>
            ) : (
              <>
                {/* Open trades */}
                {(tab === 'ALL' || tab === 'OPEN') && openTrades.map((trade: LiveTrade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-[#2a2a2a] hover:bg-[#1e3040] transition-colors"
                  >
                    <td className="py-2 pr-3 text-dim">
                      {formatDate(trade.entryTimestamp)}
                    </td>
                    <td className="py-2 pr-3 font-bold text-[#ddd]">
                      ${trade.tokenSymbol}
                    </td>
                    <td className="py-2 pr-3 text-mid">
                      {trade.entrySolAmount.toFixed(2)} SOL
                    </td>
                    <td className="py-2 pr-3 text-dim">
                      —
                    </td>
                    <td className="py-2 pr-3 text-dim">
                      —
                    </td>
                    <td className={`py-2 pr-3 font-bold ${(trade.currentRoi ?? 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {trade.currentRoi !== null && trade.currentRoi !== undefined
                        ? `${trade.currentRoi >= 0 ? '+' : ''}${trade.currentRoi.toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="py-2">
                      <span className="text-[10px] px-1.5 py-0.5 border border-[#00ff41] text-[#00ff41] bg-[#00ff4110]">
                        LIVE
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Closed trades */}
                {(tab === 'ALL' || tab === 'CLOSED') && closedTrades.map((trade: ClosedTrade) => {
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
                        {trade.entrySolAmount.toFixed(2)} SOL
                      </td>
                      <td className="py-2 pr-3 text-mid">
                        {trade.exitSolAmount.toFixed(2)} SOL
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
                })}

                {/* Empty state */}
                {((tab === 'ALL' && openTrades.length === 0 && closedTrades.length === 0) ||
                  (tab === 'OPEN' && openTrades.length === 0) ||
                  (tab === 'CLOSED' && closedTrades.length === 0)) && (
                  <tr>
                    <td colSpan={7} className="text-dim py-4">
                      {tab === 'OPEN' ? 'no open positions.' : tab === 'CLOSED' ? 'no closed trades yet.' : 'no trades yet. awaiting first signal.'}
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (only for closed trades) */}
      {tab !== 'OPEN' && totalPages > 0 && (
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
      )}
    </div>
  );
}

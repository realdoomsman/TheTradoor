'use client';

import { useState } from 'react';
import { useClosedTrades } from '@/hooks/use-closed-trades';
import type { ArchiveTag } from '@/types';

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

function formatSol(n: number): string {
  return n.toFixed(2);
}

function ArchiveTagBadge({ tag, roiPercent }: { tag: ArchiveTag; roiPercent: number }) {
  if (roiPercent >= 1000) {
    return <span className="tag-himothy">HIMOTHY</span>;
  }
  if (tag === 'PROFIT') {
    return <span className="tag-profit">PROFIT</span>;
  }
  return <span className="tag-rekt">REKT</span>;
}

export function HistoricalLedger() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data } = useClosedTrades(page, limit);

  const trades = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] tracking-widest text-dim">
          HISTORICAL LEDGER
        </span>
        <span className="flex-1 border-t border-[#222]" />
        <span className="text-[10px] text-dim">
          {page}/{totalPages}
        </span>
      </div>

      {trades.length === 0 ? (
        <div className="text-sm text-dim py-8 text-center">
          NO CLOSED TRADES IN LEDGER
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="terminal-table w-full text-xs">
            <thead>
              <tr className="text-[10px] tracking-widest text-dim">
                <th className="text-left py-2 pr-4 border-b border-[#222] font-normal">DATE</th>
                <th className="text-left py-2 pr-4 border-b border-[#222] font-normal">TOKEN</th>
                <th className="text-right py-2 pr-4 border-b border-[#222] font-normal">IN</th>
                <th className="text-right py-2 pr-4 border-b border-[#222] font-normal">OUT</th>
                <th className="text-right py-2 pr-4 border-b border-[#222] font-normal">PNL</th>
                <th className="text-right py-2 border-b border-[#222] font-normal">TAG</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="py-2 pr-4 border-b border-[#111] whitespace-nowrap text-dim">
                    {formatDate(trade.exitTimestamp)}
                  </td>
                  <td className="py-2 pr-4 border-b border-[#111] whitespace-nowrap font-bold">
                    ${trade.tokenSymbol}
                  </td>
                  <td className="py-2 pr-4 border-b border-[#111] whitespace-nowrap text-right text-dim">
                    {formatSol(trade.entrySolAmount)}
                  </td>
                  <td className="py-2 pr-4 border-b border-[#111] whitespace-nowrap text-right">
                    {formatSol(trade.exitSolAmount)}
                  </td>
                  <td className="py-2 pr-4 border-b border-[#111] whitespace-nowrap text-right font-bold">
                    {trade.netPnlSol >= 0 ? '+' : ''}
                    {formatSol(trade.netPnlSol)}
                  </td>
                  <td className="py-2 border-b border-[#111] whitespace-nowrap text-right">
                    <ArchiveTagBadge tag={trade.archiveTag} roiPercent={trade.roiPercent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-[10px] tracking-widest">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="text-white disabled:text-[#333] transition-colors font-mono"
        >
          ← PREV
        </button>
        <span className="text-dim">
          PAGE {page} OF {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="text-white disabled:text-[#333] transition-colors font-mono"
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}

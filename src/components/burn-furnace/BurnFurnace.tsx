'use client';

import { useState } from 'react';
import { useBurns } from '@/hooks/use-burns';

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function BurnFurnace() {
  const [limit, setLimit] = useState(10);
  const { data } = useBurns(1, limit);

  const burns = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const hasMore = burns.length < totalCount;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] tracking-widest text-dim">
          BURN PROTOCOL OUTPUT
        </span>
        <span className="flex-1 border-t border-[#222]" />
        <span className="text-[10px] text-dim">
          {totalCount} EVENTS
        </span>
      </div>

      {burns.length === 0 ? (
        <div className="text-sm text-dim py-8 text-center">
          NO BURN RECORDS — FURNACE IDLE
        </div>
      ) : (
        <div className="space-y-0">
          {burns.map((burn, i) => (
            <div
              key={burn.id}
              className={`flex items-start gap-4 py-2.5 text-xs ${i < burns.length - 1 ? 'border-b border-[#111]' : ''}`}
            >
              <span className="text-dim whitespace-nowrap shrink-0">
                {formatDate(burn.timestamp)}
              </span>
              <span className="shrink-0">
                BLAST PROTOCOL
              </span>
              <span className="font-bold whitespace-nowrap">
                {formatAmount(burn.tradoorAmount)} $TRADOOR
              </span>
              <span className="text-dim hidden sm:inline">
                IMMOLATED
              </span>
              <span className="ml-auto shrink-0">
                <a
                  href={burn.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim hover:text-white transition-colors"
                >
                  VIEW TX →
                </a>
              </span>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setLimit((l) => l + 10)}
          className="mt-4 text-[10px] tracking-widest text-dim hover:text-white transition-colors font-mono"
        >
          LOAD MORE ↓
        </button>
      )}
    </div>
  );
}

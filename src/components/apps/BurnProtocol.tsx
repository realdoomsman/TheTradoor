'use client';

import { useState } from 'react';
import { useBurns } from '@/hooks/use-burns';
import { useMetrics } from '@/hooks/use-metrics';
import type { BurnRecord } from '@/types';

function formatTimestamp(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${mo}.${day} ${h}:${min}`;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

function asciiProgressBar(percent: number, width: number = 20): string {
  const clamped = Math.min(100, Math.max(0, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

export function BurnProtocol() {
  const [limit, setLimit] = useState(8);
  const { data: burnData, isLoading: burnsLoading } = useBurns(1, limit);
  const { data: metrics, isLoading: metricsLoading } = useMetrics();

  const burns = burnData?.data ?? [];
  const totalCount = burnData?.totalCount ?? 0;
  const hasMore = burns.length < totalCount;

  const totalBurned = metrics?.totalTradoorBurned ?? 0;
  const burnPercent = metrics?.burnSupplyPercent ?? 0;

  return (
    <div className="font-mono space-y-4">
      {/* Big burn number */}
      <div className="text-center py-4">
        <div className="text-[10px] tracking-widest text-dim uppercase mb-2">
          total $tradoor burned forever
        </div>
        {metricsLoading ? (
          <div className="text-dim text-sm">counting ashes...</div>
        ) : (
          <>
            <div className="text-[32px] font-black text-loss leading-none glow-text">
              {formatAmount(totalBurned)}
            </div>
            <div className="text-[11px] text-mid mt-2">
              {burnPercent.toFixed(1)}% of supply
            </div>
            <div className="text-[10px] text-profit mt-2 font-mono">
              {asciiProgressBar(burnPercent)}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* Burn Log */}
      <div>
        <div className="text-dim text-[10px] uppercase tracking-wider mb-2">
          Burn Log
        </div>

        {burnsLoading ? (
          <div className="text-dim text-[11px] py-3">
            Loading burn records...<span className="cursor-blink">█</span>
          </div>
        ) : burns.length === 0 ? (
          <div className="text-dim text-[11px] py-3">
            No burn records found.
          </div>
        ) : (
          <div className="space-y-0">
            {burns.map((burn: BurnRecord) => (
              <div
                key={burn.id}
                className="flex items-center gap-4 text-[11px] py-2 border-b border-[#2a2a2a]"
              >
                <span className="text-dim flex-shrink-0 w-[120px]">
                  {formatTimestamp(burn.timestamp)}
                </span>
                <span className="text-[#ddd] font-bold flex-shrink-0">
                  {formatAmount(burn.tradoorAmount)}{' '}
                  <span className="text-accent font-normal">$TRADOOR</span>
                </span>
                <span className="text-mid flex-shrink-0">
                  {burn.solValueAtBurn.toFixed(2)} SOL
                </span>
                <a
                  href={burn.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline ml-auto flex-shrink-0"
                >
                  View TX →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={() => setLimit((prev) => prev + 8)}
            className="w-full mt-3 py-2 text-[11px] text-accent border border-[#2a2a2a] bg-[#16202d] hover:bg-[#1e3040] hover:border-[#2a2a2a] cursor-pointer font-mono transition-colors"
          >
            LOAD MORE
          </button>
        )}
      </div>
    </div>
  );
}

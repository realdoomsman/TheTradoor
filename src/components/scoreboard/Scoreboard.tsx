'use client';

import { useMetrics } from '@/hooks/use-metrics';
import { useWallet } from '@/hooks/use-wallet';

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProgressBar({ percent }: { percent: number }) {
  const total = 20;
  const filled = Math.round((percent / 100) * total);
  const empty = total - filled;
  return (
    <span>
      {'█'.repeat(filled)}
      <span className="text-dim">{'░'.repeat(empty)}</span>
      {'  '}{fmt(percent, 1)}%
    </span>
  );
}

export function Scoreboard() {
  const { data: metrics } = useMetrics();
  const { data: wallet } = useWallet();

  const sol = metrics?.totalWalletValueSol ?? wallet?.balanceSol ?? 0;
  const usd = metrics?.totalWalletValueUsd ?? wallet?.balanceUsd ?? 0;
  const roi = metrics?.lifetimeRoiPercent ?? 0;
  const totalProfit = metrics?.totalSolProfitGenerated ?? 0;
  const profitFactor = metrics?.profitFactor ?? 0;
  const totalBurned = metrics?.totalTradoorBurned ?? 0;
  const burnPercent = metrics?.burnSupplyPercent ?? 0;
  const taxRate = metrics?.taxInflowRateSolHr ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#222]">
      {/* ── WALLET VALUE ── */}
      <div className="bg-black p-6">
        <div className="text-[10px] tracking-widest text-dim mb-4">
          TOTAL WALLET VALUE
        </div>
        <div className="text-3xl font-bold tracking-tight mb-1">
          {fmt(sol)}
          <span className="text-base ml-2 text-mid">SOL</span>
        </div>
        <div className="text-sm text-dim mb-6">
          ${fmtUsd(usd)}
        </div>
        <div className="text-[10px] tracking-widest text-dim flex items-center gap-2">
          TAX INFLOW
          <span className="text-white">{fmt(taxRate, 1)} SOL/HR</span>
          <span className="inline-block w-1 h-1 bg-white pulse-soft" />
        </div>
      </div>

      {/* ── LIFETIME PNL ── */}
      <div className="bg-black p-6">
        <div className="text-[10px] tracking-widest text-dim mb-4">
          LIFETIME TRADING PNL
        </div>
        <div className="text-3xl font-bold tracking-tight mb-1">
          {roi >= 0 ? '+' : ''}{fmt(roi, 1)}%
          <span className="text-base ml-2">{roi >= 0 ? '↑' : '↓'}</span>
        </div>
        <div className="mt-6 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-dim">TOTAL SOL PROFIT</span>
            <span>{fmt(totalProfit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim">PROFIT FACTOR</span>
            <span>{fmt(profitFactor)}</span>
          </div>
        </div>
      </div>

      {/* ── BURN MATRIX ── */}
      <div className="bg-black p-6">
        <div className="text-[10px] tracking-widest text-dim mb-4">
          BLAST PROTOCOL — BURN MATRIX
        </div>
        <div className="text-3xl font-bold tracking-tight mb-1">
          {fmt(totalBurned, 0)}
          <span className="text-base ml-2 text-mid">$TRADOOR</span>
        </div>
        <div className="text-[10px] text-dim mb-6">
          PERMANENTLY DEFUSED
        </div>
        <div className="text-xs font-mono">
          <ProgressBar percent={burnPercent} />
        </div>
        <div className="text-[10px] text-dim mt-1">
          OF CIRCULATING SUPPLY
        </div>
      </div>
    </div>
  );
}

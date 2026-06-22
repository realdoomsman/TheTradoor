'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useMetrics } from '@/hooks/use-metrics';

const MASTER_PUBKEY = process.env.NEXT_PUBLIC_MASTER_WALLET ?? '';

function truncateAddress(addr: string): string {
  if (!addr) return 'NOT SET';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function MasterWallet() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: metrics, isLoading: metricsLoading } = useMetrics();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!MASTER_PUBKEY) return;
    navigator.clipboard.writeText(MASTER_PUBKEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const solBalance = wallet?.balanceSol ?? 0;
  const usdBalance = wallet?.balanceUsd ?? 0;
  const taxRate = metrics?.taxInflowRateSolHr ?? 0;

  return (
    <div className="font-mono space-y-4">
      {/* Address */}
      <div>
        <div className="text-[10px] tracking-widest text-dim uppercase mb-2">
          public wallet
        </div>
        <div className="info-box flex items-center justify-between">
          <span className="text-accent text-sm font-bold font-mono">
            {truncateAddress(MASTER_PUBKEY)}
          </span>
          <div className="flex items-center gap-2">
            {MASTER_PUBKEY && (
              <>
                <button
                  onClick={handleCopy}
                  className="text-[10px] text-dim hover:text-[#00ff41] transition-colors cursor-pointer bg-transparent border-none font-mono"
                >
                  {copied ? 'copied' : 'copy'}
                </button>
                <a
                  href={`https://solscan.io/account/${MASTER_PUBKEY}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-dim hover:text-accent transition-colors"
                >
                  solscan
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Big Balance */}
      <div className="text-center py-4">
        <div className="text-[10px] tracking-widest text-dim uppercase mb-2">
          the bag
        </div>
        {walletLoading ? (
          <div className="text-dim text-sm">checking...</div>
        ) : (
          <>
            <div className="text-[40px] font-black text-[#ddd] leading-none">
              {solBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-dim mt-1">SOL</div>
            <div className="text-mid text-xs mt-2">
              ${usdBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} usd
            </div>
          </>
        )}
      </div>

      <div className="border-t border-[#2a2a2a]" />

      {/* Tax Inflow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#00ff41] pulse-dot" />
          <span className="text-[11px] text-mid">
            tax inflow rate
          </span>
        </div>
        <span className="text-[11px] text-profit font-bold">
          {metricsLoading ? '--' : `${taxRate.toFixed(1)} SOL/hr`}
        </span>
      </div>

      <div className="text-[10px] text-dim leading-relaxed">
        this wallet is 100% public. every tx is on-chain and verifiable. no funny business ser.
      </div>
    </div>
  );
}

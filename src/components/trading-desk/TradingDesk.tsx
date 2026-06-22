'use client';

import { useLiveTrades } from '@/hooks/use-live-trades';

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}.${dd} ${hh}:${min}`;
}

function formatMarketCap(mcap: number | null): string {
  if (mcap === null) return '—';
  if (mcap >= 1_000_000) return `$${(mcap / 1_000_000).toFixed(1)}M`;
  if (mcap >= 1_000) return `$${(mcap / 1_000).toFixed(0)}K`;
  return `$${mcap.toFixed(0)}`;
}

function truncate(str: string | null, max: number): string {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function TradingDesk() {
  const { data: trades } = useLiveTrades();

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] tracking-widest text-dim">
          LIVE TRADE LOG
        </span>
        <span className="flex-1 border-t border-[#222]" />
        <span className="text-[10px] tracking-widest text-dim flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-white pulse-soft" />
          POLLING
        </span>
      </div>

      {!trades || trades.length === 0 ? (
        <div className="border border-[#222] p-8 text-center">
          <div className="text-sm text-dim">
            NO ACTIVE POSITIONS
          </div>
          <div className="text-[10px] text-dim mt-1 tracking-widest">
            DESK AWAITING ALPHA SIGNAL
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="terminal-table w-full text-xs">
            <thead>
              <tr className="text-[10px] tracking-widest text-dim">
                <th className="text-left py-2 pr-4 border-b border-[#222] font-normal">TIME</th>
                <th className="text-left py-2 pr-4 border-b border-[#222] font-normal">TICKER</th>
                <th className="text-left py-2 pr-4 border-b border-[#222] font-normal">SIDE</th>
                <th className="text-right py-2 pr-4 border-b border-[#222] font-normal">ENTRY MCAP</th>
                <th className="text-right py-2 pr-4 border-b border-[#222] font-normal">ROI</th>
                <th className="text-left py-2 pr-4 border-b border-[#222] font-normal hidden md:table-cell">MEMO</th>
                <th className="text-right py-2 border-b border-[#222] font-normal">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="py-2.5 pr-4 border-b border-[#111] whitespace-nowrap text-dim">
                    {formatTimestamp(trade.entryTimestamp)}
                  </td>
                  <td className="py-2.5 pr-4 border-b border-[#111] whitespace-nowrap font-bold">
                    ${trade.tokenSymbol}
                  </td>
                  <td className="py-2.5 pr-4 border-b border-[#111]">
                    BUY
                  </td>
                  <td className="py-2.5 pr-4 border-b border-[#111] whitespace-nowrap text-right text-dim">
                    {formatMarketCap(trade.entryMarketCap)}
                  </td>
                  <td className="py-2.5 pr-4 border-b border-[#111] whitespace-nowrap text-right font-bold">
                    {trade.currentRoi >= 0 ? '+' : ''}
                    {trade.currentRoi.toFixed(1)}%
                    <span className="ml-1 text-dim">{trade.currentRoi >= 0 ? '↑' : '↓'}</span>
                  </td>
                  <td className="py-2.5 pr-4 border-b border-[#111] text-dim hidden md:table-cell">
                    {truncate(trade.traderMemo, 28)}
                  </td>
                  <td className="py-2.5 border-b border-[#111] text-right">
                    <span className="cursor-blink text-[10px] tracking-widest">LIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

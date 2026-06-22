'use client';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black font-mono text-white">
      {/* Top line — thin status bar */}
      <div className="flex items-center justify-between px-6 py-2 text-[10px] tracking-widest text-dim border-b border-[#222]">
        <span>SOLANA MAINNET</span>
        <span>v1.00</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-white pulse-soft" />
            ONLINE
          </span>
          <span>|</span>
          <span>DESK ACTIVE</span>
        </span>
      </div>
      {/* Main header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white">
        <div className="flex items-center gap-2">
          <span className="text-dim text-xs">user@operator:~$</span>
          <span className="text-sm tracking-wide">
            THETRADOOR.FUN
          </span>
          <span className="text-dim text-xs hidden sm:inline">
            // MASTER_WALLET_INTERFACE
          </span>
        </div>
        <span className="cursor-blink text-dim">█</span>
      </div>
    </header>
  );
}

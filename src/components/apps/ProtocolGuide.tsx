'use client';

export function ProtocolGuide() {
  return (
    <div className="space-y-6 text-sm font-mono">
      {/* ── READ FIRST alert ── */}
      <div className="info-box info-box-warn">
        <div className="flex items-center gap-2 text-xs font-bold text-gold">
          <span>[!]</span>
          <span>READ FIRST</span>
        </div>
        <p className="mt-1 text-xs text-[#aa8833]">
          Everything you need to know about TheTradoor.fun — the AI
          memecoin trader that pumps your bag.
        </p>
      </div>

      {/* ═══════════════════════════════════════════
          Section 1 — What is TheTradoor.fun?
          ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] tracking-widest text-dim">
            01
          </span>
          <h3 className="text-xs font-bold tracking-wide text-accent">
            WHAT IS THETRADOOR.FUN?
          </h3>
          <span className="flex-1 border-t border-[#2a2a2a]" />
        </div>

        <div className="space-y-2 pl-6">
          <p className="terminal-line">
            TheTradoor.fun lets you invest in an AI-powered memecoin
            trader by holding one token on Solana.
          </p>
          <p className="terminal-line">
            Buy <span className="text-accent font-bold">$TRADOOR</span> and
            transaction tax from volume flows into a public{' '}
            <span className="text-accent">Master Wallet</span>.
          </p>
          <p className="terminal-line">
            A hybrid{' '}
            <span className="text-accent">AI + Human</span> operator desk
            trades memecoins with that capital. When trades win, profits go
            straight to{' '}
            <span className="font-bold text-profit">market-buying $TRADOOR</span>.
          </p>
          <p className="terminal-line">
            Every winning trade creates buy pressure on your bag.
            You hold one coin. The AI does the rest.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          Section 2 — The AI Trading Engine
          ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] tracking-widest text-dim">
            02
          </span>
          <h3 className="text-xs font-bold tracking-wide text-accent">
            THE AI TRADING ENGINE
          </h3>
          <span className="flex-1 border-t border-[#2a2a2a]" />
        </div>

        <div className="space-y-2 pl-6">
          <p className="terminal-line">
            TheTradoor deploys a proprietary AI bot called{' '}
            <span className="text-accent font-bold">TRADOOR-AI</span> that
            continuously scans the Solana ecosystem.
          </p>

          <div className="info-box mt-3 mb-3">
            <div className="text-[10px] tracking-widest text-dim mb-2">
              AI MONITORS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              <div className="text-mid">
                <span className="text-accent mr-1">■</span> Whale wallet
                movements
              </div>
              <div className="text-mid">
                <span className="text-accent mr-1">■</span> Social sentiment
                (Twitter / Telegram)
              </div>
              <div className="text-mid">
                <span className="text-accent mr-1">■</span> Liquidity events
                (new pools, LP burns)
              </div>
              <div className="text-mid">
                <span className="text-accent mr-1">■</span> Volume anomalies
              </div>
              <div className="text-mid">
                <span className="text-accent mr-1">■</span> Smart money flow
                patterns
              </div>
            </div>
          </div>

          <p className="terminal-line">
            When the AI identifies a high-conviction entry, it generates a{' '}
            <span className="text-accent font-bold">Trade Signal</span> with:
          </p>

          <div className="flex flex-wrap gap-2 mt-1 mb-1 pl-3">
            <span className="label-tag text-accent border-[#4a9aff]">
              TARGET TOKEN
            </span>
            <span className="label-tag text-accent border-[#4a9aff]">
              ENTRY MCAP
            </span>
            <span className="label-tag text-accent border-[#4a9aff]">
              CONFIDENCE 0-100
            </span>
            <span className="label-tag text-accent border-[#4a9aff]">
              RISK ASSESSMENT
            </span>
          </div>

          <p className="terminal-line">
            Trade signals are{' '}
            <span className="text-loss font-bold">NOT auto-executed</span>.
            They are pushed to the Human Operator Desk for review.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          Section 3 — The Human Operator Desk
          ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] tracking-widest text-dim">
            03
          </span>
          <h3 className="text-xs font-bold tracking-wide text-accent">
            THE HUMAN OPERATOR DESK
          </h3>
          <span className="flex-1 border-t border-[#2a2a2a]" />
        </div>

        <div className="space-y-2 pl-6">
          <p className="terminal-line">
            A team of experienced Solana traders reviews every AI-generated
            signal.
          </p>

          <div className="info-box mt-3 mb-3">
            <div className="text-[10px] tracking-widest text-dim mb-2">
              OPERATOR VALIDATION CHECKLIST
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-mid">
                <span className="text-profit mr-2">[x]</span> Is the contract
                safe?
              </div>
              <div className="text-mid">
                <span className="text-profit mr-2">[x]</span> Is the dev wallet
                locked?
              </div>
              <div className="text-mid">
                <span className="text-profit mr-2">[x]</span> Is there real
                community traction?
              </div>
            </div>
          </div>

          <p className="terminal-line">
            Only signals approved by the desk are executed via{' '}
            <span className="text-accent font-bold">Jupiter aggregator</span>.
          </p>
          <p className="terminal-line">
            This hybrid approach combines AI speed with human judgment —
            catching what pure automation misses{' '}
            <span className="text-dim">
              (rugs, honeypots, fake volume)
            </span>
            .
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          Section 4 — The Buyback Loop
          ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] tracking-widest text-dim">
            04
          </span>
          <h3 className="text-xs font-bold tracking-wide text-accent">
            THE BUYBACK LOOP
          </h3>
          <span className="flex-1 border-t border-[#2a2a2a]" />
        </div>

        <div className="pl-6">
          <div className="info-box info-box-highlight space-y-2 text-xs">
            <div className="flex items-start gap-3">
              <span className="text-accent font-bold shrink-0">STEP 1</span>
              <span className="text-mid">
                Tax fees from $TRADOOR volume →{' '}
                <span className="text-accent">Master Wallet</span>
              </span>
            </div>
            <div className="border-t border-[#2a2a2a]" />

            <div className="flex items-start gap-3">
              <span className="text-accent font-bold shrink-0">STEP 2</span>
              <span className="text-mid">
                AI scans + Human operators approve trades
              </span>
            </div>
            <div className="border-t border-[#2a2a2a]" />

            <div className="flex items-start gap-3">
              <span className="text-accent font-bold shrink-0">STEP 3</span>
              <span className="text-mid">
                Profits from winning trades →{' '}
                <span className="text-profit font-bold">
                  market-buy $TRADOOR
                </span>
              </span>
            </div>
            <div className="border-t border-[#2a2a2a]" />

            <div className="flex items-start gap-3">
              <span className="text-accent font-bold shrink-0">STEP 4</span>
              <span className="text-mid">
                Buybacks create constant{' '}
                <span className="text-profit font-bold">buy pressure</span>{' '}
                on $TRADOOR — pumping your bag
              </span>
            </div>
            <div className="border-t border-[#2a2a2a]" />

            <div className="flex items-start gap-3">
              <span className="text-accent font-bold shrink-0">STEP 5</span>
              <span className="text-mid">
                More volume → more tax → more trades → more buybacks
                → <span className="text-accent font-bold">repeat</span>
              </span>
            </div>
          </div>

          {/* ASCII flywheel diagram */}
          <pre className="text-[10px] leading-relaxed text-dim mt-4 overflow-x-auto">
{`    ╔═══════════════════════════════════════════╗
    ║        THE TRADOOR BUYBACK LOOP           ║
    ╠═══════════════════════════════════════════╣
    ║                                           ║
    ║   $TRADOOR Volume                         ║
    ║        │                                  ║
    ║        ▼                                  ║
    ║   [ Tax Fees ] ──► Master Wallet          ║
    ║                        │                  ║
    ║                        ▼                  ║
    ║               [ AI + Human Desk ]         ║
    ║                        │                  ║
    ║                        ▼                  ║
    ║               [ Trade Profits ]           ║
    ║                        │                  ║
    ║                        ▼                  ║
    ║            Market-Buy $TRADOOR            ║
    ║                        │                  ║
    ║                        ▼                  ║
    ║          [ Your Bag Gets Pumped ]          ║
    ║                        │                  ║
    ║                        ▼                  ║
    ║              More Volume + Tax            ║
    ║                        │                  ║
    ║                        └──► More Trades   ║
    ║                                ↻          ║
    ╚═══════════════════════════════════════════╝`}
          </pre>
        </div>
      </div>

      {/* ── Bottom Core Rule callout ── */}
      <div className="info-box">
        <div className="flex items-center gap-2 text-xs font-bold text-accent mb-1">
          <span>[*]</span>
          <span>CORE RULE</span>
        </div>
        <p className="text-xs text-mid">
          The Master Wallet is{' '}
          <span className="text-accent font-bold">100% public</span>. Every
          trade, every burn, every inflow — fully transparent and verifiable
          on-chain.
        </p>
      </div>
    </div>
  );
}

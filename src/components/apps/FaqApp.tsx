'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'what is $TRADOOR?',
    a: 'a token on solana that lets you invest in an AI memecoin trader by holding one coin. tax from volume funds a public trading wallet. AI + human operators trade memecoins with it. profits buy back $TRADOOR and pump your bag.',
  },
  {
    q: 'how does the AI work?',
    a: 'TRADOOR-AI scans solana 24/7 monitoring whale wallets, social sentiment, volume anomalies, liquidity events, and smart money flow. when it finds a high-conviction setup it generates a signal with a confidence score 0-100. signals go to human operators who approve or reject. no auto-trading.',
  },
  {
    q: 'why do humans review trades?',
    a: 'because AI can\'t catch everything. rugs, honeypots, fake volume, unlocked dev wallets — human traders verify contract safety before any capital is deployed. AI speed + human judgment = your bag is protected.',
  },
  {
    q: 'where does the trading capital come from?',
    a: 'transaction tax on every $TRADOOR buy/sell. the tax flows directly into the master wallet on-chain. no middleman. fully verifiable.',
  },
  {
    q: 'what happens when trades are profitable?',
    a: 'profits are used to market-buy $TRADOOR on the open market. this creates constant buy pressure on the token. more wins = more buybacks = your bag pumps.',
  },
  {
    q: 'is the wallet public?',
    a: 'yes. 100% public from day one. every tx, every trade, every buyback — all verifiable on solscan. the live dashboard tracks everything in real time.',
  },
  {
    q: 'what if the AI loses a trade?',
    a: 'losses happen. that\'s trading. but the AI + human review process is designed to filter out high-risk plays. the win rate and pnl are tracked live on the dashboard. full transparency — you see the losses too.',
  },
  {
    q: 'what is the CA?',
    a: 'H6qoigb4sdnYvpMUbDyWZah8APB2firuyQNfNjgKpump — verify on solscan.io',
  },
  {
    q: 'is this a rug?',
    a: 'the wallet is public. the trades are on-chain. the dashboard is live. if we stopped trading or lost everything you\'d see it instantly. that\'s the whole point of transparency.',
  },
  {
    q: 'how is this different from other treasury tokens?',
    a: 'most treasury tokens go dark after 2 weeks. our wallet is public, our dashboard is live, and every trade is on-chain. you don\'t have to trust us — you can verify everything yourself.',
  },
];

const LINKS = [
  { label: 'GitHub', url: 'https://github.com/realdoomsman/TheTradoor', icon: 'git' },
  { label: 'X / Twitter', url: 'https://x.com/thetradoorfun', icon: '@' },
  { label: 'Solscan (wallet)', url: 'https://solscan.io/account/HCipnpNx12fNQGB8A12Xp7m4eX2yTYziXf7UATgWbKgX', icon: '>' },
  { label: 'Dashboard', url: 'https://thetradoor.vercel.app', icon: '#' },
];

export function FaqApp() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="font-mono space-y-5">
      {/* Links section */}
      <div>
        <div className="text-[10px] tracking-widest text-dim uppercase mb-3">
          links
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="stat-card flex items-center gap-3 no-underline hover:border-[#00ff41] transition-colors"
            >
              <span className="text-[11px] font-bold text-profit w-5 text-center">
                {link.icon}
              </span>
              <span className="text-[11px] text-mid hover:text-[#ddd] transition-colors">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-[#252525]" />

      {/* FAQ section */}
      <div>
        <div className="text-[10px] tracking-widest text-dim uppercase mb-3">
          faq
        </div>
        <div className="space-y-1">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-[#1e1e1e]">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 bg-transparent border-none cursor-pointer font-mono hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="text-[11px] text-[#bbb]">{faq.q}</span>
                <span className="text-[10px] text-dim shrink-0">
                  {openIdx === i ? '[-]' : '[+]'}
                </span>
              </button>
              {openIdx === i && (
                <div className="px-3 pb-3 pt-0">
                  <div className="border-t border-[#1e1e1e] pt-2">
                    <p className="text-[11px] text-mid leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

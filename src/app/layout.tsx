import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
});

export const metadata: Metadata = {
  title: 'TheTradoor.fun | AI Memecoin Trader',
  description:
    'One token. One AI trader. Buy $TRADOOR and let the AI trade memecoins for you. Profits buy back $TRADOOR and pump your bag. Public wallet. Full transparency.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={firaCode.variable}>
      <body className="font-mono">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

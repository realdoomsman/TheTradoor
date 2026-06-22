'use client';

import { useQuery } from '@tanstack/react-query';
import type { WalletInfo } from '@/types';

async function fetchWallet(): Promise<WalletInfo> {
  const res = await fetch('/api/wallet');
  if (!res.ok) throw new Error('Failed to fetch wallet');
  return res.json();
}

export function useWallet() {
  return useQuery<WalletInfo>({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
    refetchInterval: 15_000,
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import type { LiveTrade } from '@/types';

async function fetchLiveTrades(): Promise<LiveTrade[]> {
  const res = await fetch('/api/trades/live');
  if (!res.ok) throw new Error('Failed to fetch live trades');
  return res.json();
}

export function useLiveTrades() {
  return useQuery<LiveTrade[]>({
    queryKey: ['trades', 'live'],
    queryFn: fetchLiveTrades,
    refetchInterval: 5_000,
  });
}

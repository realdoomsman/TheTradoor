'use client';

import { useQuery } from '@tanstack/react-query';
import type { GlobalMetrics } from '@/types';

async function fetchMetrics(): Promise<GlobalMetrics> {
  const res = await fetch('/api/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export function useMetrics() {
  return useQuery<GlobalMetrics>({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 10_000,
  });
}

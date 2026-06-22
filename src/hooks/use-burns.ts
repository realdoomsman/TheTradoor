'use client';

import { useQuery } from '@tanstack/react-query';
import type { BurnRecord, PaginatedResponse } from '@/types';

async function fetchBurns(
  page: number,
  limit: number
): Promise<PaginatedResponse<BurnRecord>> {
  const res = await fetch(`/api/burns?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch burns');
  return res.json();
}

export function useBurns(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<BurnRecord>>({
    queryKey: ['burns', page, limit],
    queryFn: () => fetchBurns(page, limit),
  });
}

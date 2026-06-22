'use client';

import { useQuery } from '@tanstack/react-query';
import type { ClosedTrade, PaginatedResponse } from '@/types';

async function fetchClosedTrades(
  page: number,
  limit: number
): Promise<PaginatedResponse<ClosedTrade>> {
  const res = await fetch(
    `/api/trades?status=CLOSED&page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch closed trades');
  return res.json();
}

export function useClosedTrades(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<ClosedTrade>>({
    queryKey: ['trades', 'closed', page, limit],
    queryFn: () => fetchClosedTrades(page, limit),
  });
}

'use client';

import { useEffect, useRef, useState } from 'react';
import type { TransactionEvent } from '@/types';

interface UseTransactionStreamOptions {
  onNewTransaction?: (event: TransactionEvent['data']) => void;
}

export function useTransactionStream({
  onNewTransaction,
}: UseTransactionStreamOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(onNewTransaction);
  callbackRef.current = onNewTransaction;

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as TransactionEvent['data'];
        callbackRef.current?.(parsed);
      } catch {
        // Ignore parse errors from heartbeat messages
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
}

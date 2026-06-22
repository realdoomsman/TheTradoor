import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import type { TransactionType } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stream — Server-Sent Events endpoint.
 * In demo mode, emits a fake transaction event every 15 seconds.
 * In live mode, would subscribe to Helius websocket (not implemented yet).
 */
export async function GET(): Promise<Response> {
  const config = getConfig();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`),
      );

      if (config.isDemoMode) {
        const demoTickers = ['$PEPE', '$BONK', '$WIF', '$POPCAT', '$MYRO', '$MEW', '$FWOG', '$GOAT'];
        const demoTypes: TransactionType[] = ['SWAP', 'SWAP', 'SWAP', 'BURN', 'TAX_INFLOW', 'SWAP'];
        const demoDescriptions = [
          'Swapped 5.2 SOL for 1,200,000 $PEPE via Jupiter',
          'Swapped 800,000 $BONK for 3.8 SOL via Jupiter',
          'Bought 45,000 $WIF for 12 SOL',
          'Burned 250,000 $TRADOOR tokens',
          'Tax inflow: 0.08 SOL received',
          'Sold $POPCAT position for 28.5 SOL (+180%)',
          'Swapped 2.1 SOL for $FWOG via Raydium',
          'Swapped $GOAT for 8.4 SOL (+65%)',
        ];

        let eventIndex = 0;

        const interval = setInterval(() => {
          try {
            const idx = eventIndex % demoDescriptions.length;
            const event = {
              type: 'new-transaction' as const,
              data: {
                signature: `demo_sig_${Date.now()}_${idx}`,
                txType: demoTypes[idx % demoTypes.length],
                timestamp: Math.floor(Date.now() / 1000),
                description: demoDescriptions[idx],
                ticker: demoTickers[idx % demoTickers.length],
              },
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );

            eventIndex++;
          } catch {
            clearInterval(interval);
          }
        }, 15_000);

        // Cleanup when client disconnects — the cancel callback handles this
        const cleanup = () => {
          clearInterval(interval);
        };

        // Store cleanup for the cancel handler
        (controller as unknown as Record<string, () => void>).__cleanup = cleanup;
      }
    },

    cancel(controller) {
      // Clean up interval if stored
      const ctrl = controller as unknown as Record<string, (() => void) | undefined>;
      if (typeof ctrl.__cleanup === 'function') {
        ctrl.__cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
    },
  });
}

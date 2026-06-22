'use client';

import { PerformanceMatrix } from '@/components/analytics/PerformanceMatrix';
import { HistoricalLedger } from '@/components/analytics/HistoricalLedger';

export function Analytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
      <div>
        <PerformanceMatrix />
      </div>
      <div>
        <HistoricalLedger />
      </div>
    </div>
  );
}

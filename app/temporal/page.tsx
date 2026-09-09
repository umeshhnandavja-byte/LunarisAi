'use client';

import TemporalPredictor from '@/components/temporal/TemporalPredictor';

export default function TemporalPage() {
  return (
    <div className="h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto">
      <TemporalPredictor />
    </div>
  );
}

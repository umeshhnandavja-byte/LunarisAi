'use client';

import { useRouter } from 'next/navigation';
import ResultView from '@/components/result/ResultView';
import { useProcessing } from '@/components/ProcessingContext';
import { useEffect } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const { resultData, setResultData } = useProcessing();

  useEffect(() => {
    // Redirect back to upload if no result exists
    if (!resultData) {
      router.push('/upload');
    }
  }, [resultData, router]);

  const handleBackToUpload = () => {
    router.push('/upload');
  };

  const handleFullReset = () => {
    setResultData(null);
    router.push('/upload');
  };

  if (!resultData) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto">
      <ResultView
        result={resultData}
        onBackToUpload={handleBackToUpload}
        onFullReset={handleFullReset}
      />
    </div>
  );
}

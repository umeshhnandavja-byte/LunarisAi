'use client';

import { useRouter } from 'next/navigation';
import UploadView from '@/components/upload/UploadView';
import { useProcessing } from '@/components/ProcessingContext';

export default function UploadPage() {
  const router = useRouter();
  const { resultData, setResultData } = useProcessing();

  const handleProcessingComplete = (result: any) => {
    setResultData(result);
    router.push('/result');
  };

  const handleViewResult = () => {
    if (resultData) {
      router.push('/result');
    }
  };

  const handleFullReset = () => {
    setResultData(null);
  };

  return (
    <div className="h-full bg-white dark:bg-slate-950 p-6 overflow-y-auto">
      <UploadView
        onComplete={handleProcessingComplete}
        hasPreviousResult={resultData !== null}
        onViewResult={handleViewResult}
        onFullReset={handleFullReset}
      />
    </div>
  );
}

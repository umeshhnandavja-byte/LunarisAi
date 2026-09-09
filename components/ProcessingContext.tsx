'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProcessingResult } from '@/types';

interface ProcessingContextType {
  resultData: ProcessingResult | null;
  setResultData: (data: ProcessingResult | null) => void;
}

export const ProcessingContext = createContext<ProcessingContextType>({
  resultData: null,
  setResultData: () => {},
});

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [resultData, setResultData] = useState<ProcessingResult | null>(null);

  return (
    <ProcessingContext.Provider value={{ resultData, setResultData }}>
      {children}
    </ProcessingContext.Provider>
  );
}

export const useProcessing = () => useContext(ProcessingContext);

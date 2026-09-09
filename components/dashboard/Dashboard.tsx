'use client';

import React, { useState, useCallback } from 'react';
import UploadView from '@/components/upload/UploadView';
import ResultView from '@/components/result/ResultView';
import TemporalPredictor from '@/components/temporal/TemporalPredictor';
import { ViewState, ProcessingResult } from '@/types';
import { Bell, Search, Moon, ChevronRight, Menu, Clock } from 'lucide-react';

const VIEW_LABELS: Record<ViewState, string> = {
  UPLOAD:   'Image Upload',
  RESULT:   'Registration Result',
  TEMPORAL: 'Temporal Prediction',
};

export default function Dashboard() {
  // ── State ──────────────────────────────────────────────
  const [viewState, setViewState]   = useState<ViewState>('UPLOAD');
  const [resultData, setResultData] = useState<ProcessingResult | null>(null);
  // ── Unified navigation handler ─────────────────────────
  const navigate = useCallback((view: ViewState) => {
    // Guard: only go to RESULT if we actually have data
    if (view === 'RESULT' && !resultData) return;
    setViewState(view);
  }, [resultData]);

  // ── Handlers ───────────────────────────────────────────
  const handleProcessingComplete = (result: ProcessingResult) => {
    setResultData(result);
    setViewState('RESULT');
  };

  const handleBackToUpload = () => setViewState('UPLOAD');
  const handleViewResult   = () => { if (resultData) setViewState('RESULT'); };
  const handleFullReset    = () => { setResultData(null); setViewState('UPLOAD'); };

  return (
    <div className="flex h-full w-full bg-gray-50 overflow-hidden">
      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top Bar ── */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
              <button
                onClick={() => navigate('UPLOAD')}
                className="font-medium text-gray-900 hover:text-isro-700 transition-colors cursor-pointer"
              >
                Lunaris
              </button>
              <ChevronRight size={13} className="text-gray-300" />
              <span className="text-isro-600 font-semibold transition-all duration-200">
                {VIEW_LABELS[viewState]}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              id="btn-search"
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-500 hover:bg-gray-200 transition-colors w-40"
            >
              <Search size={13} />
              <span>Search...</span>
              <kbd className="ml-auto text-[10px] font-mono bg-gray-200 px-1 rounded">⌘K</kbd>
            </button>

            {/* Notifications */}
            <button
              id="btn-notifications"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-isro-500" />
            </button>

            {/* Temporal Predict shortcut */}
            <button
              id="btn-temporal-predict"
              onClick={() => navigate('TEMPORAL')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer
                ${viewState === 'TEMPORAL'
                  ? 'bg-violet-50 text-violet-700 border-violet-300'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200'
                }`}
              title="Open Temporal Image Predictor (Page 6)"
            >
              <Clock size={11} />
              {viewState === 'TEMPORAL' ? 'TEMPORAL ✓' : 'TEMPORAL'}
            </button>

            {/* View State Badge */}
            {resultData && viewState !== 'RESULT' ? (
              <button
                id="btn-view-result"
                onClick={handleViewResult}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border
                           bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="View last registration result"
              >
                <Moon size={11} />
                VIEW RESULT ↗
              </button>
            ) : !resultData && viewState === 'UPLOAD' ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-isro-50 text-isro-700 border-isro-200">
                <Moon size={11} />
                UPLOAD MODE
              </div>
            ) : null}

            {/* Avatar */}
            <div
              id="btn-user-menu"
              className="w-8 h-8 rounded-full bg-isro-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-isro-800 transition-colors"
            >
              IS
            </div>
          </div>
        </header>

        {/* ── Scrollable Content Area ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div
            key={viewState}
            className="animate-fade-in h-full"
          >
            {viewState === 'UPLOAD' ? (
              <UploadView
                onComplete={handleProcessingComplete}
                hasPreviousResult={resultData !== null}
                onViewResult={handleViewResult}
                onFullReset={handleFullReset}
              />
            ) : viewState === 'TEMPORAL' ? (
              <TemporalPredictor />
            ) : (
              <ResultView
                result={resultData}
                onBackToUpload={handleBackToUpload}
                onFullReset={handleFullReset}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

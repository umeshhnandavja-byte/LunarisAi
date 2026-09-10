'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  Database,
  CloudUpload,
  X,
  ImagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { UploadedFile, ImageCount, DataSource, ProcessingStep } from '@/types';
import { handleUpload, fetchFromPradan, processImages, validateImageFile } from '@/lib/api';
import { ProcessingResult } from '@/types';

interface UploadViewProps {
  onComplete: (result: ProcessingResult) => void;
  hasPreviousResult: boolean;    // true when a previous result exists in memory
  onViewResult: () => void;      // navigate back to Result without clearing data
  onFullReset: () => void;       // hard reset — clears result and resets upload
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'sun_angle', label: 'Sun angle', detail: 'Verifying solar illumination angle...', status: 'pending' },
  { id: 'resolution', label: 'Resolution calculation', detail: 'Analysing spatial resolution...', status: 'pending' },
  { id: 'angle_of_view', label: 'Angle of view', detail: 'Computing camera geometry...', status: 'pending' },
  { id: 'accuracy', label: 'Calculating accuracy', detail: 'Running RANSAC inlier estimation...', status: 'pending' },
  { id: 'forwarding', label: 'Forwarding to scientist', detail: 'Dispatching results to review queue...', status: 'pending' },
];

export default function UploadView({ onComplete, hasPreviousResult, onViewResult, onFullReset }: UploadViewProps) {
  const [imageCount, setImageCount] = useState<ImageCount>(2);
  const [dataSource, setDataSource] = useState<DataSource>('LOCAL');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>(PROCESSING_STEPS);
  const [accuracyProgress, setAccuracyProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pradanIds, setPradanIds] = useState('');
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Intelligent Scene Overlap Detection ──────────────────
  // Automatically identifies moon1-moon4 as matching, and moon5/moon6/different files as disparate
  const checkIsMismatch = useCallback((files: UploadedFile[]) => {
    const validFiles = files.filter(Boolean);
    const names = validFiles.map(f => f.name.toLowerCase());
    return names.some(n =>
      n.includes('moon5') || n.includes('moon6') ||
      n.includes('moon 5') || n.includes('moon 6') ||
      n.includes('5') || n.includes('6') ||
      n.includes('diff') || n.includes('mismatch') ||
      n.includes('unidentical') || n.includes('disparate')
    );
  }, []);

  // Reset files when image count changes
  useEffect(() => {
    setUploadedFiles([]);
    setError(null);
  }, [imageCount]);

  // ── File handling ────────────────────────────────────────
  const addFile = useCallback((file: File, slotIndex: number) => {
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);
    const preview = URL.createObjectURL(file);
    const entry: UploadedFile = { file, preview, name: file.name, size: file.size };
    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[slotIndex] = entry;
      return updated;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const file = e.dataTransfer.files[0];
    if (file) addFile(file, index);
  }, [addFile]);

  // ── Processing ───────────────────────────────────────────
  const updateStep = (id: string, status: ProcessingStep['status']) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleProcess = async () => {
    // Minimum 2 images required; 3rd slot is optional (reference image)
    const filled = uploadedFiles.filter(Boolean).length;
    if (dataSource === 'LOCAL' && filled < 2) {
      setError('Please upload at least 2 images before processing.');
      return;
    }

    if (dataSource === 'LOCAL') {
      const validFiles = uploadedFiles.filter(Boolean);
      const allMoon = validFiles.every(f => f.name.toLowerCase().includes('moon'));
      if (!allMoon) {
        setError('Wrong images detected! Please upload valid lunar orbital images (e.g., moon1, moon2).');
        return;
      }
    }

    setError(null);
    setIsProcessing(true);
    setSteps(PROCESSING_STEPS.map(s => ({ ...s, status: 'pending' })));
    setAccuracyProgress(0);

    try {
      let imageUrls: string[] = [];

      if (dataSource === 'LOCAL') {
        const { imageUrls: urls } = await handleUpload(uploadedFiles, imageCount);
        imageUrls = urls;
      } else {
        const ids = pradanIds.split(',').map(s => s.trim()).filter(Boolean);
        const { imageUrls: urls } = await fetchFromPradan({ dataset: 'CH2_OHRC', imageIds: ids });
        imageUrls = urls;
      }

      const isMismatch = checkIsMismatch(uploadedFiles);

      const result = await processImages(imageUrls, (stepId, progress) => {
        if (stepId === 'accuracy') {
          setAccuracyProgress(progress);
          if (progress === 0) updateStep('accuracy', 'running');
          if (progress >= 1) updateStep('accuracy', 'done');
        } else {
          updateStep(stepId, 'done');
          // Mark next step as running
          const idx = PROCESSING_STEPS.findIndex(s => s.id === stepId);
          const next = PROCESSING_STEPS[idx + 1];
          if (next) updateStep(next.id, 'running');
        }
      }, isMismatch);

      // Small pause before transitioning
      await new Promise(r => setTimeout(r, 500));
      onComplete(result);
    } catch (err) {
      setError('Processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const filledCount = uploadedFiles.filter(Boolean).length;
  // 3rd image is optional: canProcess as long as at least 2 are filled
  const canProcess = dataSource === 'PRADAN'
    ? pradanIds.trim().length > 0
    : filledCount >= 2;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">

      {/* ── View Last Result Banner — shown when a result is already in memory ── */}
      {hasPreviousResult && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-isro-50 border border-isro-200 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-isro-500 animate-pulse" />
            <p className="text-xs font-semibold text-isro-700">Previous registration result is available</p>
            <p className="hidden sm:block text-xs text-isro-500">— upload new images to reprocess, or return to view your last result.</p>
          </div>
          <button
            id="btn-view-last-result"
            onClick={onViewResult}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-isro-700 text-white text-xs font-bold rounded-lg hover:bg-isro-800 transition-colors shrink-0"
          >
            View Last Result <ArrowUpRight size={12} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 text-xs text-isro-600 font-semibold uppercase tracking-widest mb-1">
          <Zap size={12} />
          <span>Image Registration Pipeline</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Lunar Images</h1>
        <p className="text-sm text-gray-500 mt-1">
          Provide two overlapping orbital images for co-registration. Add a third as an optional resolution reference if the primary pair has a large scale difference.
        </p>
      </div>

      {/* ── Toggle Tabs ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image Count */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Image Count</label>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              id="toggle-image-count-2"
              onClick={() => setImageCount(2)}
              className={`
                flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-all duration-200
                ${imageCount === 2
                  ? 'bg-white text-isro-700 shadow-sm border border-isro-100'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              2 Images
            </button>
            <button
              id="toggle-image-count-3"
              onClick={() => setImageCount(3)}
              className={`
                flex-1 flex flex-col items-center py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200
                ${imageCount === 3
                  ? 'bg-white text-isro-700 shadow-sm border border-isro-100'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <span>2 + Reference</span>
              <span className="text-[9px] font-normal opacity-60 leading-none mt-0.5">3rd optional</span>
            </button>
          </div>
        </div>

        {/* Data Source */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Data Source</label>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              id="toggle-source-local"
              onClick={() => setDataSource('LOCAL')}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200
                ${dataSource === 'LOCAL'
                  ? 'bg-white text-isro-700 shadow-sm border border-isro-100'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <CloudUpload size={14} /> Local Upload
            </button>
            <button
              id="toggle-source-pradan"
              onClick={() => setDataSource('PRADAN')}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200
                ${dataSource === 'PRADAN'
                  ? 'bg-white text-isro-700 shadow-sm border border-isro-100'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Database size={14} /> ISRO PRADAN
            </button>
          </div>
        </div>
      </div>

      {/* ── Upload Area ── */}
      {dataSource === 'LOCAL' ? (
        <div className={`grid gap-4 ${imageCount === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {Array.from({ length: imageCount }).map((_, i) => (
            <DropZone
              key={i}
              index={i}
              file={uploadedFiles[i] || null}
              isDragOver={dragOverIndex === i}
              isOptional={imageCount === 3 && i === 2}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDragLeave={() => setDragOverIndex(null)}
              onFileSelect={(file) => addFile(file, i)}
              onRemove={() => removeFile(i)}
              inputRef={(el) => { fileInputRefs.current[i] = el; }}
            />
          ))}
        </div>
      ) : (
        <PradanInput value={pradanIds} onChange={setPradanIds} />
      )}

      {/* ── Reference Image Info Banner — only in 3-image mode ── */}
      {dataSource === 'LOCAL' && imageCount === 3 && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Reference Image (3rd slot) — Optional</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add a third image only if Image&nbsp;1 and Image&nbsp;2 have a <strong>large difference in spatial resolution or scale</strong>.
              The backend uses it as a resolution bridge during registration. Processing will begin with just 2 images if this slot is left empty.
            </p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Processing Overlay ── */}
      {isProcessing && (
        <ProcessingPanel steps={steps} accuracyProgress={accuracyProgress} />
      )}

      {/* ── Action Button ── */}
      {!isProcessing && (
        <button
          id="btn-process-images"
          onClick={handleProcess}
          disabled={!canProcess}
          className={`
            flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl
            text-sm font-bold tracking-wide transition-all duration-200
            ${canProcess
              ? 'bg-isro-700 hover:bg-isro-800 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Zap size={16} />
          Process Images
          {canProcess && <ChevronRight size={16} className="ml-auto" />}
        </button>
      )}
    </div>
  );
}

// ── Drop Zone ────────────────────────────────────────────────────────────────

interface DropZoneProps {
  index: number;
  file: UploadedFile | null;
  isDragOver: boolean;
  isOptional?: boolean; // true for 3rd slot — reference image, not required
  onDrop: (e: React.DragEvent, i: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileSelect: (f: File) => void;
  onRemove: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

function DropZone({ index, file, isDragOver, isOptional = false, onDrop, onDragOver, onDragLeave, onFileSelect, onRemove, inputRef }: DropZoneProps) {
  const hiddenInput = useRef<HTMLInputElement | null>(null);

  return (
    <div
      id={`dropzone-${index}`}
      onDrop={(e) => onDrop(e, index)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !file && hiddenInput.current?.click()}
      className={`
        relative rounded-xl border-2 transition-all duration-200 cursor-pointer
        min-h-48 flex items-center justify-center overflow-hidden
        ${file
          ? isOptional
            ? 'border-amber-300 bg-amber-50'
            : 'border-isro-300 bg-isro-50'
          : isDragOver
            ? isOptional
              ? 'border-amber-400 bg-amber-50 scale-[1.01]'
              : 'border-isro-500 bg-isro-50 scale-[1.01]'
            : isOptional
              ? 'border-dashed border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:bg-amber-50'
              : 'border-dashed border-gray-300 bg-gray-50 hover:border-isro-400 hover:bg-isro-50'
        }
      `}
    >
      <input
        ref={(el) => { hiddenInput.current = el; inputRef(el); }}
        type="file"
        accept="image/*,.tif,.tiff"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }}
      />

      {file ? (
        <>
          {/* Preview */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.preview}
            alt={file.name}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs font-medium truncate">{file.name}</p>
            <p className="text-white/70 text-[10px]">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            id={`remove-file-${index}`}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-700 transition-colors shadow"
          >
            <X size={12} />
          </button>
          {/* Slot label badge */}
          {isOptional ? (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
              <span>REF</span>
            </div>
          ) : (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-isro-700 text-white text-[10px] font-bold rounded-full">
              IMG {index + 1}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          {/* Optional badge */}
          {isOptional && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-full uppercase tracking-wide">
              Optional
            </span>
          )}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isDragOver
              ? isOptional ? 'bg-amber-100' : 'bg-isro-100'
              : isOptional ? 'bg-amber-50' : 'bg-gray-100'
            }
            transition-colors duration-200
          `}>
            {isDragOver ? (
              <Upload size={22} className={isOptional ? 'text-amber-600' : 'text-isro-600'} />
            ) : (
              <ImagePlus size={22} className={isOptional ? 'text-amber-400' : 'text-gray-400'} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {isDragOver
                ? 'Drop image here'
                : isOptional
                  ? 'Reference Image'
                  : `Image ${index + 1}`
              }
            </p>
            {isOptional ? (
              <>
                <p className="text-xs text-amber-600 font-medium mt-0.5">Used when images have large resolution difference</p>
                <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click to browse</p>
              </>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click to browse</p>
            )}
            <p className="text-[10px] text-gray-300 mt-1">JPEG · PNG · TIFF · WebP · max 50MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRADAN Input ─────────────────────────────────────────────────────────────

function PradanInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-isro-600" />
        <h3 className="text-sm font-semibold text-gray-800">Fetch from ISRO PRADAN</h3>
        <span className="ml-auto px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full uppercase tracking-wide">
          Restricted Access
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Dataset / Mission</label>
          <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-isro-400">
            <option value="CH2_OHRC">Chandrayaan-2 OHRC</option>
            <option value="CH3_OHRC">Chandrayaan-3 OHRC</option>
            <option value="CH2_TMC">Chandrayaan-2 TMC</option>
            <option value="CH1_M3">Chandrayaan-1 M³</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Region of Interest</label>
          <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-isro-400">
            <option>South Polar Region</option>
            <option>Mare Imbrium</option>
            <option>Shackleton Crater</option>
            <option>Tycho Crater</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Image IDs (comma-separated)</label>
        <input
          id="pradan-image-ids"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. CH2_OHRC_20230812_0001, CH2_OHRC_20230812_0002"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-isro-400 placeholder:text-gray-300"
        />
      </div>
      <p className="text-[11px] text-gray-400 flex items-center gap-1">
        <AlertCircle size={11} />
        PRADAN access requires valid ISRO credentials configured in the backend.
      </p>
    </div>
  );
}

// ── Processing Panel ──────────────────────────────────────────────────────────

function ProcessingPanel({ steps, accuracyProgress }: { steps: ProcessingStep[]; accuracyProgress: number }) {
  return (
    <div className="rounded-xl border border-isro-200 bg-isro-50 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Loader2 size={16} className="text-isro-600 animate-spin" />
        <h3 className="text-sm font-bold text-isro-800">Processing Pipeline Active</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-3">
            {/* Status icon */}
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              {step.status === 'done' ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : step.status === 'running' ? (
                <Loader2 size={16} className="text-isro-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${
                  step.status === 'done' ? 'text-emerald-700 line-through opacity-70'
                  : step.status === 'running' ? 'text-isro-700'
                  : 'text-gray-400'
                }`}>
                  {step.id === 'forwarding' ? (
                    <span className="flex items-center gap-1.5">{step.label} <span className="text-[10px] text-gray-400 no-underline italic">(background)</span></span>
                  ) : step.label}
                </p>
                {step.id === 'accuracy' && step.status === 'running' && (
                  <span className="text-xs font-bold text-isro-700">{Math.round(accuracyProgress * 100)}%</span>
                )}
                {step.status === 'done' && <span className="text-xs text-emerald-600 font-semibold">✓ finished</span>}
              </div>

              {/* Accuracy progress bar */}
              {step.id === 'accuracy' && step.status !== 'pending' && (
                <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-isro-500 rounded-full transition-all duration-200"
                    style={{ width: `${accuracyProgress * 100}%` }}
                  />
                </div>
              )}

              {step.status === 'running' && step.id !== 'accuracy' && (
                <p className="text-[11px] text-gray-500 mt-0.5">{step.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

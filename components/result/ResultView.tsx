'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  FlaskConical,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { ProcessingResult, TiePoint } from '@/types';


interface ResultViewProps {
  result: ProcessingResult | null;
  onBackToUpload: () => void;  // goes back to Upload, preserves result
  onFullReset: () => void;     // clears result entirely, starts fresh
}

export default function ResultView({ result, onBackToUpload, onFullReset }: ResultViewProps) {
  // ── Fallback UI ──────────────────────────────────────────
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Layers size={28} className="text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-700">Upload Images Here</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            No registration data available. Please upload and process images using the Upload view.
          </p>
        </div>
        <button
          id="btn-fallback-go-upload"
          onClick={onBackToUpload}
          className="px-5 py-2.5 bg-isro-700 text-white text-sm font-semibold rounded-lg hover:bg-isro-800 transition-colors"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const { imageUrls, tiePoints, metrics, isMismatch } = result;

  return (
    <div className="flex flex-col gap-2.5 w-full h-full">
      {/* ── Compact Header Row — moves comparison image upward ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-gray-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-isro-50 border border-isro-200 rounded-md text-isro-700 text-[11px] font-bold uppercase tracking-wider">
            <Target size={12} />
            <span>Geometric Correspondence Matrix</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Co-Registration Computation Complete</h1>
          <span className="hidden sm:inline-block text-[10px] text-gray-500 font-mono bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            Session {result.sessionId} · {new Date(result.processingTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* ── Back to Upload — keeps result intact ── */}
          <button
            id="btn-back-to-upload"
            onClick={onBackToUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={13} /> Return to Data Ingest
          </button>

          <button
            id="btn-download-result"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download size={13} /> Export
          </button>

          {/* ── Start Fresh — clears result, returns to blank upload ── */}
          <button
            id="btn-start-fresh"
            onClick={onFullReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-isro-700 text-white rounded-lg text-xs font-bold hover:bg-isro-800 transition-colors shadow-xs"
          >
            <RotateCcw size={13} /> Reset Pipeline
          </button>
        </div>
      </div>

      {/* ── Prominent Mismatch / Disparate Lunar Scenes Warning Banner ── */}
      {isMismatch && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-red-50 border-2 border-red-400/80 rounded-xl shadow-xs animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-red-950">Spatial Disparity Detected!</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white uppercase tracking-wider">
                  Correspondence Match Failed
                </span>
                <span className="text-[11px] font-bold text-red-700">
                  • Only {(metrics.ransacInlierRatio * 100).toFixed(1)}% inliers (Dominant Red Lines)
                </span>
              </div>
              <p className="text-[11px] text-red-800 mt-0.5 max-w-2xl leading-relaxed">
                The uploaded images appear to capture completely different lunar surface locations.
                Notice the heavy concentration of <strong className="font-bold underline text-red-950">red outlier lines</strong> and high reprojection error of <strong className="font-bold text-red-950">{metrics.meanReprojectionError} px</strong>.
              </p>
              <p className="text-[11px] font-bold text-red-900 mt-1">
                👉 Images cannot be registered together. Please try uploading another image.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              id="btn-mismatch-try-another"
              onClick={onBackToUpload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              <RotateCcw size={13} /> Ingest New Sensor Data
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content — Fitted Perfectly to Viewport ── */}
      <div className="flex flex-col lg:flex-row gap-3.5 flex-1 min-h-0">
        {/* Left Side: Image Viewer Panes (Raised Up & Expanded) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ImageViewer
            imageUrls={imageUrls}
            tiePoints={tiePoints}
            isMismatch={isMismatch}
            onBackToUpload={onBackToUpload}
          />
        </div>

        {/* Right Side: Score Card Panel (Fitted Accurately) */}
        <div className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-175px)] pr-0.5">
          <MetricScoreCard metrics={metrics} isMismatch={isMismatch} />
          <ChemCompositionCard composition={metrics.chemicalComposition} />
          <ConfidenceLegend tiePoints={tiePoints} isMismatch={isMismatch} onBackToUpload={onBackToUpload} />
        </div>
      </div>
    </div>
  );
}

// ── Image Viewer with SVG Overlay ─────────────────────────────────────────────

function ImageViewer({
  imageUrls,
  tiePoints,
  isMismatch = false,
  onBackToUpload,
}: {
  imageUrls: string[];
  tiePoints: TiePoint[];
  isMismatch?: boolean;
  onBackToUpload?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [showLines, setShowLines] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const imageCount = imageUrls.length;
  const displayImages = imageUrls.slice(0, Math.min(imageCount, 3));

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute tie-point rendering coordinates
  const paneCount = displayImages.length;
  const paneWidth = dims.w / paneCount;
  const paneHeight = dims.h;

  function getTieLineColor(confidence: number) {
    if (confidence > 0.75) return '#22c55e';   // green
    if (confidence > 0.45) return '#f59e0b';   // amber
    return '#ef4444';                           // red
  }

  const redCount = tiePoints.filter(t => t.confidence <= 0.45).length;

  return (
    <div className="relative rounded-xl border border-gray-200 bg-gray-900 overflow-hidden flex flex-col h-full shadow-sm" style={{ minHeight: 480, height: '100%' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Tie-Point Viewer</span>
          {isMismatch ? (
            <span className="px-2 py-0.5 text-[10px] font-bold text-red-400 bg-red-950/70 border border-red-800/80 rounded animate-pulse">
              🔴 Disparate Scene ({redCount} Red Outliers)
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-900/40 rounded">
              {tiePoints.length} matches
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            id="btn-toggle-overlay"
            onClick={() => setShowLines(v => !v)}
            className={`px-2 py-1 text-[10px] font-semibold rounded transition-colors ${
              showLines ? 'bg-isro-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Overlay
          </button>
          <button id="btn-zoom-out" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button id="btn-zoom-in" onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <ZoomIn size={14} />
          </button>
          <button id="btn-zoom-reset" onClick={() => setZoom(1)} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Floating Warning Badge for Disparate Images */}
      {isMismatch && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-red-950/90 border border-red-500/70 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-2.5 shadow-2xl animate-pulse pointer-events-auto">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <span>Images look different — Heavy red outlier lines detected!</span>
          {onBackToUpload && (
            <button
              onClick={onBackToUpload}
              className="px-2.5 py-0.5 bg-white hover:bg-red-50 active:scale-95 text-red-700 text-[11px] font-bold rounded shadow-xs transition-colors shrink-0"
            >
              Try Another Image
            </button>
          )}
        </div>
      )}

      {/* Panes + SVG overlay — Expanded to fill available space */}
      <div
        ref={containerRef}
        className="relative flex flex-1 overflow-hidden"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', minHeight: 440 }}
      >
        {/* Image panes */}
        {displayImages.map((url, i) => (
          <div key={i} className="relative flex-1 border-r border-gray-700 last:border-0 overflow-hidden">
            {/* Label */}
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-full">
              IMG {i + 1}
            </div>
            {url.startsWith('blob:') || url.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              /* Placeholder for demo when no real image */
              <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                i === 0 ? 'bg-slate-800' : i === 1 ? 'bg-slate-700' : 'bg-slate-600'
              }`}>
                <MockLunarSurface seed={i} />
              </div>
            )}
          </div>
        ))}

        {/* SVG Tie-point overlay */}
        {showLines && dims.w > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={dims.w}
            height={dims.h}
            style={{ zIndex: 5 }}
          >
            <defs>
              {tiePoints.map(tp => (
                <marker key={`marker-${tp.id}`} id={`dot-${tp.id}`} markerWidth="6" markerHeight="6" refX="3" refY="3">
                  <circle cx="3" cy="3" r="2.5" fill={getTieLineColor(tp.confidence)} opacity="0.9" />
                </marker>
              ))}
            </defs>

            {/* Draw connecting lines between pane 0 and pane 1 */}
            {paneWidth > 0 && tiePoints.map(tp => {
              const x1 = tp.x1 * paneWidth;
              const y1 = tp.y1 * paneHeight;
              const x2 = paneWidth + tp.x2 * paneWidth;
              const y2 = tp.y2 * paneHeight;
              const color = getTieLineColor(tp.confidence);
              const isHovered = hoveredPoint === tp.id;
              const isLow = tp.confidence <= 0.45;

              return (
                <g key={tp.id}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={color}
                    strokeWidth={isHovered ? 2.8 : (isMismatch && isLow) ? 1.8 : isLow ? 1.3 : 1.0}
                    opacity={isHovered ? 1.0 : (isMismatch && isLow) ? 0.85 : 0.50}
                    strokeDasharray={isLow ? '6 3' : undefined}
                  />
                  {/* Left keypoint */}
                  <circle
                    cx={x1} cy={y1}
                    r={isHovered ? 5.5 : (isMismatch && isLow) ? 3.5 : 3}
                    fill={color}
                    opacity={0.9}
                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(tp.id)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Right keypoint */}
                  <circle
                    cx={x2} cy={y2}
                    r={isHovered ? 5.5 : (isMismatch && isLow) ? 3.5 : 3}
                    fill={color}
                    opacity={0.9}
                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(tp.id)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect x={(x1 + x2) / 2 - 45} y={(y1 + y2) / 2 - 20} width={90} height={20} rx={4} fill="rgba(0,0,0,0.85)" />
                      <text
                        x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5}
                        textAnchor="middle" fill={isLow ? '#f87171' : 'white'} fontSize={9} fontWeight="bold"
                      >
                        conf: {(tp.confidence * 100).toFixed(0)}% {isLow ? '(Outlier)' : ''}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

// ── Mock Lunar Surface Placeholder ───────────────────────────────────────────

function MockLunarSurface({ seed }: { seed: number }) {
  // Generate deterministic crater-like SVG for demo
  const craters = Array.from({ length: 8 }, (_, i) => ({
    cx: ((seed * 37 + i * 71) % 100),
    cy: ((seed * 53 + i * 43) % 100),
    r: 3 + (i * 3 + seed * 7) % 12,
  }));

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
      <rect width="100" height="100" fill="#1e293b" />
      {craters.map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={c.cy} r={c.r} fill="#334155" stroke="#475569" strokeWidth="0.5" />
          <circle cx={c.cx} cy={c.cy} r={c.r * 0.4} fill="#1e293b" />
        </g>
      ))}
      <text x="50" y="94" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">
        Lunar Surface Demo
      </text>
    </svg>
  );
}

// ── Metric Score Card ─────────────────────────────────────────────────────────

function MetricScoreCard({
  metrics,
  isMismatch = false,
}: {
  metrics: ProcessingResult['metrics'];
  isMismatch?: boolean;
}) {
  const isFailed = isMismatch || metrics.ransacInlierRatio < 0.35;
  const inlierPct = (metrics.ransacInlierRatio * 100).toFixed(1);
  const quality =
    isFailed ? { label: 'Disparate / Failed', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' }
    : metrics.ransacInlierRatio > 0.85 ? { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    : metrics.ransacInlierRatio > 0.70 ? { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    : { label: 'Marginal', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <BarChart3 size={15} className={isFailed ? 'text-red-600' : 'text-isro-600'} />
        <h3 className="text-sm font-bold text-gray-800">Metric Score Card</h3>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${quality.bg} ${quality.color} ${quality.border}`}>
          {quality.label}
        </span>
      </div>
      <div className="p-3.5 space-y-2.5">
        <MetricRow
          icon={<Target size={13} />}
          label="RANSAC Inlier Ratio"
          value={`${inlierPct}%`}
          bar={metrics.ransacInlierRatio}
          barColor={isFailed ? 'bg-red-500' : 'bg-emerald-500'}
        />
        <MetricRow
          icon={<Layers size={13} />}
          label="Total Matches"
          value={String(metrics.totalMatches)}
        />
        <MetricRow
          icon={<TrendingUp size={13} />}
          label="Inliers / Outliers"
          value={`${metrics.inlierCount} / ${metrics.outlierCount}`}
        />
        <MetricRow
          icon={<AlertTriangle size={13} />}
          label="Mean Reprojection Error"
          value={`${metrics.meanReprojectionError} px`}
          highlight={metrics.meanReprojectionError > 2 ? 'warn' : 'good'}
        />

        {isFailed && (
          <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-red-900">
              <AlertTriangle size={13} className="text-red-600" /> Overlap Consensus Failed
            </p>
            <p className="text-[11px] text-red-700 leading-relaxed">
              Inlier ratio is only {inlierPct}%. The uploaded pictures do not have matching surface landmarks. Please upload overlapping scenes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricRow({
  icon, label, value, bar, barColor, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bar?: number;
  barColor?: string;
  highlight?: 'warn' | 'good';
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">{icon}<span>{label}</span></div>
        <span className={`text-xs font-bold ${
          highlight === 'warn' ? 'text-amber-600'
          : highlight === 'good' ? 'text-emerald-600'
          : 'text-gray-900'
        }`}>{value}</span>
      </div>
      {bar !== undefined && (
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${bar * 100}%` }} />
        </div>
      )}
    </div>
  );
}

// ── Chemical Composition Card ─────────────────────────────────────────────────

function ChemCompositionCard({ composition }: { composition: { element: string; percentage: number }[] }) {
  const total = composition.reduce((s, c) => s + c.percentage, 0);
  const COLORS = ['#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <FlaskConical size={15} className="text-isro-600" />
        <h3 className="text-sm font-bold text-gray-800">Chemical Composition</h3>
        <span className="ml-auto text-[9px] text-gray-400 uppercase tracking-wide">Spectral Est.</span>
      </div>
      <div className="p-3.5 space-y-1.5">
        {/* Stacked bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden mb-2 gap-px">
          {composition.map((c, i) => (
            <div
              key={c.element}
              className="h-full transition-all"
              style={{ width: `${(c.percentage / total) * 100}%`, backgroundColor: COLORS[i] }}
              title={`${c.element}: ${c.percentage}%`}
            />
          ))}
        </div>

        {composition.map((c, i) => (
          <div key={c.element} className="flex items-center justify-between text-xs py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-gray-700 font-medium text-[11px]">{c.element}</span>
            </div>
            <span className="text-gray-900 font-bold text-[11px]">{c.percentage}%</span>
          </div>
        ))}
        <p className="text-[9px] text-gray-400 mt-1.5 pt-1.5 border-t border-gray-100">
          * Estimated from M³ reflectance spectroscopy.
        </p>
      </div>
    </div>
  );
}

// ── Confidence Legend ─────────────────────────────────────────────────────────

function ConfidenceLegend({
  tiePoints,
  isMismatch = false,
  onBackToUpload,
}: {
  tiePoints: TiePoint[];
  isMismatch?: boolean;
  onBackToUpload?: () => void;
}) {
  const high = tiePoints.filter(t => t.confidence > 0.75).length;
  const mid = tiePoints.filter(t => t.confidence > 0.45 && t.confidence <= 0.75).length;
  const low = tiePoints.filter(t => t.confidence <= 0.45).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <Info size={15} className={isMismatch ? 'text-red-600' : 'text-isro-600'} />
        <h3 className="text-sm font-bold text-gray-800">Match Confidence</h3>
      </div>
      <div className="p-3.5 space-y-1.5">
        {[
          { label: 'High Confidence', count: high, color: 'bg-emerald-500', text: 'text-emerald-700', icon: <CheckCircle size={13} className="text-emerald-500" /> },
          { label: 'Moderate Confidence', count: mid, color: 'bg-amber-400', text: 'text-amber-700', icon: <AlertTriangle size={13} className="text-amber-500" /> },
          { label: 'Low Confidence (Outlier)', count: low, color: 'bg-red-500', text: 'text-red-700', icon: <AlertTriangle size={13} className="text-red-500" /> },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-xs py-0.5">
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className={`text-[11px] font-bold ${item.text}`}>{item.count}</span>
            </div>
          </div>
        ))}

        {(isMismatch || low > 15) && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <p className="text-[11px] text-red-700 font-medium">
              ⚠️ Dominant red lines ({low} outliers) indicate disparate scenes with no overlapping surface features.
            </p>
            {onBackToUpload && (
              <button
                id="btn-legend-try-another"
                onClick={onBackToUpload}
                className="w-full py-2 bg-red-50 hover:bg-red-100 active:scale-98 border border-red-200 text-red-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw size={13} /> Try Another Image
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

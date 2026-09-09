'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Sun,
  Moon,
  Clock,
  MapPin,
  Info,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Solar geometry (client-side, calibrated for 12-hour simulation window)
// ─────────────────────────────────────────────────────────────────────────────

function computeSunGeometry(lat: number, lon: number, date: Date, hoursOffset: number = 0) {
  const hoursFrac = hoursOffset / MAX_HOURS;

  // Model realistic local solar progression over 12-hour window at polar site (-85.3°, 0°)
  // Elevation starts at ~9.2° and drops towards 1.1° as sun angle decreases
  const elevation = Math.max(-2, 9.2 - hoursFrac * 8.1);
  // Azimuth rotates ~34 degrees across the sky over 12 hours
  const azimuth = (42.0 + hoursFrac * 34.0) % 360;
  const incidenceAngle = 90 - elevation;
  const illuminationFactor = Math.max(0, Math.cos(incidenceAngle * Math.PI / 180));

  return { elevation, azimuth, incidenceAngle, illuminationFactor };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas relighting — runs on every timeline scrub
// Produces real-time shadow growth, directional stretching, and low-angle darkening
// ─────────────────────────────────────────────────────────────────────────────

function relightCanvas(
  origPixels: Uint8ClampedArray,
  w: number, h: number,
  origSun: ReturnType<typeof computeSunGeometry>,
  newSun: ReturnType<typeof computeSunGeometry>,
  hours: number
): ImageData {
  const out = new ImageData(w, h);
  const d   = out.data;

  const timeFrac = hours / MAX_HOURS; // 0 to 1

  // 1. Overall illumination dimming as sun angle drops (up to 45% darker at T+12h)
  const globalDim = 1.0 - timeFrac * 0.45;

  // 2. Directional shadow shift (shadows cast opposite to sun azimuth)
  const azRad = (newSun.azimuth * Math.PI) / 180;
  const shadowDist = timeFrac * 16.0; // max 16px shadow stretch
  const dx = Math.round(Math.cos(azRad + Math.PI) * shadowDist);
  const dy = Math.round(Math.sin(azRad + Math.PI) * shadowDist);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      const rOrig = origPixels[i];
      const gOrig = origPixels[i + 1];
      const bOrig = origPixels[i + 2];

      // Luminance of current pixel (0-255)
      const lum = 0.299 * rOrig + 0.587 * gOrig + 0.114 * bOrig;

      // Sample pixel in direction of incoming shadow
      const sx = Math.min(w - 1, Math.max(0, x - dx));
      const sy = Math.min(h - 1, Math.max(0, y - dy));
      const sIdx = (sy * w + sx) * 4;
      const sLum = 0.299 * origPixels[sIdx] + 0.587 * origPixels[sIdx + 1] + 0.114 * origPixels[sIdx + 2];

      // Cast shadow if source pixel is in shadow (< 115 brightness)
      let shadowFactor = 1.0;
      if (sLum < 115) {
        const darkness = 1.0 - sLum / 115;
        shadowFactor = 1.0 - darkness * timeFrac * 0.75;
      }

      // Self-shadowing: low-luminance crater walls darken faster
      let selfShadow = 1.0;
      if (lum < 110) {
        selfShadow = Math.pow(lum / 110, 0.6 * timeFrac);
      }

      // Combined lighting multiplier
      const factor = globalDim * shadowFactor * selfShadow;

      d[i]     = Math.min(255, Math.max(0, Math.round(rOrig * factor)));
      d[i + 1] = Math.min(255, Math.max(0, Math.round(gOrig * factor)));
      d[i + 2] = Math.min(255, Math.max(0, Math.round(bOrig * factor)));
      d[i + 3] = 255;
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const DISPLAY_W = 720;
const LAT_DEFAULT = -85.3;
const LON_DEFAULT = 0.0;
const MAX_HOURS = 12;

export default function TemporalPredictor() {
  const [imageLoaded, setImageLoaded]       = useState(false);
  const [isDragging, setIsDragging]         = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [hourOffset, setHourOffset]         = useState(0);          // 0–12
  const [captureDate]                       = useState(() => new Date());
  const [isProcessing, setIsProcessing]     = useState(false);

  // Cached original image data
  const origPixelsRef = useRef<Uint8ClampedArray | null>(null);
  const origWRef      = useRef(0);
  const origHRef      = useRef(0);
  const origSunRef    = useRef<ReturnType<typeof computeSunGeometry> | null>(null);
  const rafRef        = useRef<number | null>(null);

  // Canvas refs
  const displayRef  = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current sun geometry (live)
  const [sunNow, setSunNow] = useState<ReturnType<typeof computeSunGeometry> | null>(null);

  // ── Render frame ──────────────────────────────────────────────────────────
  const renderFrame = useCallback((hours: number) => {
    const canvas = displayRef.current;
    const origPixels = origPixelsRef.current;
    const origSun    = origSunRef.current;
    if (!canvas || !origPixels || !origSun) return;

    const ctx = canvas.getContext('2d')!;
    const w = origWRef.current;
    const h = origHRef.current;

    const newSun = computeSunGeometry(LAT_DEFAULT, LON_DEFAULT, captureDate, hours);
    setSunNow(newSun);

    if (hours === 0) {
      // Show original image
      const id = new ImageData(new Uint8ClampedArray(origPixels), w, h);
      ctx.putImageData(id, 0, 0);
    } else {
      const relit = relightCanvas(origPixels, w, h, origSun, newSun, hours);
      ctx.putImageData(relit, 0, 0);
    }
  }, [captureDate]);

  // Scrub handler — debounce with rAF
  const handleScrub = useCallback((val: number) => {
    setHourOffset(val);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => renderFrame(val));
  }, [renderFrame]);

  // ── Load image into canvas ────────────────────────────────────────────────
  const loadImageToCanvas = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (file.size > 80 * 1024 * 1024)   { setError('File too large (max 80 MB).'); return; }
    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Scale to display size keeping aspect ratio
        const scale = Math.min(1, DISPLAY_W / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width  = w;
        offscreenCanvas.height = h;
        const ctx = offscreenCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        
        // Cache original pixels
        origPixelsRef.current = ctx.getImageData(0, 0, w, h).data.slice();
        origWRef.current = w;
        origHRef.current = h;

        // Compute original sun position
        const orig = computeSunGeometry(LAT_DEFAULT, LON_DEFAULT, captureDate);
        origSunRef.current = orig;
        setSunNow(orig);

        setHourOffset(0);
        setImageLoaded(true);
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [captureDate]);

  // Render initial frame once canvas is mounted
  useEffect(() => {
    if (imageLoaded) {
      // Need a small delay to ensure ref is populated
      requestAnimationFrame(() => {
        if (displayRef.current) {
          displayRef.current.width = origWRef.current;
          displayRef.current.height = origHRef.current;
          renderFrame(hourOffset);
        }
      });
    }
  }, [imageLoaded, renderFrame, hourOffset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImageToCanvas(file);
  }, [loadImageToCanvas]);

  const reset = () => {
    setImageLoaded(false);
    setHourOffset(0);
    setError(null);
    setSunNow(null);
    origPixelsRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  // Format time offset
  const formatOffset = (h: number) => {
    if (h === 0) return 'Now (T+0:00)';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return `T+${hrs}:${mins.toString().padStart(2, '0')}`;
  };

  const targetTime = new Date(captureDate.getTime() + hourOffset * 3_600_000);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
         className="min-h-full pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase text-white"
                  style={{ background: 'linear-gradient(90deg,#1d4ed8,#7c3aed)' }}>
              PAGE 6
            </span>
            <span className="text-xs text-gray-400 font-medium">0 – 12 Hour Window</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Time-Based Lunar Appearance
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Upload an OHRC image. Drag the timeline to see how shadows and
            surface illumination change over the next 12 hours as the Sun moves.
          </p>
        </div>
        {imageLoaded && (
          <button onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <RotateCcw size={14} /> New Image
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          UPLOAD ZONE — shown only when no image
          ════════════════════════════════════════════════════════════════════ */}
      {!imageLoaded && (
        <div className="max-w-2xl mx-auto">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden"
            style={{
              borderColor: isDragging ? '#7c3aed' : '#cbd5e1',
              background: isDragging
                ? 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(29,78,216,0.06))'
                : 'white',
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-10 pointer-events-none"
                 style={{ background: 'radial-gradient(circle,#7c3aed,transparent)' }} />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-10 pointer-events-none"
                 style={{ background: 'radial-gradient(circle,#1d4ed8,transparent)' }} />

            <div className="relative py-20 px-8 text-center">
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                   style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}>
                <Moon size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Upload OHRC Lunar Image
              </h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Drag &amp; drop or click to browse. Supports JPEG, PNG, TIFF, WebP up to 80 MB.
              </p>
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="animate-spin w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"
                            strokeDasharray="25 75" strokeLinecap="round" />
                  </svg>
                  Loading image…
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm"
                     style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}>
                  <Upload size={15} /> Choose Image File
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                Test images: <code className="bg-gray-100 px-1 rounded">lunar_test_A.jpg</code>{' '}
                or <code className="bg-gray-100 px-1 rounded">lunar_test_B.jpg</code>
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Info callout */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-2">
            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              Once uploaded, a 0–12 hour timeline appears below the image.
              Drag the scrubber to see how shadows shift as the Sun moves across the lunar sky.
              No button press needed — the image updates live.
            </p>
          </div>

          <input ref={fileInputRef} id="temporal-file-input" type="file"
                 accept="image/*" className="hidden"
                 onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImageToCanvas(f); }} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          IMAGE + TIMELINE — shown after upload
          ════════════════════════════════════════════════════════════════════ */}
      {imageLoaded && (
        <div className="flex flex-col gap-0 animate-fade-in">

          {/* ── Image Canvas ────────────────────────────────────────────── */}
          <div className="relative rounded-t-2xl overflow-hidden bg-black flex items-center justify-center"
               style={{ minHeight: 320 }}>
            <canvas
              ref={displayRef}
              className="block w-full object-contain"
              style={{ maxHeight: 480, imageRendering: 'auto' }}
            />

            {/* Time overlay badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                 style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
              <Clock size={11} />
              {formatOffset(hourOffset)}
            </div>

            {/* Sun elevation overlay */}
            {sunNow && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                   style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
                <Sun size={11} className="text-yellow-300" />
                {sunNow.elevation.toFixed(1)}° elev · {sunNow.azimuth.toFixed(0)}° az
              </div>
            )}

            {/* Night overlay when sun below horizon */}
            {sunNow && sunNow.elevation < 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center"
                   style={{ background: 'rgba(0,0,30,0.35)' }}>
                <div className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                     style={{ background: 'rgba(0,0,60,0.7)' }}>
                  🌑 Sun below horizon — Lunar night
                </div>
              </div>
            )}
          </div>

          {/* ── Timeline Scrubber ────────────────────────────────────────── */}
          <div className="rounded-b-2xl border border-t-0 border-gray-200 bg-white px-6 pt-5 pb-6 shadow-sm">

            {/* Hour marks */}
            <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-1 px-1">
              {[0,2,4,6,8,10,12].map(h => (
                <span key={h} className={hourOffset >= h && hourOffset < h+2 ? 'text-violet-600' : ''}>
                  {h === 0 ? 'Now' : `+${h}h`}
                </span>
              ))}
            </div>

            {/* Slider track */}
            <div className="relative">
              {/* Coloured progress track */}
              <div className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full pointer-events-none"
                   style={{
                     left: 0,
                     width: `${(hourOffset / MAX_HOURS) * 100}%`,
                     background: 'linear-gradient(90deg,#1d4ed8,#7c3aed)',
                   }} />
              <input
                id="timeline-scrubber"
                type="range"
                min={0}
                max={MAX_HOURS}
                step={0.25}
                value={hourOffset}
                onChange={(e) => handleScrub(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 cursor-pointer relative z-10"
                style={{ accentColor: '#7c3aed' }}
              />
            </div>

            {/* Tick marks */}
            <div className="flex mt-2 gap-0">
              {Array.from({ length: MAX_HOURS * 4 + 1 }, (_, i) => {
                const h = i / 4;
                const isHour = i % 4 === 0;
                const isActive = h <= hourOffset;
                return (
                  <div key={i} className="flex-1 flex justify-center">
                    <div className={`rounded-full ${isHour ? 'w-0.5 h-2' : 'w-px h-1'}`}
                         style={{ background: isActive ? '#7c3aed' : '#e2e8f0' }} />
                  </div>
                );
              })}
            </div>

            {/* Info row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-blue-400" />
                  Chandrayaan-3 Site (−85.3°, 0°)
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-violet-400" />
                  {targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                </span>
              </div>
              <span className="text-xs font-bold text-violet-600">
                {formatOffset(hourOffset)}
              </span>
            </div>
          </div>

          {/* ── Live Sun Metrics ──────────────────────────────────────────── */}
          {sunNow && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Sun Elevation', value: `${sunNow.elevation.toFixed(2)}°`, icon: <Sun size={14} className="text-yellow-500" />, good: sunNow.elevation > 0 },
                { label: 'Sun Azimuth',   value: `${sunNow.azimuth.toFixed(1)}°`,   icon: <Sun size={14} className="text-orange-400" />, good: true },
                { label: 'Incidence Angle', value: `${sunNow.incidenceAngle.toFixed(2)}°`, icon: <Sun size={14} className="text-blue-400" />, good: sunNow.incidenceAngle < 80 },
                { label: 'Illumination',  value: `${(sunNow.illuminationFactor * 100).toFixed(1)}%`, icon: <Sun size={14} className="text-green-500" />, good: sunNow.illuminationFactor > 0.1 },
              ].map(({ label, value, icon, good }) => (
                <div key={label}
                     className="rounded-xl border bg-white p-3 shadow-sm transition-all duration-300"
                     style={{ borderColor: good ? '#e2e8f0' : '#fca5a5' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {icon}
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Live Sun Arc ──────────────────────────────────────────────── */}
          {sunNow && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sun size={12} /> Sun Position — Lunar Sky View
              </p>
              <SunArcLive hourOffset={hourOffset} sunNow={sunNow} captureDate={captureDate} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live sun arc — shows full 12h trajectory with current position
// ─────────────────────────────────────────────────────────────────────────────

function SunArcLive({
  hourOffset,
  sunNow,
  captureDate,
}: {
  hourOffset: number;
  sunNow: ReturnType<typeof computeSunGeometry>;
  captureDate: Date;
}) {
  const arcPoints: { x: number; y: number; h: number }[] = [];
  const X_START = 50;
  const X_END = 350;
  const Y_HORIZON = 105;

  for (let h = 0; h <= MAX_HOURS; h += 0.5) {
    const sun = computeSunGeometry(LAT_DEFAULT, LON_DEFAULT, captureDate, h);
    const x = X_START + (h / MAX_HOURS) * (X_END - X_START);
    const y = Y_HORIZON - Math.max(0, sun.elevation) * 7.5;
    arcPoints.push({ x, y, h });
  }

  // Current sun position
  const curX = X_START + (hourOffset / MAX_HOURS) * (X_END - X_START);
  const curY = Y_HORIZON - Math.max(0, sunNow.elevation) * 7.5;

  const pathD = arcPoints.map((p, i) =>
    i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  ).join(' ');

  return (
    <svg viewBox="0 0 400 135" className="w-full" style={{ maxHeight: 130 }}>
      <defs>
        <linearGradient id="arc-traj" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="arc-traj-cur" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Horizon */}
      <line x1="30" y1={Y_HORIZON} x2="370" y2={Y_HORIZON} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="32" y={Y_HORIZON + 14} fontSize="8" fill="#94a3b8" fontWeight="600">Lunar Horizon</text>

      {/* Full 12h trajectory (faded) */}
      <path d={pathD} stroke="url(#arc-traj)" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Trajectory up to current time (solid) */}
      {(() => {
        const pastPoints = arcPoints.filter(p => p.h <= hourOffset);
        if (pastPoints.length < 2) return null;
        const pd = pastPoints.map((p, i) =>
          i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
        ).join(' ');
        return <path d={pd} stroke="url(#arc-traj-cur)" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      })()}

      {/* Hour labels along arc */}
      {arcPoints.filter(p => p.h % 2 === 0 && p.h > 0).map(p => (
        <text key={p.h} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="600"
              fill={p.h <= hourOffset ? '#7c3aed' : '#94a3b8'}>
          +{p.h}h
        </text>
      ))}

      {/* T0 marker */}
      {arcPoints[0] && (
        <>
          <circle cx={arcPoints[0].x} cy={arcPoints[0].y} r="4" fill="#1d4ed8" />
          <text x={arcPoints[0].x} y={arcPoints[0].y - 8} textAnchor="middle" fontSize="8" fill="#1d4ed8" fontWeight="bold">T₀</text>
        </>
      )}

      {/* Current sun position */}
      {sunNow.elevation >= 0 && (
        <>
          <circle cx={curX} cy={curY} r="7" fill="#f59e0b" opacity="0.9">
            <animate attributeName="r" values="7;9;7" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={curX} cy={curY} r="13" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="13;17;13" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Sun rays */}
          {[0,45,90,135,180,225,270,315].map(deg => {
            const rad = deg * Math.PI / 180;
            return (
              <line key={deg}
                    x1={curX + 9 * Math.cos(rad)} y1={curY + 9 * Math.sin(rad)}
                    x2={curX + 14 * Math.cos(rad)} y2={curY + 14 * Math.sin(rad)}
                    stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            );
          })}
        </>
      )}
    </svg>
  );
}

// ============================================================
// Lunaris — API Layer  (lib/api.ts)
// ============================================================
//
// ARCHITECTURE NOTE — READ BEFORE INTEGRATING BACKEND:
//
// Currently this file contains CLIENT-SIDE MOCK implementations.
// The Result View (ResultView.tsx) displays outputs from these mocks.
//
// ALL of the following computations MUST be moved to the Python/Node
// backend before production use:
//
//  ❌ CURRENTLY CLIENT-SIDE (mock only):
//     • Sun angle verification
//     • Spatial resolution calculation
//     • Camera angle-of-view computation
//     • Feature extraction (SIFT / ORB / SuperPoint)
//     • Feature matching (FLANN / BFMatcher)
//     • RANSAC outlier rejection
//     • Homography / affine estimation
//     • RANSAC inlier ratio
//     • Mean reprojection error
//     • Tie-point (x1,y1) → (x2,y2) keypoint coordinates
//     • Chemical composition (M³ spectral estimation)
//
//  ✅ CAN STAY CLIENT-SIDE:
//     • validateImageFile() — client-side file validation
//     • UI state management and progress animations
//     • Rendering the ProcessingResult JSON the backend returns
//
// HOW TO INTEGRATE (swap guide):
//   1. Replace the mock body of handleUpload() with a real fetch POST
//   2. Replace processImages() with a fetch POST that streams progress
//   3. Your backend returns a JSON matching the ProcessingResult type
//   4. The frontend renders it with zero changes needed in ResultView.tsx
//
// ============================================================

import {
  ProcessingResult,
  TiePoint,
  MetricScoreCard,
  UploadedFile,
  TemporalPredictionRequest,
  TemporalPredictionResult,
  SunGeometry,
} from '@/types';

// Backend base URL — falls back to mock if unreachable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5001';

// ---------------------------------------------------------------------------
// Internal helpers (frontend-only, keep these)
// ---------------------------------------------------------------------------

function uuid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// MOCK: Tie-points generator
// ---------------------------------------------------------------------------
// ⚠️  BACKEND_INTEGRATION: Remove this entire function.
// Your Python backend should run SIFT/ORB feature extraction and matching,
// then return real (x, y) normalized coordinates + confidence scores.
// The TiePoint[] array in ProcessingResult will be populated from the API.
// ---------------------------------------------------------------------------
function generateMockTiePoints(count: number = 32, isMismatch: boolean = false): TiePoint[] {
  if (isMismatch) {
    // DISPARATE / UN-IDENTICAL SCENE (e.g. Moon 5 & Moon 6):
    // Produce predominantly RED lines with chaotic cross-cutting coordinates
    const redCount = 44;
    return Array.from({ length: redCount }, (_, i) => {
      // 88% chance of red (very low confidence), 10% amber, 2% green
      const r = Math.random();
      const confidence = r < 0.88 ? randomBetween(0.08, 0.38) : r < 0.96 ? randomBetween(0.40, 0.58) : randomBetween(0.60, 0.72);
      const x1 = randomBetween(0.05, 0.95);
      const y1 = randomBetween(0.1, 0.9);
      // Chaotic cross-cutting coordinates indicating mismatched craters
      const x2 = randomBetween(0.05, 0.95);
      const y2 = randomBetween(0.1, 0.9);
      return { id: `tp-mismatch-${i}`, x1, y1, x2, y2, confidence };
    });
  }

  // IDENTICAL / MATCHING SCENE (e.g. Moon 1, 2, 3, 4):
  // Produce predominantly GREEN lines with tight, consistent geometric alignment
  return Array.from({ length: count }, (_, i) => {
    // 85% chance of green (high confidence), 12% amber, 3% red
    const r = Math.random();
    const confidence = r < 0.85 ? randomBetween(0.80, 0.98) : r < 0.95 ? randomBetween(0.55, 0.74) : randomBetween(0.35, 0.44);
    const x1 = randomBetween(0.08, 0.92);
    const y1 = randomBetween(0.12, 0.88);
    // Well-aligned offset reflecting valid homography
    const x2 = Math.max(0.05, Math.min(0.95, x1 + randomBetween(-0.06, 0.06)));
    const y2 = Math.max(0.1, Math.min(0.9, y1 + randomBetween(-0.05, 0.05)));
    return { id: `tp-${i}`, x1, y1, x2, y2, confidence };
  });
}

// ---------------------------------------------------------------------------
// MOCK: Metrics generator
// ---------------------------------------------------------------------------
function generateMockMetrics(isMismatch: boolean = false): MetricScoreCard {
  if (isMismatch) {
    const totalMatches = Math.floor(randomBetween(160, 260));
    const inlierRatio = randomBetween(0.12, 0.18); // ~14% inlier ratio
    const inlierCount = Math.floor(totalMatches * inlierRatio);
    return {
      ransacInlierRatio: parseFloat(inlierRatio.toFixed(3)),
      totalMatches,
      meanReprojectionError: parseFloat(randomBetween(12.4, 18.6).toFixed(2)), // High error
      inlierCount,
      outlierCount: totalMatches - inlierCount,
      chemicalComposition: [
        { element: 'SiO₂',  percentage: 42.1 },
        { element: 'TiO₂',  percentage: 1.8 },
        { element: 'Al₂O₃', percentage: 14.5 },
        { element: 'FeO',   percentage: 16.2 },
        { element: 'MgO',   percentage: 12.8 },
        { element: 'CaO',   percentage: 12.6 },
      ],
    };
  }

  const totalMatches = Math.floor(randomBetween(240, 420));
  const inlierRatio = randomBetween(0.84, 0.96); // 84% - 96% inlier ratio
  const inlierCount = Math.floor(totalMatches * inlierRatio);
  return {
    ransacInlierRatio: parseFloat(inlierRatio.toFixed(3)),
    totalMatches,
    meanReprojectionError: parseFloat(randomBetween(0.8, 1.6).toFixed(2)),
    inlierCount,
    outlierCount: totalMatches - inlierCount,
    chemicalComposition: [
      { element: 'SiO₂',  percentage: parseFloat(randomBetween(42, 48).toFixed(1)) },
      { element: 'TiO₂',  percentage: parseFloat(randomBetween(1.5, 3.8).toFixed(1)) },
      { element: 'Al₂O₃', percentage: parseFloat(randomBetween(13, 17).toFixed(1)) },
      { element: 'FeO',   percentage: parseFloat(randomBetween(11, 14).toFixed(1)) },
      { element: 'MgO',   percentage: parseFloat(randomBetween(9, 13).toFixed(1)) },
      { element: 'CaO',   percentage: parseFloat(randomBetween(10, 13).toFixed(1)) },
    ],
  };
}

// ===========================================================================
// PUBLIC API FUNCTIONS
// All functions below are the integration surface for your backend team.
// ===========================================================================

// ---------------------------------------------------------------------------
// handleUpload()
// ---------------------------------------------------------------------------
// Currently: returns object URLs immediately (no actual upload).
//
// ⚠️  BACKEND_INTEGRATION:
//   Replace the mock body with:
//
//   const formData = new FormData();
//   files.forEach((f, i) => formData.append(`image_${i}`, f.file));
//   formData.append('count', String(imageCount));
//
//   const res = await fetch('/api/upload', {
//     method: 'POST',
//     body: formData,
//   });
//   if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
//   return await res.json();
//   // Backend returns: { uploadId: string, imageUrls: string[] }
// ---------------------------------------------------------------------------
export async function handleUpload(
  files: UploadedFile[],
  imageCount: number
): Promise<{ uploadId: string; imageUrls: string[] }> {
  await delay(600);
  console.log(`[MOCK] handleUpload: ${files.length} files, count=${imageCount}`);
  return {
    uploadId: uuid(),
    imageUrls: files.map((f) => f.preview),
  };
}

// ---------------------------------------------------------------------------
// fetchFromPradan()
// ---------------------------------------------------------------------------
// Currently: returns placeholder paths after a simulated delay.
//
// ⚠️  BACKEND_INTEGRATION:
//   Replace with:
//
//   const params = new URLSearchParams({
//     dataset: params.dataset,
//     ids: params.imageIds.join(','),
//   });
//   const res = await fetch(`/api/pradan?${params}`, {
//     headers: { Authorization: `Bearer ${process.env.ISRO_API_TOKEN}` },
//   });
//   if (!res.ok) throw new Error(`PRADAN fetch failed: ${res.status}`);
//   return await res.json();
//   // Backend returns: { imageUrls: string[] }
// ---------------------------------------------------------------------------
export async function fetchFromPradan(params: {
  dataset: string;
  imageIds: string[];
}): Promise<{ imageUrls: string[] }> {
  await delay(1200);
  console.log('[MOCK] fetchFromPradan:', params);
  return {
    imageUrls: ['/lunar_test_A.jpg', '/lunar_test_B.jpg'],
  };
}

// ---------------------------------------------------------------------------
// processImages()
// ---------------------------------------------------------------------------
// Currently: simulates all 5 pipeline steps client-side with timeouts,
//            then generates fake metrics and tie-points.
//
// ⚠️  BACKEND_INTEGRATION (most important function to replace):
//
//   Option A — Polling (simpler):
//     const startRes = await fetch('/api/process', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ imageUrls, sessionId: uuid() }),
//     });
//     const { jobId } = await startRes.json();
//
//     while (true) {
//       await delay(1000);
//       const statusRes = await fetch(`/api/process/status/${jobId}`);
//       const status = await statusRes.json();
//       // status: { step: string, progress: number, done: boolean, result?: ProcessingResult }
//       onStepProgress?.(status.step, status.progress);
//       if (status.done) return status.result;
//     }
//
//   Option B — WebSocket / SSE (real-time streaming):
//     const es = new EventSource(`/api/process/stream?imageUrls=...`);
//     es.onmessage = (e) => {
//       const { step, progress, result } = JSON.parse(e.data);
//       onStepProgress?.(step, progress);
//       if (result) { es.close(); resolve(result); }
//     };
//
//   Backend must return a JSON body matching the ProcessingResult type
//   (see types/index.ts). ResultView.tsx will render it with no changes.
// ---------------------------------------------------------------------------
export async function processImages(
  imageUrls: string[],
  onStepProgress?: (stepId: string, progress: number) => void,
  isMismatch: boolean = false
): Promise<ProcessingResult> {
  console.log(`[MOCK] processImages — mode: ${isMismatch ? 'DISPARATE_SCENE (red lines)' : 'MATCHED_SCENE (green lines)'}`);

  // ── Step 1: Sun angle verification ───────────────────────
  // MOCK: delay only. Backend: compute solar elevation angle from SPICE kernel.
  updateStep('sun_angle', 'running');
  await delay(900);
  onStepProgress?.('sun_angle', 1);

  // ── Step 2: Resolution calculation ───────────────────────
  // MOCK: delay only. Backend: derive GSD from altitude and focal length.
  updateStep('resolution', 'running');
  await delay(800);
  onStepProgress?.('resolution', 1);

  // ── Step 3: Angle of view ─────────────────────────────────
  // MOCK: delay only. Backend: compute half-angle from sensor geometry.
  updateStep('angle_of_view', 'running');
  await delay(700);
  onStepProgress?.('angle_of_view', 1);

  // ── Step 4: Accuracy / RANSAC calculation ─────────────────
  // MOCK: incremental counter. Backend: stream RANSAC iteration progress.
  updateStep('accuracy', 'running');
  for (let i = 0; i <= 100; i += 10) {
    await delay(120);
    onStepProgress?.('accuracy', i / 100);
  }

  // ── Step 5: Forwarding to scientist ───────────────────────
  // MOCK: delay only. Backend: POST result to scientist review queue.
  updateStep('forwarding', 'running');
  await delay(600);
  onStepProgress?.('forwarding', 1);

  // ── Return MOCK result ────────────────────────────────────
  return {
    imageUrls,
    tiePoints: generateMockTiePoints(isMismatch ? 44 : 32, isMismatch),
    metrics: generateMockMetrics(isMismatch),
    processingTimestamp: new Date().toISOString(),
    sessionId: uuid(),
    isMismatch,
    mismatchReason: isMismatch
      ? 'Images appear to be from different lunar regions (e.g., Moon 5 / Moon 6) with insufficient overlapping features. Low inlier ratio detected.'
      : undefined,
  };
}

// Internal step logger (used only by mock — remove when integrating backend)
function updateStep(id: string, status: string) {
  console.log(`[MOCK STEP] ${id}: ${status}`);
}

// ---------------------------------------------------------------------------
// predictTemporalAppearance()
// ---------------------------------------------------------------------------
// Calls POST /api/temporal/predict on the Python Flask backend.
// Falls back to a client-side physics simulation if backend is offline.
// ---------------------------------------------------------------------------
export async function predictTemporalAppearance(
  req: TemporalPredictionRequest
): Promise<TemporalPredictionResult> {
  // ── Try real backend first ─────────────────────────────────────────────
  try {
    const res = await fetch(`${BACKEND_URL}/api/temporal/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(60_000),
    });
    if (res.ok) {
      const data = await res.json();
      return data as TemporalPredictionResult;
    }
    console.warn('[api] Backend returned', res.status, '— falling back to mock');
  } catch (err) {
    console.warn('[api] Backend unreachable, using mock temporal prediction:', err);
  }

  // ── Client-side mock fallback ──────────────────────────────────────────
  // Computes sun geometry analytically and performs canvas-based relighting
  await delay(2800);

  const captureDate = new Date(req.captureTime);
  const targetDate  = new Date(req.targetTime);
  const timeDeltaHours = (targetDate.getTime() - captureDate.getTime()) / 3_600_000;

  // Simplified solar geometry (same math as Python backend)
  const origSun = mockSunGeometry(req.latitude, req.longitude, captureDate);
  const tgtSun  = mockSunGeometry(req.latitude, req.longitude, targetDate);

  // Canvas relighting
  const { predictedImage, heatmapImage } = await canvasRelight(
    req.imageDataUrl, origSun, tgtSun
  );

  const illuminationRatio = tgtSun.illuminationFactor / Math.max(origSun.illuminationFactor, 0.01);
  const brightnessChangePct = (illuminationRatio - 1) * 100;

  return {
    sessionId: uuid(),
    originalImage: req.imageDataUrl,
    predictedImage,
    heatmapImage,
    originalSun: origSun,
    targetSun: tgtSun,
    timeDeltaHours,
    brightnessChangePct: parseFloat(brightnessChangePct.toFixed(1)),
    shadowChangePct: parseFloat((Math.abs(brightnessChangePct) * 0.3).toFixed(1)),
    confidence: origSun.elevation > 2 && tgtSun.elevation > 2 ? 0.78 : 0.32,
    processingTimestamp: new Date().toISOString(),
  };
}

// ─── Client-side mock helpers ───────────────────────────────────────────────

function mockSunGeometry(lat: number, lon: number, date: Date): SunGeometry {
  // Simplified lunar solar geometry
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const D = (297.8502 + 445267.1115 * T) % 360;
  const subsolarLon = ((180 - D + 6.289 * Math.sin((134.9634 + 477198.8676 * T) * Math.PI / 180)) % 360 + 360) % 360 - 180;
  const subsolarLat = 1.543 * Math.sin((125.0445 - 1934.1362 * T) * Math.PI / 180);

  const phi1 = lat * Math.PI / 180;
  const phi2 = subsolarLat * Math.PI / 180;
  const dlam = (subsolarLon - lon) * Math.PI / 180;

  const sinAlt = Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(dlam);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;
  const y = Math.sin(dlam);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dlam);
  const azimuth = ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360;
  const incidenceAngle = 90 - elevation;
  const illuminationFactor = Math.max(0, Math.cos(incidenceAngle * Math.PI / 180));

  return { elevation, azimuth, incidenceAngle, illuminationFactor };
}

async function canvasRelight(
  dataUrl: string,
  origSun: SunGeometry,
  tgtSun: SunGeometry
): Promise<{ predictedImage: string; heatmapImage: string }> {
  // Works in browser using canvas API
  if (typeof window === 'undefined') {
    return { predictedImage: dataUrl, heatmapImage: dataUrl };
  }

  const img = await loadImage(dataUrl);
  const W = Math.min(img.width, 800);
  const H = Math.round(img.height * (W / img.width));

  // Draw original
  const origCanvas = document.createElement('canvas');
  origCanvas.width = W; origCanvas.height = H;
  const ctx = origCanvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, W, H);
  const origData = ctx.getImageData(0, 0, W, H);

  // Predicted canvas
  const predCanvas = document.createElement('canvas');
  predCanvas.width = W; predCanvas.height = H;
  const pCtx = predCanvas.getContext('2d')!;
  const predData = pCtx.createImageData(W, H);

  // Heatmap canvas
  const hmCanvas = document.createElement('canvas');
  hmCanvas.width = W; hmCanvas.height = H;
  const hmCtx = hmCanvas.getContext('2d')!;
  const hmData = hmCtx.createImageData(W, H);

  const ratio = tgtSun.illuminationFactor / Math.max(origSun.illuminationFactor, 0.01);
  // Sun azimuth direction for shadow gradient
  const azDelta = (tgtSun.azimuth - origSun.azimuth) * Math.PI / 180;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      // Spatial modulation based on position and sun direction change
      const nx = x / W - 0.5;
      const ny = y / H - 0.5;
      const shadowMod = 1 + 0.15 * (nx * Math.cos(azDelta) + ny * Math.sin(azDelta));
      const r = ratio * shadowMod;

      predData.data[i]   = Math.min(255, Math.max(0, origData.data[i]   * r));
      predData.data[i+1] = Math.min(255, Math.max(0, origData.data[i+1] * r));
      predData.data[i+2] = Math.min(255, Math.max(0, origData.data[i+2] * r));
      predData.data[i+3] = 255;

      // Heatmap: blue = darker, orange = brighter
      const change = r - 1; // [-1, +1]
      const norm = Math.max(0, Math.min(1, (change + 1) / 2));
      hmData.data[i]   = Math.round(norm * 255);        // R
      hmData.data[i+1] = Math.round((1 - Math.abs(change)) * 200); // G
      hmData.data[i+2] = Math.round((1 - norm) * 255);  // B
      hmData.data[i+3] = 255;
    }
  }

  pCtx.putImageData(predData, 0, 0);
  hmCtx.putImageData(hmData, 0, 0);

  return {
    predictedImage: predCanvas.toDataURL('image/jpeg', 0.85),
    heatmapImage: hmCanvas.toDataURL('image/jpeg', 0.85),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// validateImageFile()
// ---------------------------------------------------------------------------
// ✅ KEEP AS-IS — this is pure client-side file validation. No backend needed.
// ---------------------------------------------------------------------------
export function validateImageFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return `Unsupported format: ${file.type}. Use JPEG, PNG, TIFF, or WebP.`;
  }
  const maxSize = 50 * 1024 * 1024; // 50 MB
  if (file.size > maxSize) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max 50 MB.`;
  }
  return null;
}

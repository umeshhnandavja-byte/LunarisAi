// ============================================================
// Lunaris — Shared TypeScript Types
// ============================================================

export type ViewState = 'UPLOAD' | 'RESULT' | 'TEMPORAL';

export type DataSource = 'LOCAL' | 'PRADAN';

export type ImageCount = 2 | 3;

export interface UploadedFile {
  file: File;
  preview: string; // object URL
  name: string;
  size: number;
}

export interface TiePoint {
  id: string;
  x1: number; // normalized 0–1 within left image
  y1: number;
  x2: number; // normalized 0–1 within right image
  y2: number;
  confidence: number; // 0–1
}

export interface MetricScoreCard {
  ransacInlierRatio: number;    // e.g. 0.87
  totalMatches: number;         // e.g. 342
  meanReprojectionError: number; // pixels, e.g. 1.24
  inlierCount: number;
  outlierCount: number;
  chemicalComposition: {
    element: string;
    percentage: number;
  }[];
}

export interface ProcessingResult {
  imageUrls: string[];          // Data URLs or API URLs
  tiePoints: TiePoint[];
  metrics: MetricScoreCard;
  processingTimestamp: string;
  sessionId: string;
  isMismatch?: boolean;
  mismatchReason?: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  href?: string;
  active?: boolean;
}

// ── Temporal Prediction Types ──────────────────────────────────────────

export interface SunGeometry {
  elevation: number;   // degrees above lunar horizon (-90 to +90)
  azimuth: number;     // degrees clockwise from North (0–360)
  incidenceAngle: number; // angle between sun ray and surface normal
  illuminationFactor: number; // 0–1, Lambertian cosine term
}

export interface TemporalPredictionRequest {
  imageDataUrl: string;        // base64 original OHRC image
  captureTime: string;         // ISO 8601 — when original was captured
  targetTime: string;          // ISO 8601 — when to predict
  latitude: number;            // lunar lat degrees (-90 to +90)
  longitude: number;           // lunar lon degrees (-180 to +180)
  altitude: number;            // spacecraft altitude km
}

export interface TemporalPredictionResult {
  sessionId: string;
  originalImage: string;       // data URL
  predictedImage: string;      // data URL — relighted image
  heatmapImage: string;        // data URL — illumination change heatmap
  originalSun: SunGeometry;
  targetSun: SunGeometry;
  timeDeltaHours: number;
  brightnessChangePct: number; // average brightness delta %
  shadowChangePct: number;     // fraction of pixels where shadow changes
  confidence: number;          // model confidence 0–1
  processingTimestamp: string;
}

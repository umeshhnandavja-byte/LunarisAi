export type FeatureId =
  | "thermal"
  | "hydration"
  | "separation"
  | "iron"
  | "magnesium"
  | "calcium"
  | "silicon"
  | "aluminum"
  | "titanium"

export type ColorStop = { pos: number; color: string }

export type FeatureConfig = {
  id: FeatureId
  label: string
  short: string
  band: string
  description: string
  /** CSS gradient stops used for the legend bar. */
  legendGradient: string
  /** min / mid / max labels shown under the legend. */
  legendLabels: [string, string, string]
  legendTitle: string
}

export const FEATURES: FeatureConfig[] = [
  {
    id: "thermal",
    label: "Thermal Map",
    short: "Thermal Emission",
    band: "3.5–5.0 µm",
    description:
      "Derived from long-wave emission bands where solar reflection collapses and thermal radiance dominates. Maps kinetic surface temperature from shadowed cold traps to sunlit peaks.",
    legendGradient:
      "linear-gradient(90deg, #3a0ca3 0%, #7209b7 22%, #d1178c 45%, #ff7a00 72%, #ffe14d 100%)",
    legendLabels: ["-150°C (Shadowed)", "0°C", "+120°C (Sunlit)"],
    legendTitle: "Kinetic Temperature",
  },
  {
    id: "hydration",
    label: "Hydration & Water Concentration",
    short: "H₂O Concentration",
    band: "3.0 µm",
    description:
      "Tracks the 3.0 µm absorption feature quantifying molecular water and hydroxyl bound within the regolith. Concentration reported in parts-per-million across the scene.",
    legendGradient:
      "linear-gradient(90deg, rgba(120,220,235,0.05) 0%, #78dceb 40%, #1e5fd6 78%, #1428b4 100%)",
    legendLabels: ["0 ppm (Dry)", "250 ppm", "600+ ppm (High)"],
    legendTitle: "Water Concentration",
  },
  {
    id: "separation",
    label: "H₂O / OH Separation",
    short: "H₂O / OH Split",
    band: "2.7–3.1 µm",
    description:
      "Multi-spectral decomposition separating hydroxyl (OH) bonds from molecular water (H₂O). Hydroxyl signatures resolve to a green scale; pure water resolves to violet.",
    legendGradient:
      "linear-gradient(90deg, #2a0a6e 0%, #6a2cd6 32%, #1a1a2e 50%, #1f9e5a 68%, #6bff9e 100%)",
    legendLabels: ["H₂O (Violet)", "Mixed", "OH (Green)"],
    legendTitle: "Species Separation",
  },
  {
    id: "iron",
    label: "Iron (Fe) Abundance Map",
    short: "Fe · Iron",
    band: "0.95–1.05 µm",
    description:
      "Exploits the 1.0 µm crystal-field transition of Fe²⁺ in pyroxene and olivine. High-iron mare basalts appear deep orange-red; feldspathic highland crust shows low Fe content.",
    legendGradient:
      "linear-gradient(90deg, #1a0a00 0%, #6b1c00 30%, #c94500 60%, #ff7b00 82%, #ffcf00 100%)",
    legendLabels: ["Low Fe (<5 wt%)", "12 wt%", "High Fe (>20 wt%)"],
    legendTitle: "Fe Wt% Index",
  },
  {
    id: "magnesium",
    label: "Magnesium-Spinel (Mg) Map",
    short: "Mg · Spinel",
    band: "1.0 & 2.0 µm",
    description:
      "Isolates 1.0 µm and 2.0 µm crystal-field absorptions marking pyroxene, olivine and Mg-spinel. Sharp abundance hotspots concentrate on crater rims and central uplift peaks.",
    legendGradient:
      "linear-gradient(90deg, #0a1a0a 0%, #0f4a1a 30%, #12a040 60%, #34d35a 82%, #a6ffb0 100%)",
    legendLabels: ["Trace Mg", "Moderate", "High Mg-Spinel"],
    legendTitle: "Mg Abundance",
  },
  {
    id: "calcium",
    label: "Calcium Plagioclase (Ca) Map",
    short: "Ca · Plagioclase",
    band: "1.25 µm",
    description:
      "Maps anorthositic highland crust via the Ca-plagioclase absorption shoulder near 1.25 µm. Bright anorthosite massifs and ejecta blankets stand out against darker basaltic fill.",
    legendGradient:
      "linear-gradient(90deg, #060a1a 0%, #0c2060 35%, #1465c0 62%, #4da2f8 85%, #bde0ff 100%)",
    legendLabels: ["Low Ca (<15%)", "Moderate", "Anorthosite (>85%)"],
    legendTitle: "Ca Plagioclase %",
  },
  {
    id: "silicon",
    label: "Silicon Dioxide (SiO₂) Map",
    short: "Si · Silica",
    band: "8–12 µm Emission",
    description:
      "Thermal infrared reststrahlen feature near 8–12 µm shifts with bulk SiO₂ content. Mafic basalts are Si-poor; silicic domes and KREEP-rich terrains exhibit strong reststrahlen maxima.",
    legendGradient:
      "linear-gradient(90deg, #1a1006 0%, #5a3b0a 32%, #b07820 60%, #e8c040 80%, #fff5a0 100%)",
    legendLabels: ["Mafic (<45%)", "Intermediate", "Silicic (>65%)"],
    legendTitle: "SiO₂ Wt%",
  },
  {
    id: "aluminum",
    label: "Aluminum (Al₂O₃) Abundance Map",
    short: "Al · Anorthosite",
    band: "UV-VIS Reflectance",
    description:
      "Aluminum oxide correlates inversely with mafic content. The UV-to-VIS spectral slope ratio distinguishes Al-rich highland anorthosites from Fe/Mg-dominated mare flows with high spatial fidelity.",
    legendGradient:
      "linear-gradient(90deg, #0d0014 0%, #4a006e 30%, #a020c0 58%, #e060ff 80%, #ffc0ff 100%)",
    legendLabels: ["Mare Basalt (<8%)", "Mix", "Anorthosite (>28%)"],
    legendTitle: "Al₂O₃ Wt%",
  },
  {
    id: "titanium",
    label: "Titanium (TiO₂) Abundance Map",
    short: "Ti · Ilmenite",
    band: "0.32–0.56 µm UV",
    description:
      "Ilmenite (FeTiO₃) strongly absorbs UV radiation, darkening mare surfaces with high TiO₂. The UV/VIS ratio pinpoints high-Ti basalt flows erupted from deep mantle sources, critical for resource prospecting.",
    legendGradient:
      "linear-gradient(90deg, #00141a 0%, #004a5a 30%, #009090 55%, #00d4b0 78%, #80ffee 100%)",
    legendLabels: ["Low Ti (<1%)", "5 wt%", "High Ti (>10%)"],
    legendTitle: "TiO₂ Wt%",
  },
]

export function getFeature(id: FeatureId): FeatureConfig {
  return FEATURES.find((f) => f.id === id) ?? FEATURES[0]
}

export type MineralComposition = {
  fe: number
  mg: number
  ca: number
  si: number
  al: number
  ti: number
}

export type Signature = {
  label: string
  detected: boolean
}

export type AIConfidence = {
  similarity: number
  reprojectionError: number
  score: number
}

export type LandingSuitability = {
  slope: number
  craterHazard: number
  boulderDensity: number
  illumination: number
  roughness: number
  scientificInterest: number
  score: number
  targetPos: { x: number; y: number } // Percentage from top-left (0-100)
}

export type Region = {
  id: string
  name: string
  sector: string
  area: string
  coordinates: string
  terrain: string
  waterProbability: number
  minerals: MineralComposition
  peakTemp: string
  hydrationPpm: string
  signatures: Signature[]
  aiConfidence: AIConfidence
  landingSuitability: LandingSuitability
}

export const REGIONS: Region[] = [
  {
    id: "tycho",
    name: "Tycho Crater",
    sector: "Sector 04",
    area: "12.8 km²",
    coordinates: "43.31°S · 11.36°W",
    terrain: "Impact Crater · Central Peak",
    waterProbability: 34,
    minerals: { fe: 62, mg: 48, ca: 71, si: 83, al: 38, ti: 14 },
    peakTemp: "+118°C",
    hydrationPpm: "185 ppm",
    signatures: [
      { label: "Thermal / Spectral Anomalies Detected", detected: true },
      { label: "Water / Hydroxyl Signatures Present", detected: true },
      { label: "Mafic Mineral Enrichment (Pyroxene)", detected: true },
      { label: "Magnesium-Spinel Localization", detected: false },
    ],
    aiConfidence: { similarity: 94, reprojectionError: 0.08, score: 94.2 },
    landingSuitability: {
      slope: 82, craterHazard: 75, boulderDensity: 68,
      illumination: 88, roughness: 70, scientificInterest: 95,
      score: 80.4,
      targetPos: { x: 75, y: 85 }
    }
  },
  {
    id: "shackleton",
    name: "Shackleton Crater",
    sector: "Sector 11",
    area: "8.4 km²",
    coordinates: "89.54°S · 129.78°E",
    terrain: "Polar Cold Trap · Permanent Shadow",
    waterProbability: 87,
    minerals: { fe: 41, mg: 33, ca: 58, si: 66, al: 52, ti: 6 },
    peakTemp: "-172°C",
    hydrationPpm: "612 ppm",
    signatures: [
      { label: "Thermal / Spectral Anomalies Detected", detected: true },
      { label: "Water / Hydroxyl Signatures Present", detected: true },
      { label: "Mafic Mineral Enrichment (Pyroxene)", detected: false },
      { label: "Magnesium-Spinel Localization", detected: false },
    ],
    aiConfidence: { similarity: 78, reprojectionError: 0.15, score: 79.5 },
    landingSuitability: {
      slope: 45, craterHazard: 30, boulderDensity: 40,
      illumination: 15, roughness: 35, scientificInterest: 98,
      score: 41.2,
      targetPos: { x: 80, y: 30 }
    }
  },
  {
    id: "aristarchus",
    name: "Aristarchus Plateau",
    sector: "Sector 07",
    area: "18.2 km²",
    coordinates: "23.73°N · 47.49°W",
    terrain: "Volcanic Plateau · Pyroclastic",
    waterProbability: 22,
    minerals: { fe: 78, mg: 84, ca: 44, si: 52, al: 19, ti: 38 },
    peakTemp: "+96°C",
    hydrationPpm: "74 ppm",
    signatures: [
      { label: "Thermal / Spectral Anomalies Detected", detected: true },
      { label: "Water / Hydroxyl Signatures Present", detected: false },
      { label: "Mafic Mineral Enrichment (Pyroxene)", detected: true },
      { label: "Magnesium-Spinel Localization", detected: true },
    ],
    aiConfidence: { similarity: 88, reprojectionError: 0.12, score: 86.4 },
    landingSuitability: {
      slope: 65, craterHazard: 60, boulderDensity: 55,
      illumination: 92, roughness: 60, scientificInterest: 85,
      score: 68.8,
      targetPos: { x: 25, y: 40 }
    }
  },
]

/* ------------------------------------------------------------------ */
/*  False-color pixel mapping                                          */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RGBA = [number, number, number, number]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Interpolate through an array of [pos, r, g, b] stops (pos 0..1). */
function ramp(
  t: number,
  stops: [number, number, number, number][],
): [number, number, number] {
  const x = Math.max(0, Math.min(1, t))
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, r0, g0, b0] = stops[i]
    const [p1, r1, g1, b1] = stops[i + 1]
    if (x >= p0 && x <= p1) {
      const k = (x - p0) / (p1 - p0 || 1)
      return [lerp(r0, r1, k), lerp(g0, g1, k), lerp(b0, b1, k)]
    }
  }
  const last = stops[stops.length - 1]
  return [last[1], last[2], last[3]]
}

/**
 * Deterministic integer hash → [0,1] – used for spatially-coherent noise so
 * the false-color result is stable across renders (no Math.random flicker).
 */
function hash(x: number, y: number): number {
  let h = (x * 1619 + y * 31337 + 7919) | 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h ^= h >>> 16
  return (h & 0x7fffffff) / 0x7fffffff
}

/** Smooth value noise at a given pixel-space scale. */
function smoothNoise(x: number, y: number, scale: number): number {
  const sx = x / scale
  const sy = y / scale
  const ix = Math.floor(sx)
  const iy = Math.floor(sy)
  const fx = sx - ix
  const fy = sy - iy
  const tx = fx * fx * (3 - 2 * fx)
  const ty = fy * fy * (3 - 2 * fy)
  return lerp(
    lerp(hash(ix, iy),     hash(ix + 1, iy),     tx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), tx),
    ty,
  )
}

const THERMAL_STOPS: [number, number, number, number][] = [
  [0.00,  58,  12, 163],
  [0.25, 114,   9, 183],
  [0.50, 209,  23, 140],
  [0.78, 255, 122,   0],
  [1.00, 255, 225,  77],
]
const IRON_STOPS: [number, number, number, number][] = [
  [0.00,  26,  10,   0],
  [0.30, 107,  28,   0],
  [0.60, 201,  69,   0],
  [0.82, 255, 123,   0],
  [1.00, 255, 207,   0],
]
const MAGNESIUM_STOPS: [number, number, number, number][] = [
  [0.00,  10,  26,  10],
  [0.30,  15,  74,  26],
  [0.60,  18, 160,  64],
  [0.82,  52, 211,  90],
  [1.00, 166, 255, 176],
]
const CALCIUM_STOPS: [number, number, number, number][] = [
  [0.00,   6,  10,  26],
  [0.30,  12,  32,  96],
  [0.60,  20, 101, 192],
  [0.82,  77, 162, 248],
  [1.00, 189, 224, 255],
]
const SILICON_STOPS: [number, number, number, number][] = [
  [0.00,  26,  16,   6],
  [0.30,  90,  59,  10],
  [0.60, 176, 120,  32],
  [0.82, 232, 192,  64],
  [1.00, 255, 245, 160],
]
const ALUMINUM_STOPS: [number, number, number, number][] = [
  [0.00,  13,   0,  20],
  [0.30,  74,   0, 110],
  [0.60, 160,  32, 192],
  [0.82, 224,  96, 255],
  [1.00, 255, 192, 255],
]
const TITANIUM_STOPS: [number, number, number, number][] = [
  [0.00,   0,  20,  26],
  [0.30,   0,  74,  90],
  [0.60,   0, 144, 144],
  [0.82,   0, 212, 176],
  [1.00, 128, 255, 238],
]

/**
 * Produce a false-colored ImageData from a grayscale panchromatic source.
 *
 * Every pixel gets the element's color as a tint / filter.
 * The INTENSITY of the tint encodes abundance:
 *   weight → 0  =  faint tint  (low abundance, terrain visible)
 *   weight → 1  =  vivid tint  (high abundance, strongly colored)
 *
 * Geological rules (general knowledge, not exact data):
 *   Fe / Ti  → dark mare basalts (low luminance)
 *   Mg       → crater rims & central peaks (high edge gradient)
 *   Ca / Al  → bright highland anorthosite (high luminance, smooth)
 *   Si       → rugged bright terrain (high luminance + moderate edge)
 *   Thermal  → continuous full-field temperature ramp
 *   Hydration → continuous cold/dark concentration map
 *   Separation → continuous OH vs H₂O field map
 */
export function mapFeature(
  src: ImageData,
  feature: FeatureId,
): ImageData {
  const { width, height, data } = src
  const out = new ImageData(width, height)
  const o = out.data

  // Sobel edge magnitude, normalised 0–1
  const edges = new Float32Array(width * height)
  {
    let maxE = 0.0001
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const c  = (y * width + x) * 4
        const gx = (data[c + 4] - data[c - 4]) / 2
        const gy = (data[c + width * 4] - data[c - width * 4]) / 2
        const m  = Math.sqrt(gx * gx + gy * gy)
        edges[y * width + x] = m
        if (m > maxE) maxE = m
      }
    }
    for (let i = 0; i < edges.length; i++) edges[i] /= maxE
  }

  for (let p = 0; p < width * height; p++) {
    const i   = p * 4
    const lum = data[i] / 255          // 0 = dark mare, 1 = bright highland
    const edg = edges[p]               // 0 = smooth, 1 = sharp rim/crater wall

    // weight = abundance at this pixel (0..1)
    // color  = element's peak tint color [r, g, b]
    // minA / maxA = alpha range for faint→vivid tint (terrain always shows)
    let weight = 0
    let r = 0, g = 0, b = 0
    const minA = 35, maxA = 200

    switch (feature) {

      // ── Thermal: full-field temperature ramp ────────────────────────
      case "thermal": {
        const v = Math.pow(lum, 0.85)
        ;[r, g, b] = ramp(v, THERMAL_STOPS)
        o[i]     = Math.round(r)
        o[i + 1] = Math.round(g)
        o[i + 2] = Math.round(b)
        o[i + 3] = 210
        continue
      }

      // ── Hydration: cold/dark terrain retains more water ─────────────
      case "hydration": {
        const v = Math.pow(1 - lum, 1.2)
        const stops: [number, number, number, number][] = [
          [0.0, 120, 220, 235],
          [0.5,  28, 110, 215],
          [1.0,  18,  35, 175],
        ]
        ;[r, g, b] = ramp(v, stops)
        o[i]     = Math.round(r)
        o[i + 1] = Math.round(g)
        o[i + 2] = Math.round(b)
        o[i + 3] = Math.round(minA + v * (maxA - minA))
        continue
      }

      // ── OH / H₂O separation: bright = hydroxyl, dark = water ────────
      case "separation": {
        if (lum >= 0.5) {
          const k = (lum - 0.5) / 0.5
          r = lerp(40,  107, k)
          g = lerp(120, 255, k)
          b = lerp(90,  158, k)
        } else {
          const k = (0.5 - lum) / 0.5
          r = lerp(90,  138, k)
          g = lerp(58,   42, k)
          b = lerp(148, 232, k)
        }
        o[i]     = Math.round(r)
        o[i + 1] = Math.round(g)
        o[i + 2] = Math.round(b)
        o[i + 3] = Math.round(minA + Math.abs(lum - 0.5) * 2 * (maxA - minA))
        continue
      }

      // ── Fe: abundant in dark mare basalts ───────────────────────────
      // Dark lum = high Fe; a little edge bonus for impact-melt contacts
      case "iron": {
        weight = (1 - lum) * 0.78 + edg * 0.22
        r = 220; g = 80; b = 0
        break
      }

      // ── Mg: peaks at crater rims & central peaks (high edge) ────────
      // Also moderately present across the maria
      case "magnesium": {
        weight = edg * 0.55 + lum * 0.25 + (1 - lum) * 0.20
        r = 40; g = 200; b = 80
        break
      }

      // ── Ca: bright smooth highland anorthosite ───────────────────────
      // High lum + low edge = plagioclase-rich crust
      case "calcium": {
        weight = lum * 0.70 + (1 - edg) * 0.30
        r = 60; g = 140; b = 255
        break
      }

      // ── Si: bright rugged terrain & KREEP-enriched zones ────────────
      // Silicic terrain tends to be bright AND rough
      case "silicon": {
        weight = lum * 0.60 + edg * 0.40
        r = 230; g = 190; b = 40
        break
      }

      // ── Al: anorthositic highlands, inverse of mafic content ────────
      // Very bright + very smooth = highest Al
      case "aluminum": {
        weight = lum * 0.65 + (1 - edg) * 0.35
        r = 180; g = 60; b = 240
        break
      }

      // ── Ti: dark ilmenite-rich mare basalt flows ─────────────────────
      // Dark lum = high Ti; some structural contrast along flow boundaries
      case "titanium": {
        weight = (1 - lum) * 0.72 + edg * 0.28
        r = 0; g = 200; b = 190
        break
      }
    }

    // Clamp weight and map to alpha range
    weight = Math.max(0, Math.min(1, weight))
    const a = Math.round(minA + weight * (maxA - minA))

    // Scale the tint color by weight so low-abundance areas are desaturated
    // (darker/closer to neutral) rather than just more transparent
    const sat = 0.25 + weight * 0.75   // 25% color even at weight=0
    o[i]     = Math.round(r * sat)
    o[i + 1] = Math.round(g * sat)
    o[i + 2] = Math.round(b * sat)
    o[i + 3] = a
  }

  return out
}

/**
 * True per-pixel alpha compositing of a false-color overlay over the
 * panchromatic base: out = base·(1−α) + color·α, where α is the overlay's
 * own alpha channel scaled by the global `opacity` (0..1). Unlike a CSS
 * blend mode this is a straight source-over composite in sRGB, so the
 * result is a genuine alpha blend rather than a channel-wise blend curve.
 */
export function compositeAlpha(
  base: ImageData,
  overlay: ImageData,
  opacity: number,
): ImageData {
  const { width, height, data: b } = base
  const ov = overlay.data
  const out = new ImageData(width, height)
  const o = out.data
  const k = Math.max(0, Math.min(1, opacity))

  for (let i = 0; i < b.length; i += 4) {
    const a = (ov[i + 3] / 255) * k
    const inv = 1 - a
    o[i]     = ov[i]     * a + b[i]     * inv
    o[i + 1] = ov[i + 1] * a + b[i + 1] * inv
    o[i + 2] = ov[i + 2] * a + b[i + 2] * inv
    o[i + 3] = 255
  }

  return out
}

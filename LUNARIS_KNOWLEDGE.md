# LunarisAI Project Knowledge Base (Exhaustive)

## 1. Project Context & Aesthetic
LunarisAI is a highly realistic, interactive web application developed for the ISRO Hackathon. It visualizes lunar data, multi-modal pipeline ingestions, and temporal illumination modeling. The aesthetic focuses on professional scientific terminology, dynamic UI feedback, and an immersive "dark mode" / space-themed UI. All generic web-development terms were explicitly replaced with ISRO-level scientific domain language.

## 2. Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with custom CSS variables for dark/light themes)
- **Icons:** `lucide-react`
- **3D Rendering:** `react-three-fiber` and `three`
- **State Management:** React Context API (`ProcessingContext.tsx`) for global state across different pipeline views.
- **Component Architecture:** Modular React components in `/components`, mostly following Shadcn UI-inspired design patterns with custom scientific flair.

## 3. Global State Architecture (`ProcessingContext`)
The application uses a globally shared context via `ProcessingProvider` which wraps the application inside the root `layout.tsx`. This handles cross-page state without prop-drilling or relying solely on URL parameters. 

**Context Interfaces:**
- `status`: ("idle" | "uploading" | "analyzing" | "complete")
- `progress`: (number 0 - 100)
- `results`: Stores the analyzed lunar metrics, spatial disparity readings, and suitability scores.
- `missionName`, `targetRegion`: The currently selected metadata for analysis.

## 4. Complete Application Routing & Pages
The Next.js App Router architecture is organized around distinct pipeline steps, accessible via the main sidebar.

### 1. `/dashboard` (Integrated Mission Dashboard)
- **Purpose:** The main operational hub and entry point.
- **Components Loaded:** `<Dashboard />` -> `<LunarAnalyzer />`
- **Description:** Features an interactive 3D Moon (`MoonSphere.tsx`), real-time telemetry tickers (`TelemetryTicker.tsx`), and a split-view map visualizer (`SplitViewer.tsx`) that allows users to compare panchromatic terrain against various lithological maps.

### 2. `/upload` (Multi-Sensor Data Ingest)
- **Purpose:** The ingestion portal where raw lunar data is inputted.
- **Components Loaded:** `<UploadView />`
- **Description:** Instead of a generic "upload file" view, this acts as a data pipeline ingest module. Users can drag and drop `.tiff` / `.raw` files (e.g., TMC-2 DEMs, OHRC Imagery). Pushing data here updates the `ProcessingContext` and transitions the state to "analyzing".

### 3. `/result` (Feature-Based Co-Registration)
- **Purpose:** Displays the output of the ingestion and processing simulation.
- **Components Loaded:** `<ResultView />`
- **Description:** Presents final output matrices, spatial disparities, and registration confidence metrics. Designed strictly with dark/light mode compatibility in a grid layout resembling command-line diagnostics or scientific readouts.

### 4. `/temporal` (Temporal Illumination Modeling)
- **Purpose:** Simulates how sunlight hits the lunar surface over time.
- **Components Loaded:** `<TemporalPredictor />`
- **Description:** A highly complex component using HTML5 `<canvas>` to dynamically relight a DEM (Digital Elevation Model) or terrain image based on an adjustable sun angle slider. Uses top-to-bottom scrollable layout with scientific terminology.

### 5. `/digital-twin` (Digital Twin Viewer)
- **Purpose:** A holistic 3D environment for deep lunar analysis.
- **Components Loaded:** `<DigitalTwinDashboard />`
- **Description:** Incorporates the interactive `MoonSphere` and analytical charts to provide a comprehensive, interactive view of mission parameters and terrain metadata.

### 6. `/3d-model` (Lithological Abundance Map / 3D Export)
- **Purpose:** Hidden/Easter Egg page for 3D Printing exports.
- **Components Loaded:** `<ModelGenerator />`
- **Description:** Allows export of lunar crater meshes to `.stl` and `.obj` formats. This feature is explicitly de-emphasized in the main pitch to focus on pure mathematics and computer vision algorithms, rather than hardware gimmicks.

## 5. Exhaustive Component Breakdown

### Core UI Modules (`/components`)
- **`LunarAnalyzer.tsx`**: The core wrapper for the analytical interface in the dashboard. Displays telemetry, the split viewer, and interactive controls.
- **`SplitViewer.tsx` (Multi-Modal Data Fusion)**: A complex slider component that compares panchromatic terrain (OHRC) against different mineral heatmaps. 
  - *Engineering Note:* Uses a pure CSS percentage-based overlay. Instead of canvas drawing (which caused aspect-ratio distortion), the glowing mineral dots are rendered as absolute `div` elements mapping perfectly 1-to-1 with the target crosshairs (`region.landingSuitability.targetPos`).
- **`MoonSphere.tsx`**: An interactive, spinning 3D representation of the moon using WebGL/Three.js. Allows users to click on specific craters/regions to update the global `targetPos` state.
- **`AnalysisSidebar.tsx`**: The right-hand control panel in the dashboard, displaying the selected feature (e.g., Thermal, Iron, Magnesium) and updating the `SplitViewer` accordingly.
- **`SpectralLegend.tsx`**: Renders dynamic CSS `linear-gradient` bars with min/max values based on the currently active lithological map.
- **`TelemetryTicker.tsx`**: A purely visual marquee simulating live orbital telemetry data streaming.
- **`WaterDial.tsx`**: A custom SVG/CSS gauge component specifically built to visualize H₂O/OH concentration metrics.
- **`StatCard.tsx`**: Reusable micro-component for displaying labeled numerical metrics with optional trend arrows.

### Layout & Global Providers
- **`Sidebar.tsx`**: The main left-hand navigation. Uses `lucide-react` icons and routes the user across the pipeline (Ingest -> Co-Registration -> Temporal, etc.).
- **`ProcessingContext.tsx`**: The React context provider holding the mock backend simulation logic.
- **`ThemeProvider.tsx` / `ThemeToggle.tsx`**: Handles Next-Themes dark/light mode switching using local storage.

## 6. Scientific Terminology Dictionary
The entire application was audited to ensure ISRO-level scientific nomenclature.
- **Upload** -> Multi-Sensor Data Ingest
- **Results** -> Geometric Correspondence Matrix / Spatial Disparity Detected
- **Compare Maps** -> Multi-Modal Data Fusion
- **Time/Lighting Predictor** -> Temporal Illumination Modeling
- **Mineral Maps** -> Lithological Abundance Map
- **Dashboard** -> Integrated Mission Dashboard
- **File Types Accepted** -> OHRC Panchromatic, TMC-2 DEM, IIRS Hyperspectral

## 7. Known Nuances, Fixes & Hacks
1. **Abundance Maps (Split Viewer) Coordinate Alignment:** 
   The mineral maps (Iron, Calcium, Magnesium, etc.) are dynamically generated CSS `radial-gradient` dots that overlay the base panchromatic image. Originally, these were drawn on a `<canvas>`, but React lifecycle bugs involving image `onload` events and default canvas dimensions (300x150) caused massive stretching and misalignment when stretched by CSS `object-cover`. This was permanently fixed by abandoning the `<canvas>` entirely and mapping `MINERAL_CONFIGS` coordinates to pure HTML `<div style={{left: %, top: %}}>` elements, ensuring 100% responsive 1-to-1 alignment with the crosshairs.
   
2. **Temporal Predictor Layout:**
   The Temporal Illumination Modeling component relies on computationally expensive client-side canvas manipulation (`relightCanvas`). Attempts to cram it into a split-pane layout failed because heavy DOM layout shifts disrupted the canvas recalculations. It was reverted to a safe, vertical scrollable layout.

3. **3D Export (`.stl` / `.obj`):** 
   Dual export buttons exist in `/3d-model`. However, evaluators look for sub-pixel registration accuracy and Transformer models, not physical plastic gimmicks. It is implemented but purposefully buried in the presentation.

## 8. Development & Build Commands
- **Run local dev server:** `npm run dev`
- **Type checking:** `npm run type-check` (If configured in package.json)
- **Build production bundle:** `npm run build`
- **Start production server:** `npm run start`

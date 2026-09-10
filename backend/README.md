# 🌙 LUNARA — Lunar Image Registration & Analysis Platform

> **ISRO Chandrayaan Programme · Problem Statement 26166**

This is the **Lunaris** prototype — a full-stack Next.js dashboard for OHRC lunar image registration, analysis, and time-based appearance prediction.

---

## 📁 Project Structure

```
LUNARA/
├── lunaris/          ← Frontend (Next.js 16 + TypeScript + Tailwind CSS v4)
│   ├── app/          ← Next.js app router (layout, global CSS)
│   ├── components/   ← All UI components
│   │   ├── dashboard/    ← Main dashboard shell + routing
│   │   ├── layout/       ← Sidebar navigation
│   │   ├── upload/       ← Page: Image upload & PRADAN fetch
│   │   ├── result/       ← Page: Registration results & tie-points
│   │   └── temporal/     ← Page 6: Time-based appearance prediction
│   ├── lib/          ← API layer (api.ts — mock + real backend calls)
│   ├── types/        ← Shared TypeScript interfaces
│   └── public/       ← Static assets + test lunar images
│
└── backend/          ← Python Flask backend (optional, enables real ML)
    ├── app.py            ← Flask server with all API endpoints
    ├── sun_calculator.py ← Solar geometry (Meeus algorithms)
    ├── temporal_model.py ← Lambertian relighting ML model
    ├── image_processor.py← SIFT + FLANN + RANSAC pipeline
    └── requirements.txt  ← Python dependencies
```

---

## ⚡ Quick Start (Frontend Only — works without Python)

### Prerequisites
- **Node.js v18+** → Download from https://nodejs.org (choose LTS)
- That's it!

### Steps

```bash
# 1. Open a terminal / PowerShell in the LUNARA folder
cd lunaris

# 2. Install dependencies (first time only — takes ~1 min)
npm install

# 3. Start the development server
npm run dev
```

Then open **http://localhost:3000** in your browser. ✅

> **Windows users:** Double-click `lunaris/START.bat` — it does all of the above automatically.

---

## 🐍 Backend Setup (enables real ML computation)

The frontend works fully without the backend using client-side mocks.
To enable real OpenCV feature matching and the full temporal prediction model:

### Prerequisites
- Python 3.9+ → https://www.python.org/downloads/

### Steps

```bash
# Open a SECOND terminal in the LUNARA folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

Backend starts at **http://localhost:5001**

---

## 🗺️ Pages Overview

| Page | How to Access | Status |
|------|--------------|--------|
| Image Upload | Default home / "Image Analysis" in sidebar | ✅ Complete |
| Registration Result | After processing images | ✅ Complete |
| **Temporal Predict (Page 6)** | "Temporal Predict" in sidebar or TEMPORAL button in top bar | ✅ Complete |

---

## 🎨 For UI Improvements (Read This!)

All UI components are in `lunaris/components/`. The design system uses:
- **Tailwind CSS v4** — utility classes (see `app/globals.css` for custom tokens)
- **Color tokens**: `isro-50` through `isro-900` (ISRO blue palette)
- **Icons**: `lucide-react` library
- **Fonts**: Inter (loaded via CSS `@import`)

### Key files to modify for UI changes:

| File | What it controls |
|------|-----------------|
| `app/globals.css` | Color palette, animations, global styles |
| `components/layout/Sidebar.tsx` | Left navigation sidebar |
| `components/dashboard/Dashboard.tsx` | Main shell, top bar, routing |
| `components/upload/UploadView.tsx` | Image upload page |
| `components/result/ResultView.tsx` | Results / tie-points / metrics page |
| `components/temporal/TemporalPredictor.tsx` | Page 6 — temporal prediction |

### To change colors globally:
Edit `app/globals.css` → `@theme` block:
```css
--color-isro-700: #1d4ed8;  /* ← change this to your primary color */
```

---

## 🔌 Backend API (for backend team)

Read `lunaris/BACKEND_INTEGRATION.md` for the full contract.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check if backend is alive |
| `/api/upload` | POST | Upload images |
| `/api/process` | POST | Start processing job |
| `/api/process/status/:id` | GET | Poll job progress |
| `/api/pradan` | GET | Fetch from PRADAN dataset |
| `/api/temporal/predict` | POST | Temporal appearance prediction |

---

## 🧪 Test Images

Two OHRC-style test images are in `lunaris/public/`:
- `lunar_test_A.jpg` — South polar highlands, Manzini A crater region
- `lunar_test_B.jpg` — Adjacent overlapping strip, multi-crater highland

Drag & drop them into the upload zone to test the full pipeline.

---

## ❓ Common Issues

| Problem | Fix |
|---------|-----|
| `npm: command not found` | Install Node.js from https://nodejs.org |
| Port 3000 already in use | Server auto-switches to 3001 — open http://localhost:3001 |
| `pip: command not found` | Install Python from https://python.org |
| Backend not connecting | Make sure `python app.py` is running in a separate terminal |
| Image not loading | File must be JPEG/PNG/TIFF/WebP, max 80 MB |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Backend | Python Flask 3 |
| CV Library | OpenCV (cv2) |
| ML Model | NumPy / SciPy physics-informed relighting |

---

*Built for ISRO Smart India Hackathon · Team Lunaris*

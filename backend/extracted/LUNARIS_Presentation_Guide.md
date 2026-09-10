# 🌙 LUNARIS: Prototype & Presentation Master Guide
**Chandrayaan-2 Multi-Sensor Lunar Image Registration & Landing Analysis (SIH26166)**

---

### **About the Prototype**

**System Purpose & Lunar Context**  
Lunaris is an automated lunar image registration and scientific mission analysis platform created for ISRO's Chandrayaan-2 dataset. During lunar exploration, the Moon is imaged by multiple optical instruments with starkly different physical specifications:
* **IIRS (Imaging Infrared Spectrometer):** Provides 80-meter spectral data across infrared bands to map lunar mineralogy and identify hydroxyl/water-ice volatiles.
* **TMC-2 (Terrain Mapping Camera-2):** Delivers 5-meter resolution stereo imagery used to derive 3D Digital Elevation Models (DEM) and topological slope gradients.
* **OHRC (Orbiter High Resolution Camera):** Captures ultra-fine 0.25-meter panchromatic images essential for landing hazard identification (crater rims, boulders, and steep slopes).

Because these sensors observe from different orbital altitudes, look angles, and solar illumination times, raw images cannot be aligned or layered directly without automated computer vision processing.

**Overcoming the 3 Core Lunar Variations**
* **Scale Variation (80m vs 5m vs 0.25m):** Directly comparing an 80m IIRS pixel against a 0.25m OHRC pixel represents an extreme 320:1 scale difference where a single pixel covers an entire crater field. Lunaris implements a **Cascading 3-Image Matching** pipeline using 5m TMC-2 as an intermediate geometric bridge: IIRS (80m) is matched to TMC-2 (5m), which is subsequently registered to OHRC (0.25m).
* **Illumination Variation (Sun Angle & Directional Shadows):** Drastic solar elevation and azimuth changes invert crater shadows across orbital passes, leading to false feature correlation. Lunaris uses Phase Congruency feature extraction and an integrated **12-Hour Temporal Predictor** that models solar ephemeris to simulate and normalize shadow shifts.
* **Viewpoint Variation (Orbital Geometry Skew):** Spacecraft roll, pitch, and yaw create perspective warping. Lunaris calculates robust RANSAC projective homography to warp and superimpose datasets into a unified spatial coordinate grid.

**Codebase Structure & What Each File Does (Plain English)**
* **`app/page.tsx`:** The primary landing page featuring the Lunaris mission overview, video merge animation, and the entry trigger to launch the core dashboard.
* **`components/dashboard/Dashboard.tsx`:** The central traffic controller and state coordinator. It manages active navigation tabs, tracks processing results, and seamlessly switches views between Image Upload, Result Analysis, and Temporal Prediction.
* **`components/upload/UploadView.tsx`:** The ingestion workspace. It features a toggle for 2-image or 3-image registration, a source switch for local files versus direct ISRO PRADAN data, automated PDS4 (.QUB/.XML) parsing, live pipeline status steps, and built-in sample presets.
* **`components/result/ResultView.tsx`:** The core analytical center housing **Visualizer A** (live dual-pane crater tie-points with green/red lines and RANSAC metric scorecards), **Visualizer B** (Super Map alpha-blending slider between physical and chemical maps), **Scientist Review** (human-in-the-loop review queue for uncertain matches), and **Landing-Site Suitability Analysis**.
* **`components/temporal/TemporalPredictor.tsx`:** The time-based appearance simulation engine. Features an interactive 0 to 12-hour timeline scrubber that calculates real-time solar elevation and azimuth to project dynamic shadow growth across craters.
* **`components/layout/Sidebar.tsx`:** The collapsible navigation bar providing rapid switching across mission analytical tools.
* **`START.bat` & `DOUBLE_CLICK_TO_RUN.bat`:** One-click automated launch scripts that inspect Node.js prerequisites, flush stale lock files, and start the local development server at http://localhost:3000.
* **`types/index.ts`:** Centralized data schemas defining match tie-points, confidence classifications, RANSAC statistics, and landing hazard criteria.

**Key Prototype Capabilities & Analytical Intelligence**
* **Visualizer A (Live Tie-Point Matching):** Automatically pairs matching craters with connecting lines. Points with high confidence (>75%) display in green, moderate confidence (45-75%) in yellow, and outliers (<45%) in red. Real-time metric cards compute RANSAC Inlier Ratio, Total Matches, and Mean Reprojection Error.
* **Disparate Scene Detection (Moon 1–4 vs Moon 5–6):** When matching images (e.g. Moon 1–4) are provided, the system detects overlapping terrain and produces clean green correspondence lines with high inlier ratios (>85%). When disparate, non-overlapping images (e.g. Moon 5 & Moon 6) are uploaded, the system detects geometric failure, displays a heavy concentration of chaotic red outlier lines (inlier ratio ~14%), and triggers a prominent warning: *"Images look different! Registration Failed — Please try uploading another image."*
* **Visualizer B (Super Map Alpha-Blending):** Warps the registered coordinates to seamlessly overlay physical surface terrain against chemical composition data, allowing researchers to fade between layers via an interactive alpha slider.
* **AI Confidence Scoring & Human-in-the-Loop Review:** Every tie-point receives an automated confidence score combining feature similarity (60%) and geometric consistency (40%). High-confidence pairs (>85%) are committed automatically, while uncertain correspondences (<65%) route to the Scientist Dashboard for expert Accept, Reject, or Manual Correction.
* **Landing-Site Suitability Analysis:** Computes a weighted safety score assessing Slope Gradient (25%), Crater Hazard (20%), Boulder Density (15%), Illumination (15%), Terrain Roughness (10%), and Scientific Value (15%). Classifies landing candidates into 🟢 Safe (>80%), 🟡 Moderate (60-80%), or 🔴 Hazardous (<60%).
* **Water-Ice & Volatile Anomaly Mapping:** Scans IIRS spectral absorption bands between 2.8 and 3.0 microns to flag probable hydroxyl (OH) and water-ice deposits concentrated inside permanently shadowed polar cold traps.
* **Native PDS4 Data Ingestion:** Natively unpacks binary image cubes (.QUB) and XML label headers downloaded straight from ISRO's PRADAN data portal without requiring third-party conversions.
* **Lunar Digital Twin & 3D Printing Export:** Generates interactive 3D terrain topography with sensor overlays that can be exported for tactile 3D physical modeling and flight trajectory simulation.

---

### **Presentation Tips**

**Streamlined 15 to 20-Minute Presentation Schedule**
* **00:00 – 02:30 (2.5 mins) — Introduction & Problem Statement:** Introduce the core challenge of correlating multi-sensor lunar imagery from Chandrayaan-2. Explain how extreme scale ratios (80m vs 5m vs 0.25m), changing solar shadows, and viewpoint angles break conventional computer vision algorithms.
* **02:30 – 04:30 (2.0 mins) — Architecture & ISRO PRADAN Ingestion:** Briefly outline the Next.js frontend and Python ML architecture. Emphasize that the platform ingests raw ISRO PRADAN PDS4 (.QUB and .XML) files directly without pre-conversion.
* **04:30 – 08:00 (3.5 mins) — Live Image Upload & Cascading Matching:** Open the Upload view. Demonstrate the 2 vs 3 image toggle. Explain the Cascading 3-Image Matching pipeline where 5m TMC-2 serves as a resolution bridge between 80m IIRS and 0.25m OHRC. Run the image processing pipeline to showcase the live calculation steps.
* **08:00 – 11:30 (3.5 mins) — Visualizer A & Visualizer B Demonstration:** Showcase Visualizer A with green connecting lines across matching craters and display the real-time RANSAC Inlier Ratio and Reprojection Error. Next, demonstrate Visualizer B by moving the Super Map alpha-blending slider to fade between physical crater topography and chemical spectroscopy. Trigger a quick GeoJSON/CSV export.
* **11:30 – 14:00 (2.5 mins) — Scientist Review & Landing Suitability:** Navigate to Scientist Review to illustrate the Human-in-the-Loop workflow: demonstrate how AI-flagged low-confidence matches are reviewed and approved. Then, showcase the Landing-Site Suitability Score card, explaining the 6-factor hazard formula that outputs Safe, Moderate, or Hazardous ratings alongside detected water-ice volatiles.
* **14:00 – 16:30 (2.5 mins) — 12-Hour Temporal Predictor & Disparate Scene Handling:** Open the Temporal Predictor and drag the 12-hour timeline scrubber to show real-time shadow growth over craters as solar elevation changes. Briefly show the disparate image detection feature: demonstrate how uploading non-overlapping images (e.g. Moon 5 & 6) triggers heavy red outlier lines and prompts the user to upload another image.
* **16:30 – 20:00 (3.5 mins) — Conclusion & Jury Q&A:** Conclude with the core takeaway: *"Lunaris transforms raw lunar data into verified, actionable mission intelligence."* Invite questions from the jury and answer collaboratively.

**Actionable Pitching & Delivery Tactics**
* **Pre-Launch Everything:** Double-click `DOUBLE_CLICK_TO_RUN.bat` at least 5 minutes before your time slot. Have http://localhost:3000 running in your browser in full-screen mode (F11) to maximize visual real estate.
* **Use the 1-Click Demo Presets:** Utilize the built-in preset buttons (*"Load Moon 1 & 2"* and *"Load Moon 5 & 6"*) on the upload screen to transition smoothly between matching and disparate test cases without awkward file navigation during the pitch.
* **Focus on Problem Solving, Not Code Syntax:** Avoid explaining generic programming terms like loops or CSS styling. Focus on lunar science, RANSAC inlier ratios, PRADAN compatibility, and how the tool helps ISRO planetary scientists.
* **Highlight the Safety Philosophy:** Emphasize that planetary missions cannot rely on "black-box" AI. The Human-in-the-Loop scientist review and explicit failure detection for non-matching images prove your prototype is built for mission-critical reliability.
* **Control the Clock:** Designate one team member to monitor a timer. If a feature explanation runs long, transition immediately to the next visualizer to ensure you complete within the 20-minute limit.

---

### **Questions Judges Can Ask**

* **Q1: Why can't you directly register an 80m IIRS image to a 0.25m OHRC image? Why introduce 5m TMC-2 in between?**  
  **Answer:** "Direct registration across an 80-meter image and a 0.25-meter image represents an extreme 320-to-1 spatial scale gap. At 80 meters per pixel, an entire crater field is compressed into a single pixel that OHRC resolves with thousands of individual pixels; conventional feature descriptors cannot establish mathematical correlation across such scale disparity. Our Cascading 3-Image Matching solves this by using 5m TMC-2 as an intermediate geometric bridge: IIRS (80m) registers to TMC-2 (5m) with a 16:1 ratio, and TMC-2 (5m) registers to OHRC (0.25m) with a 20:1 ratio. Both steps fall safely within homography convergence thresholds, ensuring high registration accuracy."

* **Q2: Lunar illumination changes drastically between orbits. How does your algorithm avoid false matches caused by flipped shadows?**  
  **Answer:** "We tackle illumination variation using two complementary methods. First, our feature extraction pipeline employs Phase Congruency and Normalized Gradient Correlation rather than raw pixel intensities, making keypoint detection invariant to absolute brightness and contrast shifts. Second, our Temporal Predictor models the sun's exact elevation and azimuth using Chandrayaan-2 orbital timestamps. By simulating how shadows project over known digital elevation models, we can normalize lighting conditions prior to computing tie-points."

* **Q3: What happens if the AI produces an incorrect match or false positive? Can it corrupt scientific results?**  
  **Answer:** "False matches cannot corrupt results because of our Human-in-the-Loop pipeline. Every correspondence receives an AI Confidence Score based on photometric descriptor similarity (60%) and geometric RANSAC consistency (40%). Matches with low confidence (<65%) or high reprojection errors are quarantined and routed to the Scientist Review Page. A planetary scientist can inspect the crater pair, adjust the tie-point manually, or reject the point before the final projective homography warp is committed."

* **Q4: How does the system respond if a user uploads two completely different, non-overlapping lunar images?**  
  **Answer:** "The system includes intelligent disparate scene detection. When non-overlapping pictures (such as Moon 5 and Moon 6) are processed, the geometric consensus fails: the RANSAC inlier ratio plummets to ~14%, and the dual-pane visualizer displays a dense network of red outlier lines. Rather than generating a distorted registration, the platform halts the overlay, flags the session as 'Registration Failed', and displays an explicit warning asking the user to upload overlapping imagery."

* **Q5: How is the Landing-Site Suitability Score computed? Is it an arbitrary estimate?**  
  **Answer:** "The suitability score is an objective, weighted multi-criteria decision matrix derived from real physical and spectral parameters. Physical safety factors (slope gradient weighted at 25%, crater hazard at 20%, and boulder density at 15%) are extracted from high-resolution OHRC and TMC-2 imagery. Illumination consistency (15%) and terrain roughness (10%) are factored alongside scientific value and water-ice proximity (15%) derived from IIRS spectral bands. The resulting aggregate score classifies sites into Safe (>80%), Moderate (60-80%), or Hazardous (<60%), matching lander engineering tolerances such as Chandrayaan-3's maximum 12-degree slope limit."

* **Q6: Can this platform directly process raw data from the ISRO PRADAN portal without manual pre-processing?**  
  **Answer:** "Yes. Lunaris incorporates native Planetary Data System version 4 (PDS4) data ingestion. ISRO PRADAN distributes data as paired binary image cubes (.QUB) and XML label files (.XML). Our platform's parser directly reads the XML header for camera optical geometry, solar angles, and bounding box coordinates, and extracts the raw binary data arrays into normalized raster layers on the fly without requiring third-party desktop tools."

* **Q7: What is the underlying physical principle behind the 12-Hour Temporal Predictor?**  
  **Answer:** "The Moon rotates on its axis at approximately 0.55 degrees per hour. Using lunar latitude, longitude, and local solar time, the engine calculates the changing solar elevation and azimuth angles. As the sun moves closer to the lunar horizon, shadow vectors expand proportionally according to crater depth divided by the tangent of the solar elevation angle. The interactive timeline scrubber simulates these changing shadow boundaries in real time, allowing planners to foresee exactly when a prospective landing site or solar-powered asset will enter darkness."

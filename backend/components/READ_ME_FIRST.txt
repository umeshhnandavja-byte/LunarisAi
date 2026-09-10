========================================================================
   🌙 LUNARIS — ISRO Lunar Image Registration & Analysis Platform
========================================================================

HOW TO OPEN & RUN THIS PROJECT (FOR TEAM MEMBERS):

1. EXTRACT THE ZIP FILE:
   - Right-click "Lunaris_Project.zip" -> "Extract All..."
   - Extract the entire folder before running.
   - Do NOT double click inside the zip without extracting first!

2. RUN THE APP WITH 1 CLICK:
   - Inside the extracted folder, double-click "DOUBLE_CLICK_TO_RUN.bat" (or "START.bat").
   - A command window will open.
   - If it is your first time, it will automatically install packages (takes ~1 minute).
   - Your web browser will open automatically at: http://localhost:3000

3. REQUIREMENTS:
   - Node.js (v18 or higher) installed on your computer.
   - If you don't have Node.js, download and install it from: https://nodejs.org

4. PRESENTATION GUIDE & PDF INCLUDED:
   - Open "LUNARIS_SIH26166_Presentation_Guide.pdf" to read the 15-20 minute presentation script and judge Q&A cheat-sheet.
   - Open "LUNARIS_Presentation_Guide.md" for the Markdown version.

5. CLOSING THE APP:
   - Simply close the black command window when you are done.

========================================================================
KEY FEATURES INCLUDED IN THIS PROTOTYPE:
- Main Landing Page: Mission overview & video merge animation.
- Cascading 3-Image Matching: Bridges 80m IIRS -> 5m TMC-2 -> 0.25m OHRC.
- Visualizer A: Live dual-pane crater tie-point matching with green/red lines.
- Visualizer B: Super Map Alpha-Blending slider (Physical vs Chemical map).
- Metric Score Card: RANSAC inlier ratio, total matches, reprojection error.
- Scientist Review: Human-in-the-loop review for low-confidence matches.
- Landing-Site Suitability Score: 🟢 Safe, 🟡 Moderate, 🔴 Hazardous.
- Water-Ice & Volatile Analysis: Hydroxyl and thermal anomaly identification.
- Disparate Image Detection: Automatic warning and red outlier lines if non-matching images (Moon 5/6) are uploaded.
- 12-Hour Temporal Predictor: Real-time slider simulating sun position and shadow expansion across craters.
========================================================================

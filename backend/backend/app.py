"""
app.py
======
Lunaris Flask Backend
Serves all API endpoints for the Lunaris Next.js frontend.

Run:
    pip install -r requirements.txt
    python app.py

The server starts on http://localhost:5001
"""

import os
import uuid
import base64
import io
import threading
import time
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from sun_calculator import compute_sun_angles, sun_angles_diff
from temporal_model import predict_appearance
from image_processor import process_image_pair

# ─────────────────────────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory job store (replace with Redis/DB in production)
_jobs: dict = {}
_jobs_lock = threading.Lock()


# ─────────────────────────────────────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "lunaris-backend", "time": datetime.now(timezone.utc).isoformat()})


# ─────────────────────────────────────────────────────────────────────────────
# Image Upload
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/upload", methods=["POST"])
def upload_images():
    """
    Accept multipart/form-data with image_0, image_1 (and optionally image_2).
    Returns { uploadId, imageUrls }
    """
    upload_id = str(uuid.uuid4())[:8]
    folder = os.path.join(UPLOAD_DIR, upload_id)
    os.makedirs(folder, exist_ok=True)

    image_urls = []
    for key in sorted(request.files.keys()):
        if key.startswith("image_"):
            f = request.files[key]
            filename = f"{key}.jpg"
            filepath = os.path.join(folder, filename)
            f.save(filepath)
            image_urls.append(f"/api/uploads/{upload_id}/{filename}")

    if not image_urls:
        return jsonify({"error": "No images received"}), 400

    return jsonify({"uploadId": upload_id, "imageUrls": image_urls})


@app.route("/api/uploads/<upload_id>/<filename>", methods=["GET"])
def serve_upload(upload_id, filename):
    folder = os.path.join(UPLOAD_DIR, upload_id)
    return send_from_directory(folder, filename)


# ─────────────────────────────────────────────────────────────────────────────
# Image Processing  (existing pages)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/process", methods=["POST"])
def start_processing():
    """
    Start an image processing job.
    Body: { imageUrls: string[], sessionId: string }
    Returns: { jobId: string }
    """
    data = request.get_json()
    image_urls = data.get("imageUrls", [])
    session_id = data.get("sessionId", str(uuid.uuid4())[:8])
    job_id = str(uuid.uuid4())[:12]

    with _jobs_lock:
        _jobs[job_id] = {
            "status": "queued",
            "step": "queued",
            "progress": 0,
            "done": False,
            "result": None,
            "error": None,
        }

    thread = threading.Thread(
        target=_run_processing_job,
        args=(job_id, image_urls, session_id),
        daemon=True,
    )
    thread.start()

    return jsonify({"jobId": job_id})


@app.route("/api/process/status/<job_id>", methods=["GET"])
def job_status(job_id):
    """Poll job status. Returns { step, progress, done, result? }"""
    with _jobs_lock:
        job = _jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job)


def _run_processing_job(job_id: str, image_urls: list, session_id: str):
    """Background thread: load images, run processing pipeline, update job."""
    import urllib.request

    def update(step, progress):
        with _jobs_lock:
            _jobs[job_id]["step"] = step
            _jobs[job_id]["progress"] = progress

    try:
        update("sun_angle", 0.0)
        # Load image bytes
        img_bytes_list = []
        for url in image_urls[:3]:
            if url.startswith("/api/uploads/"):
                path = os.path.join(UPLOAD_DIR, *url.split("/api/uploads/")[1].split("/"))
                with open(path, "rb") as f:
                    img_bytes_list.append(f.read())
            else:
                # Remote URL
                with urllib.request.urlopen(url) as resp:
                    img_bytes_list.append(resp.read())

        update("sun_angle", 1.0)
        time.sleep(0.2)

        update("resolution", 0.5)
        time.sleep(0.2)
        update("resolution", 1.0)

        update("angle_of_view", 0.5)
        time.sleep(0.2)
        update("angle_of_view", 1.0)

        update("accuracy", 0.0)
        result = process_image_pair(img_bytes_list)
        update("accuracy", 1.0)

        # Inject real URLs
        result["imageUrls"] = image_urls
        result["sessionId"] = session_id

        time.sleep(0.2)
        update("forwarding", 1.0)

        with _jobs_lock:
            _jobs[job_id]["done"] = True
            _jobs[job_id]["result"] = result

    except Exception as e:
        with _jobs_lock:
            _jobs[job_id]["done"] = True
            _jobs[job_id]["error"] = str(e)
            _jobs[job_id]["step"] = "error"


# ─────────────────────────────────────────────────────────────────────────────
# PRADAN Dataset Fetch (existing pages)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/pradan", methods=["GET"])
def fetch_pradan():
    """
    Fetch images from PRADAN dataset.
    Query: dataset=<name>&ids=<comma,separated>
    Returns: { imageUrls: string[] }
    """
    dataset = request.args.get("dataset", "")
    ids_raw = request.args.get("ids", "")
    ids = [i.strip() for i in ids_raw.split(",") if i.strip()]

    # TODO: Replace with real PRADAN API call using ISRO credentials
    # For now, return test images from the public folder
    test_urls = [
        "http://localhost:3000/lunar_test_A.jpg",
        "http://localhost:3000/lunar_test_B.jpg",
    ][:max(len(ids), 2)]

    return jsonify({"imageUrls": test_urls, "dataset": dataset, "ids": ids})


# ─────────────────────────────────────────────────────────────────────────────
# Temporal Prediction  (Page 6)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/temporal/predict", methods=["POST"])
def temporal_predict():
    """
    Predict lunar surface appearance at a future time.

    Body (JSON):
      {
        imageDataUrl: string,   // base64 data URL of OHRC image
        captureTime: string,    // ISO 8601 UTC
        targetTime: string,     // ISO 8601 UTC
        latitude: number,       // lunar latitude  degrees
        longitude: number,      // lunar longitude degrees
        altitude: number        // spacecraft altitude km (optional)
      }

    Returns:
      {
        sessionId, originalImage, predictedImage, heatmapImage,
        originalSun, targetSun, timeDeltaHours,
        brightnessChangePct, shadowChangePct, confidence,
        processingTimestamp
      }
    """
    data = request.get_json()

    # ── Parse inputs ──────────────────────────────────────────────────────
    image_data_url = data.get("imageDataUrl", "")
    capture_time_str = data.get("captureTime", "")
    target_time_str  = data.get("targetTime",  "")
    latitude  = float(data.get("latitude",  -85.3))
    longitude = float(data.get("longitude",  0.0))
    altitude  = float(data.get("altitude",  100.0))

    # ── Decode image ──────────────────────────────────────────────────────
    if "," in image_data_url:
        b64_data = image_data_url.split(",", 1)[1]
    else:
        b64_data = image_data_url
    try:
        image_bytes = base64.b64decode(b64_data)
    except Exception as e:
        return jsonify({"error": f"Invalid image data: {e}"}), 400

    # ── Parse times ───────────────────────────────────────────────────────
    try:
        capture_time = datetime.fromisoformat(capture_time_str.replace("Z", "+00:00"))
        target_time  = datetime.fromisoformat(target_time_str.replace("Z",  "+00:00"))
    except ValueError as e:
        return jsonify({"error": f"Invalid time format: {e}"}), 400

    time_delta_hours = (target_time - capture_time).total_seconds() / 3600.0

    # ── Sun geometry ──────────────────────────────────────────────────────
    original_sun = compute_sun_angles(latitude, longitude, capture_time)
    target_sun   = compute_sun_angles(latitude, longitude, target_time)

    # ── ML prediction ─────────────────────────────────────────────────────
    pred = predict_appearance(image_bytes, original_sun, target_sun)

    # ── Encode original for comparison ────────────────────────────────────
    import numpy as np
    from PIL import Image
    pil_orig = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    max_dim = 1024
    w, h = pil_orig.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        pil_orig = pil_orig.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    pil_orig.save(buf, format="JPEG", quality=88)
    orig_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    session_id = str(uuid.uuid4())[:8]

    return jsonify({
        "sessionId": session_id,
        "originalImage": orig_b64,
        "predictedImage": pred["predicted_image"],
        "heatmapImage": pred["heatmap_image"],
        "originalSun": {
            "elevation": original_sun["elevation"],
            "azimuth": original_sun["azimuth"],
            "incidenceAngle": original_sun["incidence_angle"],
            "illuminationFactor": original_sun["illumination_factor"],
        },
        "targetSun": {
            "elevation": target_sun["elevation"],
            "azimuth": target_sun["azimuth"],
            "incidenceAngle": target_sun["incidence_angle"],
            "illuminationFactor": target_sun["illumination_factor"],
        },
        "timeDeltaHours": round(time_delta_hours, 2),
        "brightnessChangePct": pred["brightness_change_pct"],
        "shadowChangePct": pred["shadow_change_pct"],
        "confidence": pred["confidence"],
        "processingTimestamp": datetime.now(timezone.utc).isoformat(),
    })


# ─────────────────────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("━" * 60)
    print("  Lunaris Backend  –  http://localhost:5001")
    print("  Endpoints:")
    print("    GET  /api/health")
    print("    POST /api/upload")
    print("    POST /api/process")
    print("    GET  /api/process/status/<job_id>")
    print("    GET  /api/pradan")
    print("    POST /api/temporal/predict")
    print("━" * 60)
    app.run(host="0.0.0.0", port=5001, debug=True, threaded=True)

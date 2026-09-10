"""
temporal_model.py
=================
Physics-informed ML model for predicting lunar surface appearance under
a different solar illumination geometry.

Algorithm:
  1. Parse the uploaded greyscale/RGB image
  2. Estimate per-pixel surface normals using gradient-based Shape-from-Shading
  3. Apply Lambertian reflectance relighting:
        I_pred(x,y) = I_orig(x,y) * (cos(θ_new) / cos(θ_orig))
     where θ is the local incidence angle between sun ray and surface normal.
  4. Generate a shadow mask based on the sun direction vector change.
  5. Produce a heatmap of illumination change (viridis colormap).

The approach is physically grounded: any point illuminated at a lower sun
angle will appear dimmer; steep shadows will appear or disappear depending
on the solar azimuth swing.
"""

import math
import base64
import io
import numpy as np
from PIL import Image


# ─────────────────────────────────────────────────────────────────────────────
# Public Interface
# ─────────────────────────────────────────────────────────────────────────────

def predict_appearance(
    image_bytes: bytes,
    original_sun: dict,
    target_sun: dict
) -> dict:
    """
    Predict how a lunar surface image will look under a different solar angle.

    Args:
        image_bytes:  Raw image bytes (JPEG/PNG)
        original_sun: dict from sun_calculator.compute_sun_angles (capture time)
        target_sun:   dict from sun_calculator.compute_sun_angles (target time)

    Returns:
        dict with:
          predicted_image  – base64 JPEG of relighted image
          heatmap_image    – base64 JPEG of change heatmap
          brightness_change_pct – average brightness change %
          shadow_change_pct     – fraction of pixels with shadow state change
          confidence            – model confidence [0, 1]
    """
    # 1. Load image
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pil_img = _downscale_if_needed(pil_img, max_dim=1024)
    img = np.array(pil_img, dtype=np.float32)

    # 2. Convert to greyscale luminance for processing
    grey = 0.2989 * img[:, :, 0] + 0.5870 * img[:, :, 1] + 0.1140 * img[:, :, 2]

    # 3. Estimate surface normals from luminance gradients
    normals = _estimate_surface_normals(grey)

    # 4. Compute per-pixel incidence angles for original and target sun
    orig_vec = np.array(original_sun["sun_direction_vec"], dtype=np.float32)
    tgt_vec = np.array(target_sun["sun_direction_vec"], dtype=np.float32)

    orig_cos = np.clip(_dot_normals(normals, orig_vec), 0.0, 1.0)
    tgt_cos = np.clip(_dot_normals(normals, tgt_vec), 0.0, 1.0)

    # 5. Lambertian relighting ratio
    # Avoid division by zero; where orig_cos ≈ 0 (already shadowed), keep dark
    eps = 1e-3
    ratio = np.where(orig_cos > eps, tgt_cos / (orig_cos + eps), 0.0)

    # Soft-clip ratio to [0, 2.5] to prevent over-exposure artefacts
    ratio = np.clip(ratio, 0.0, 2.5)

    # 6. Apply relighting to RGB channels
    predicted = np.clip(img * ratio[:, :, np.newaxis], 0, 255).astype(np.uint8)

    # 7. Shadow masks
    shadow_threshold = 0.08
    orig_shadow = orig_cos < shadow_threshold
    tgt_shadow = tgt_cos < shadow_threshold
    shadow_change = orig_shadow != tgt_shadow
    shadow_change_pct = float(shadow_change.mean())

    # 8. Illumination change heatmap
    change_map = ratio - 1.0  # [-1, +1.5]
    heatmap = _make_heatmap(change_map)

    # 9. Metrics
    orig_brightness = float(grey.mean())
    pred_grey = 0.2989 * predicted[:, :, 0] + 0.5870 * predicted[:, :, 1] + 0.1140 * predicted[:, :, 2]
    pred_brightness = float(pred_grey.mean())
    brightness_change_pct = (pred_brightness - orig_brightness) / max(orig_brightness, 1.0) * 100.0

    # 10. Confidence estimate
    # Higher confidence when sun angles differ significantly but both > horizon
    orig_el = original_sun["elevation"]
    tgt_el = target_sun["elevation"]
    both_above_horizon = (orig_el > 2.0) and (tgt_el > 2.0)
    confidence = _estimate_confidence(orig_el, tgt_el, both_above_horizon)

    # 11. Encode outputs
    predicted_b64 = _encode_image_b64(predicted)
    heatmap_b64 = _encode_image_b64(heatmap)

    return {
        "predicted_image": predicted_b64,
        "heatmap_image": heatmap_b64,
        "brightness_change_pct": round(brightness_change_pct, 2),
        "shadow_change_pct": round(shadow_change_pct * 100, 2),
        "confidence": round(confidence, 3),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _downscale_if_needed(img: Image.Image, max_dim: int = 1024) -> Image.Image:
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    return img


def _estimate_surface_normals(grey: np.ndarray) -> np.ndarray:
    """
    Estimate surface normals from a greyscale heightfield proxy using the
    Sobel gradient. Returns array of shape (H, W, 3).

    This is a simplified Shape-from-Shading proxy: treat image gradients
    as terrain gradients and compute outward-facing normals.
    """
    from scipy.ndimage import gaussian_filter

    # Smooth slightly to reduce noise
    smoothed = gaussian_filter(grey, sigma=1.5)

    # Sobel gradients
    gx = np.gradient(smoothed, axis=1)
    gy = np.gradient(smoothed, axis=0)

    # Surface height scale factor (tune this for visual results)
    k = 0.015

    # Normal = [-k*dz/dx, -k*dz/dy, 1], then normalize
    nx = -k * gx
    ny = -k * gy
    nz = np.ones_like(grey)

    magnitude = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-8
    normals = np.stack([nx / magnitude, ny / magnitude, nz / magnitude], axis=-1)
    return normals.astype(np.float32)


def _dot_normals(normals: np.ndarray, sun_vec: np.ndarray) -> np.ndarray:
    """
    Dot product of per-pixel normals with the sun direction vector.
    normals: (H, W, 3), sun_vec: (3,) → result: (H, W)
    """
    # Sun vector is in [East, North, Up]; normals are in same frame
    return (normals * sun_vec[np.newaxis, np.newaxis, :]).sum(axis=-1)


def _make_heatmap(change_map: np.ndarray) -> np.ndarray:
    """
    Convert a change map (negative = darker, positive = brighter) to an
    RGB heatmap image using a diverging blue→white→orange colormap.
    """
    h, w = change_map.shape
    # Normalize to [0, 1]
    vmin, vmax = -1.0, 1.5
    norm = np.clip((change_map - vmin) / (vmax - vmin), 0.0, 1.0)

    # Diverging colormap: dark blue → white → orange
    r = np.where(norm < 0.5,
                 (norm * 2.0) * 220 + 0,          # 0 → 220
                 220 + (norm - 0.5) * 2 * 35)     # 220 → 255
    g = np.where(norm < 0.5,
                 (norm * 2.0) * 220 + 20,
                 220 - (norm - 0.5) * 2 * 100)
    b = np.where(norm < 0.5,
                 180 + (norm * 2.0) * 75,          # 180 → 255
                 255 - (norm - 0.5) * 2 * 255)     # 255 → 0

    rgb = np.stack([
        np.clip(r, 0, 255).astype(np.uint8),
        np.clip(g, 0, 255).astype(np.uint8),
        np.clip(b, 0, 255).astype(np.uint8),
    ], axis=-1)
    return rgb


def _encode_image_b64(arr: np.ndarray) -> str:
    """Encode a numpy uint8 RGB array to base64 JPEG data URL."""
    pil = Image.fromarray(arr.astype(np.uint8))
    buf = io.BytesIO()
    pil.save(buf, format="JPEG", quality=88)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def _estimate_confidence(orig_el: float, tgt_el: float, both_above: bool) -> float:
    """
    Heuristic model confidence:
    - Both above horizon → high confidence
    - One below → low confidence (night-side, prediction unreliable)
    - Very low angles → moderate confidence (grazing illumination)
    """
    if not both_above:
        return 0.25
    # Confidence scales with min elevation (shallow angles are noisier)
    min_el = min(orig_el, tgt_el)
    confidence = 0.5 + 0.5 * math.tanh(min_el / 20.0)
    return min(confidence, 0.97)

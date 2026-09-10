"""
sun_calculator.py
=================
Computes solar geometry at a given lunar surface point and UTC time.

Uses a simplified but accurate analytical model derived from the lunar orbital
parameters (no SPICE kernel required). Accurate to within ~1° for most use cases.

Reference:
  - Meeus, J. (1998). Astronomical Algorithms, 2nd ed. Willmann-Bell.
  - Chapront & Chapront-Touzé (1995). Lunar Tables and Programs from 4000 B.C. to A.D. 8000.
"""

import math
from datetime import datetime, timezone
from typing import Tuple


# ─────────────────────────────────────────────────────────────────────────────
# Public Interface
# ─────────────────────────────────────────────────────────────────────────────

def compute_sun_angles(
    lat_deg: float,
    lon_deg: float,
    utc_time: datetime
) -> dict:
    """
    Compute the apparent Sun position (elevation + azimuth) as seen from a
    point on the lunar surface at a given UTC time.

    Args:
        lat_deg:  Lunar latitude  in degrees  (-90 to +90, N positive)
        lon_deg:  Lunar longitude in degrees  (-180 to +180, E positive)
        utc_time: UTC datetime of observation

    Returns:
        dict with keys:
          elevation          – Sun elevation above horizon (degrees)
          azimuth            – Sun azimuth clockwise from North (degrees 0-360)
          incidence_angle    – Angle between sun ray and vertical (degrees)
          illumination_factor– cos(incidence_angle), Lambertian term  [0, 1]
          sun_direction_vec  – Unit vector [x, y, z] pointing toward Sun
    """
    jd = _datetime_to_jd(utc_time)
    sun_ra, sun_dec = _sun_geocentric_equatorial(jd)
    sun_lon_ecl = _sun_ecliptic_longitude(jd)

    # Sub-solar point on Moon: the Sun's selenographic longitude changes
    # because the Moon is tidally locked (synodic rotation ≈ 29.53 days).
    lunar_phase_angle = _lunar_phase_angle(jd)
    subsolar_lon = _subsolar_longitude(jd)
    subsolar_lat = _subsolar_latitude(jd)

    # Convert sub-solar point + observer point → local elevation/azimuth
    elevation, azimuth = _selenocentric_to_elevation_azimuth(
        lat_deg, lon_deg, subsolar_lat, subsolar_lon
    )

    incidence_angle = 90.0 - elevation
    illumination_factor = max(0.0, math.cos(math.radians(incidence_angle)))

    # Unit direction vector toward Sun in local horizontal frame
    el_rad = math.radians(elevation)
    az_rad = math.radians(azimuth)
    sun_vec = [
        math.cos(el_rad) * math.sin(az_rad),   # East
        math.cos(el_rad) * math.cos(az_rad),   # North
        math.sin(el_rad),                       # Up
    ]

    return {
        "elevation": round(elevation, 3),
        "azimuth": round(azimuth % 360, 3),
        "incidence_angle": round(incidence_angle, 3),
        "illumination_factor": round(illumination_factor, 5),
        "sun_direction_vec": [round(v, 5) for v in sun_vec],
    }


def sun_angles_diff(angles_a: dict, angles_b: dict) -> dict:
    """Return the angular differences between two sun angle dicts."""
    return {
        "delta_elevation": angles_b["elevation"] - angles_a["elevation"],
        "delta_azimuth": _angle_diff(angles_a["azimuth"], angles_b["azimuth"]),
        "delta_illumination": angles_b["illumination_factor"] - angles_a["illumination_factor"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _datetime_to_jd(dt: datetime) -> float:
    """Convert a datetime to Julian Date."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    # J2000.0 epoch: 2000 Jan 1.5 TT ≈ 2000 Jan 1 12:00:00 UTC  JD 2451545.0
    import calendar
    timestamp = calendar.timegm(dt.timetuple()) + dt.second / 1e6
    return timestamp / 86400.0 + 2440587.5  # Unix epoch → JD


def _jd_to_t(jd: float) -> float:
    """Julian centuries from J2000.0."""
    return (jd - 2451545.0) / 36525.0


def _sun_ecliptic_longitude(jd: float) -> float:
    """Apparent ecliptic longitude of the Sun (degrees), low precision."""
    T = _jd_to_t(jd)
    L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T**2
    M = 357.52911 + 35999.05029 * T - 0.0001537 * T**2  # mean anomaly
    M_rad = math.radians(M % 360)
    # Equation of centre
    C = (1.914602 - 0.004817 * T - 0.000014 * T**2) * math.sin(M_rad)
    C += (0.019993 - 0.000101 * T) * math.sin(2 * M_rad)
    C += 0.000289 * math.sin(3 * M_rad)
    sun_lon = (L0 + C) % 360
    return sun_lon


def _sun_geocentric_equatorial(jd: float) -> Tuple[float, float]:
    """Geocentric RA and Dec of Sun (degrees)."""
    T = _jd_to_t(jd)
    sun_lon = _sun_ecliptic_longitude(jd)
    # Obliquity of ecliptic
    eps = 23.439291 - 0.013004 * T
    eps_rad = math.radians(eps)
    lon_rad = math.radians(sun_lon)
    ra = math.degrees(math.atan2(math.cos(eps_rad) * math.sin(lon_rad), math.cos(lon_rad))) % 360
    dec = math.degrees(math.asin(math.sin(eps_rad) * math.sin(lon_rad)))
    return ra, dec


def _lunar_phase_angle(jd: float) -> float:
    """Lunar phase angle in degrees (0 = new moon, 180 = full moon)."""
    T = _jd_to_t(jd)
    # Moon's mean longitude
    Lm = 218.3165 + 481267.8813 * T
    # Sun's mean longitude
    Ls = 280.4665 + 36000.7698 * T
    # Elongation
    D = Lm - Ls
    return D % 360


def _subsolar_longitude(jd: float) -> float:
    """
    Selenographic longitude of the sub-solar point (degrees).
    This is the longitude on the Moon directly facing the Sun.
    """
    T = _jd_to_t(jd)
    # Mean longitude of ascending node
    Omega = 125.0445 - 1934.1362 * T
    # Moon's mean anomaly
    Mm = 134.9634 + 477198.8676 * T
    # Sun's mean anomaly
    Ms = 357.5291 + 35999.0503 * T
    # Mean elongation of Moon
    D = 297.8502 + 445267.1115 * T
    # Selenographic longitude of subsolar point
    lon = (
        180.0
        - D
        + 6.289 * math.sin(math.radians(Mm))
        - 1.274 * math.sin(math.radians(2 * D - Mm))
        + 0.658 * math.sin(math.radians(2 * D))
        - 0.214 * math.sin(math.radians(2 * Mm))
        - 0.110 * math.sin(math.radians(D))
    )
    return lon % 360 - 180  # normalize to [-180, 180]


def _subsolar_latitude(jd: float) -> float:
    """Selenographic latitude of the sub-solar point (degrees)."""
    T = _jd_to_t(jd)
    I = 1.5424  # Moon's orbital inclination
    Omega = 125.0445 - 1934.1362 * T  # ascending node
    Ms = 357.5291 + 35999.0503 * T
    # Simplified; accurate to ~0.2°
    lat = 1.543 * math.sin(math.radians(Omega))
    return lat


def _selenocentric_to_elevation_azimuth(
    obs_lat: float, obs_lon: float,
    sub_lat: float, sub_lon: float
) -> Tuple[float, float]:
    """
    Given an observer at (obs_lat, obs_lon) on the Moon and the sub-solar
    point at (sub_lat, sub_lon), compute the Sun's local elevation and azimuth.
    """
    phi1 = math.radians(obs_lat)
    lam1 = math.radians(obs_lon)
    phi2 = math.radians(sub_lat)
    lam2 = math.radians(sub_lon)

    dlam = lam2 - lam1

    # Sine rule for spherical triangles
    sin_alt = (
        math.sin(phi1) * math.sin(phi2)
        + math.cos(phi1) * math.cos(phi2) * math.cos(dlam)
    )
    sin_alt = max(-1.0, min(1.0, sin_alt))
    elevation = math.degrees(math.asin(sin_alt))

    # Azimuth
    y = math.sin(dlam)
    x = (
        math.cos(phi1) * math.tan(phi2)
        - math.sin(phi1) * math.cos(dlam)
    )
    azimuth = math.degrees(math.atan2(y, x)) % 360

    return elevation, azimuth


def _angle_diff(a: float, b: float) -> float:
    """Signed angular difference b - a, in (-180, +180]."""
    d = (b - a + 180) % 360 - 180
    return d

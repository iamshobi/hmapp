/**
 * Pelagic zone colors aligned with the five-layer ocean depth diagram:
 * Epipelagic (sunlight) → Mesopelagic (twilight) → Bathypelagic (midnight) →
 * Abyssopelagic (abyssal) → Hadalpelagic (trenches), plus air above the sea surface.
 *
 * Depth axis matches session backdrop: OCEAN_BACKDROP_DEPTH_MIN_M … OCEAN_BACKDROP_DEPTH_MAX_M.
 */

import { OCEAN_BACKDROP_DEPTH_MIN_M, OCEAN_BACKDROP_DEPTH_MAX_M } from './oceanDepthLevels';

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function rgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lerp255(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpHex(hexA, hexB, t) {
  const u = clamp01(t);
  const A = rgb(hexA);
  const B = rgb(hexB);
  return `#${[lerp255(A.r, B.r, u), lerp255(A.g, B.g, u), lerp255(A.b, B.b, u)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

function rgbaFromHex(hex, a) {
  const { r, g, b } = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Sharp zone bands (diagram): shallow → deep within each band.
 * Colors tuned to sunlit / twilight / midnight / navy / indigo trench.
 */
const PELAGIC_SEGMENTS = [
  {
    lo: OCEAN_BACKDROP_DEPTH_MIN_M,
    hi: 0,
    shallow: '#DFF3FF',
    deep: '#9FD8F6',
    id: 'atmosphere',
  },
  { lo: 0, hi: 200, shallow: '#A5E5FC', deep: '#6EC8EF', id: 'epipelagic' },
  { lo: 200, hi: 1000, shallow: '#59A3D6', deep: '#3B87BE', id: 'mesopelagic' },
  { lo: 1000, hi: 4000, shallow: '#226A9E', deep: '#174E78', id: 'bathypelagic' },
  { lo: 4000, hi: 6000, shallow: '#123E5E', deep: '#0A2742', id: 'abyssopelagic' },
  {
    lo: 6000,
    hi: OCEAN_BACKDROP_DEPTH_MAX_M,
    shallow: '#0E1F3D',
    deep: '#070A1C',
    id: 'hadalpelagic',
  },
];

function segmentForDepthM(d) {
  const x = Math.min(OCEAN_BACKDROP_DEPTH_MAX_M, Math.max(OCEAN_BACKDROP_DEPTH_MIN_M, d));
  for (const s of PELAGIC_SEGMENTS) {
    if (x >= s.lo && x <= s.hi) return s;
  }
  return PELAGIC_SEGMENTS[PELAGIC_SEGMENTS.length - 1];
}

/** Representative colour at this absolute depth (m) */
export function pelagicKeyColorAtDepthM(depthM) {
  const s = segmentForDepthM(depthM);
  const span = s.hi - s.lo || 1;
  const u = (Math.min(s.hi, Math.max(s.lo, depthM)) - s.lo) / span;
  return {
    color: lerpHex(s.shallow, s.deep, u),
    zoneId: s.id,
  };
}

/**
 * Low-density “water” tint — clearer than before so iceberg pan reads through (going-deep via motion).
 * `diveProgress01` nudges the lower stops slightly darker over the dive.
 */
export function getPelagicDepthOverlayGradientRGBA(depthM, diveProgress01 = 0) {
  const dip = clamp01(diveProgress01);
  const { color: key } = pelagicKeyColorAtDepthM(depthM);
  const wash = lerpHex(key, '#FFFFFF', 0.55);
  const mid = lerpHex(key, '#FFFFFF', 0.18);
  const shade = lerpHex(key, '#020818', 0.14 + dip * 0.12);
  const keel = lerpHex(key, '#01030a', 0.32 + dip * 0.2);

  return [
    rgbaFromHex(wash, 0.035 + dip * 0.03),
    rgbaFromHex(mid, 0.05 + dip * 0.04),
    rgbaFromHex(shade, 0.07 + dip * 0.05),
    rgbaFromHex(keel, 0.1 + dip * 0.06),
  ];
}

/** 0–1 over full axis (air … trench) — for ambient shimmer strength */
export function pelagicNormalizedDepthM(depthM) {
  const lo = OCEAN_BACKDROP_DEPTH_MIN_M;
  const hi = OCEAN_BACKDROP_DEPTH_MAX_M;
  return clamp01((depthM - lo) / (hi - lo));
}

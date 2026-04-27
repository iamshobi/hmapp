/**
 * Level-relative session progress → 0–1 tint driver (legacy shim for ambient strength).
 * Pelagic water colours: `oceanPelagicLayerColors.js` (diagram-aligned zones).
 */

function easeOutQuad(p) {
  const t = Math.min(1, Math.max(0, p));
  return 1 - (1 - t) * (1 - t);
}

export function oceanDepthGradientT(level, sessionProgress) {
  const gd = level?.gradientDepth ?? { start: 0, end: 1 };
  const p = Math.min(1, Math.max(0, sessionProgress));
  const eased = easeOutQuad(p);
  return gd.start + (gd.end - gd.start) * eased;
}

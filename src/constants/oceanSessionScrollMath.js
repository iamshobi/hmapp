/**
 * Shared mapping for ocean session: backdrop pan, depth UI, crossing notes.
 * Tuned so descent is **visible from the first seconds** (not back-loaded).
 */

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Depth / pan position from wall-clock [0,1]:
 * ~linear early motion, gentle ease-out at the end so the finish doesn’t snap.
 */
export function oceanSessionBackdropEasedU(progress01) {
  const p = clamp01(progress01);
  const lin = p;
  const easeOut = 1 - (1 - p) ** 2.1;
  return lin * 0.58 + easeOut * 0.42;
}

/**
 * Keep collectibles / swim lanes away from the centred breathing dot on Ocean session.
 * Dot sits in `OceanDepthCinematicOverlay` (full-screen flex centre).
 *
 * Normalized coords: nx = x/W, ny = y/H for points (e.g. centre of shell anchor).
 */

/** Inclusive horizontal band [nxMin, nxMax] to avoid (screen centre column). */
export const BREATH_DOT_EXCLUDE_NX_MIN = 0.26;
export const BREATH_DOT_EXCLUDE_NX_MAX = 0.74;

/** Inclusive vertical band [nyMin, nyMax] to avoid (screen middle). */
export const BREATH_DOT_EXCLUDE_NY_MIN = 0.36;
export const BREATH_DOT_EXCLUDE_NY_MAX = 0.64;

export function isNormalizedPointInBreathingExclusion(nx, ny) {
  return (
    nx >= BREATH_DOT_EXCLUDE_NX_MIN &&
    nx <= BREATH_DOT_EXCLUDE_NX_MAX &&
    ny >= BREATH_DOT_EXCLUDE_NY_MIN &&
    ny <= BREATH_DOT_EXCLUDE_NY_MAX
  );
}

/**
 * Sample yFrac in [bandMin, bandMax] uniformly outside [BREATH_DOT_EXCLUDE_NY_MIN, BREATH_DOT_EXCLUDE_NY_MAX].
 * If the band lies fully inside exclusion, bias toward the band edges.
 */
export function sampleYFracAvoidingBreathDot(bandMin, bandMax) {
  const exMin = BREATH_DOT_EXCLUDE_NY_MIN;
  const exMax = BREATH_DOT_EXCLUDE_NY_MAX;
  const a0 = bandMin;
  const a1 = Math.min(bandMax, exMin);
  const lowLen = Math.max(0, a1 - a0);
  const b0 = Math.max(bandMin, exMax);
  const b1 = bandMax;
  const highLen = Math.max(0, b1 - b0);
  const total = lowLen + highLen;
  if (total < 1e-8) {
    const mid = (bandMin + bandMax) / 2;
    const exMid = (exMin + exMax) / 2;
    const t = mid < exMid ? 0.12 : 0.88;
    return bandMin + t * (bandMax - bandMin);
  }
  const r = Math.random() * total;
  if (r < lowLen) {
    return a0 + (lowLen > 0 ? (r / lowLen) * (a1 - a0) : a0);
  }
  return b0 + ((r - lowLen) / highLen) * (b1 - b0);
}

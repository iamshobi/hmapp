/**
 * Flower of Life — nineteen equal circles (1 center + 6 + 12), plus outer border ring.
 * Sacred geometry reference: overlapping circles / hex symmetry (see user reference art).
 * viewBox 0 0 240 240, center (120, 120).
 */

const CX = 120;
const CY = 120;
/** Circle radius — fits in canvas with second ring + border */
const R = 26;

/** Degrees clockwise from top (0° = top). */
function degToRad(deg) {
  return ((deg - 90) * Math.PI) / 180;
}

/** One circular arc from startDeg to endDeg (same circle). */
function arcSegment(cx, cy, r, startDeg, endDeg) {
  const r1 = degToRad(startDeg);
  const r2 = degToRad(endDeg);
  const x1 = cx + r * Math.cos(r1);
  const y1 = cy + r * Math.sin(r1);
  const x2 = cx + r * Math.cos(r2);
  const y2 = cy + r * Math.sin(r2);
  const delta = endDeg - startDeg;
  const large = Math.abs(delta) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/** Eight 45° arcs for one full circle (stroke order). */
function circleArcs(cx, cy, r) {
  const arcs = [];
  for (let seg = 0; seg < 8; seg++) {
    const a0 = seg * 45;
    const a1 = (seg + 1) * 45;
    arcs.push(arcSegment(cx, cy, r, a0, a1));
  }
  return arcs;
}

/** First ring: six centers on the circumference of the central circle (Seed of Life). */
function ring1Centers() {
  const centers = [];
  for (let k = 0; k < 6; k++) {
    const angleDeg = k * 60;
    const rad = degToRad(angleDeg);
    centers.push({
      x: CX + R * Math.cos(rad),
      y: CY + R * Math.sin(rad),
    });
  }
  return centers;
}

/** Second Flower-of-Life ring: twelve centers at distance 2R, every 30°. */
function ring2Centers() {
  const centers = [];
  for (let k = 0; k < 12; k++) {
    const angleDeg = k * 30;
    const rad = degToRad(angleDeg);
    centers.push({
      x: CX + 2 * R * Math.cos(rad),
      y: CY + 2 * R * Math.sin(rad),
    });
  }
  return centers;
}

/** Drawing order: center → first ring (6) → second ring (12). */
function buildFlowerOfLifeStrokes() {
  const s = [];
  circleArcs(CX, CY, R).forEach((d) => s.push(d));
  ring1Centers().forEach(({ x, y }) => {
    circleArcs(x, y, R).forEach((d) => s.push(d));
  });
  ring2Centers().forEach(({ x, y }) => {
    circleArcs(x, y, R).forEach((d) => s.push(d));
  });
  return s;
}

export const MANDALA_STROKES = buildFlowerOfLifeStrokes();

export const MANDALA_STROKE_COUNT = MANDALA_STROKES.length;

/** One combined path per circle — comet / wake order (19 circles). */
export const MANDALA_CIRCLE_PATHS = [
  circleArcs(CX, CY, R).join(' '),
  ...ring1Centers().map(({ x, y }) => circleArcs(x, y, R).join(' ')),
  ...ring2Centers().map(({ x, y }) => circleArcs(x, y, R).join(' ')),
];

/** Single path for final reveal (inner pattern only). */
export const MANDALA_COMBINED_PATH = MANDALA_STROKES.join(' ');

/** Outer circular frame — matches reference “single prominent outer border”. */
const R_BORDER = 3 * R;

function fullCirclePath(cx, cy, r) {
  const top = degToRad(0);
  const x0 = cx + r * Math.cos(top);
  const y0 = cy + r * Math.sin(top);
  return `M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x0 - 0.02} ${y0}`;
}

export const MANDALA_OUTER_BORDER_PATH = fullCirclePath(CX, CY, R_BORDER);

/** 45° arc length on radius R — used for stroke-dash trim (matches arc segments). */
export const MANDALA_ARC_LENGTH = (Math.PI * R) / 4;

/** Length of one full circle path (8 arcs × arc length). */
export const PER_CIRCLE_PATH_LENGTH = 8 * MANDALA_ARC_LENGTH;

/** Total path length estimate = sum of all arc segments. */
export const MANDALA_PATH_LENGTH_EST = MANDALA_STROKE_COUNT * MANDALA_ARC_LENGTH;

function pointOnArc(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function trailPointsForCircle(cx, cy) {
  const pts = [];
  const samplesPerArc = 3;
  for (let seg = 0; seg < 8; seg++) {
    const a0 = seg * 45;
    const a1 = (seg + 1) * 45;
    for (let k = 0; k < samplesPerArc; k++) {
      const t = k / (samplesPerArc - 1);
      const d = a0 + t * (a1 - a0);
      pts.push(pointOnArc(cx, cy, R, d));
    }
  }
  return pts;
}

/** Trail samples per circle (same order as MANDALA_CIRCLE_PATHS). */
export const MANDALA_CIRCLE_TRAIL_POINTS = [
  trailPointsForCircle(CX, CY),
  ...ring1Centers().map(({ x, y }) => trailPointsForCircle(x, y)),
  ...ring2Centers().map(({ x, y }) => trailPointsForCircle(x, y)),
];

export const MANDALA_TRAIL_POINTS = (() => {
  const pts = [];
  MANDALA_CIRCLE_TRAIL_POINTS.forEach((ring) => {
    pts.push(...ring);
  });
  return pts;
})();

/**
 * @deprecated Kept for older Metro bundles that still import this helper.
 */
export function circlePath(r) {
  return `M ${CX} ${CY - r} A ${r} ${r} 0 1 1 ${CX - 0.01} ${CY - r}`;
}

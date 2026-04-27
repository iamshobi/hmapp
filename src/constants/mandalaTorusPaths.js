/**
 * Torus / Lotus of Life — three concentric rings traced inner → outer.
 * Same viewBox as Flower of Life (0 0 240 240), center (120, 120).
 */

const CX = 120;
const CY = 120;

function degToRad(deg) {
  return ((deg - 90) * Math.PI) / 180;
}

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

function circleArcs(cx, cy, r) {
  const arcs = [];
  for (let seg = 0; seg < 8; seg++) {
    const a0 = seg * 45;
    const a1 = (seg + 1) * 45;
    arcs.push(arcSegment(cx, cy, r, a0, a1));
  }
  return arcs;
}

function pointOnArc(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function trailPointsForCircle(cx, cy, r) {
  const pts = [];
  const samplesPerArc = 3;
  for (let seg = 0; seg < 8; seg++) {
    const a0 = seg * 45;
    const a1 = (seg + 1) * 45;
    for (let k = 0; k < samplesPerArc; k++) {
      const t = k / (samplesPerArc - 1);
      const d = a0 + t * (a1 - a0);
      pts.push(pointOnArc(cx, cy, r, d));
    }
  }
  return pts;
}

/** Inner → outer — matches Torus/Lotus energy-flow reading */
const RADII = [24, 44, 62];

const strokes = [];
RADII.forEach((r) => {
  circleArcs(CX, CY, r).forEach((d) => strokes.push(d));
});

export const TORUS_STROKE_COUNT = strokes.length;

export const TORUS_CIRCLE_PATHS = RADII.map((r) => circleArcs(CX, CY, r).join(' '));

export const TORUS_COMBINED_PATH = strokes.join(' ');

function fullCirclePath(cx, cy, r) {
  const top = degToRad(0);
  const x0 = cx + r * Math.cos(top);
  const y0 = cy + r * Math.sin(top);
  return `M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x0 - 0.02} ${y0}`;
}

export const TORUS_OUTER_BORDER_PATH = fullCirclePath(CX, CY, RADII[RADII.length - 1] + 4);

/** 45° arc length on radius r */
export function torusArcLength(r) {
  return (Math.PI * r) / 4;
}

/** Per full circle (8 arcs) — for dash animation */
export const TORUS_PER_CIRCLE_PATH_LENGTHS = RADII.map((r) => 8 * torusArcLength(r));

export const TORUS_CIRCLE_TRAIL_POINTS = RADII.map((r) => trailPointsForCircle(CX, CY, r));

export const TORUS_CIRCLE_COUNT = RADII.length;

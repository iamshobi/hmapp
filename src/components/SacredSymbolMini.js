/**
 * Minimal line-art icons for sacred geometry symbols (viewBox 0 0 100 100).
 * Index order matches SACRED_GEOMETRY_SYMBOLS — aligned with Pardesco article
 * symbol sequence and typical diagrams for each name.
 */
import React from 'react';
import Svg, { Circle, Path, G, Line } from 'react-native-svg';

const STROKE = '#D4AF37';
const STROKE_DIM = 'rgba(232, 207, 122, 0.85)';
const W = 1.2;

function S({ children, size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G fill="none">{children}</G>
    </Svg>
  );
}

/** Classic Sephirot layout (10 nodes) — matches Tree of Life diagrams like Pardesco’s. */
const TREE_NODES = [
  [50, 10],
  [28, 26],
  [72, 26],
  [22, 44],
  [50, 46],
  [78, 44],
  [28, 64],
  [50, 66],
  [72, 64],
  [50, 84],
];
/** Simplified paths between Sephirot (common Tree of Life diagrams). */
const TREE_EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 4],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 6],
  [4, 7],
  [5, 8],
  [6, 7],
  [7, 8],
  [6, 9],
  [8, 9],
  [7, 9],
];

export default function SacredSymbolMini({ index, size = 56 }) {
  switch (index) {
    case 0:
      /* Torus / Lotus of Life — concentric flow (reference: torus / lotus) */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="32" stroke={STROKE} strokeWidth={W} />
          <Circle cx="50" cy="50" r="18" stroke={STROKE_DIM} strokeWidth={W} />
          <Circle cx="50" cy="50" r="6" stroke={STROKE} strokeWidth={W} />
        </S>
      );
    case 1:
      /* Flower of Life — overlapping circles (reference: Flower of Life) */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="10" stroke={STROKE} strokeWidth={W} />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 10 * Math.cos(r);
            const cy = 50 + 10 * Math.sin(r);
            return <Circle key={i} cx={cx} cy={cy} r="10" stroke={STROKE} strokeWidth={W} />;
          })}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 20 * Math.cos(r);
            const cy = 50 + 20 * Math.sin(r);
            return <Circle key={`o${i}`} cx={cx} cy={cy} r="10" stroke={STROKE_DIM} strokeWidth={W} />;
          })}
        </S>
      );
    case 2:
      /* Tree of Life — 10 Sephirot + paths (reference: Tree of Life) */
      return (
        <S size={size}>
          {TREE_EDGES.map(([a, b], i) => (
            <Line
              key={`e${i}`}
              x1={TREE_NODES[a][0]}
              y1={TREE_NODES[a][1]}
              x2={TREE_NODES[b][0]}
              y2={TREE_NODES[b][1]}
              stroke={STROKE_DIM}
              strokeWidth={W * 0.85}
            />
          ))}
          {TREE_NODES.map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r="4.5" stroke={STROKE} strokeWidth={W} />
          ))}
        </S>
      );
    case 3:
      /* Sri Yantra — interlocking triangles (reference: Sri Yantra) */
      return (
        <S size={size}>
          <Path d="M 50 22 L 78 72 L 22 72 Z" stroke={STROKE} strokeWidth={W} />
          <Path d="M 50 78 L 22 28 L 78 28 Z" stroke={STROKE_DIM} strokeWidth={W} />
          <Path d="M 50 78 L 78 28 L 22 28 Z" stroke={STROKE_DIM} strokeWidth={W} opacity={0.7} />
        </S>
      );
    case 4:
      /* Six Petal Rosette — inner ring of Seed (reference: six petals around center) */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="28" stroke={STROKE} strokeWidth={W} />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 22 * Math.cos(rad);
            const cy = 50 + 22 * Math.sin(rad);
            return <Circle key={i} cx={cx} cy={cy} r="14" stroke={STROKE_DIM} strokeWidth={W} />;
          })}
        </S>
      );
    case 5:
      /* Metatron's Cube — 13 vertices from Flower of Life + key lines (reference: Metatron's Cube) */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="28" stroke={STROKE} strokeWidth={W} />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 28 * Math.cos(r);
            const cy = 50 + 28 * Math.sin(r);
            return <Circle key={i} cx={cx} cy={cy} r="12" stroke={STROKE_DIM} strokeWidth={W} />;
          })}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 28 * Math.cos(r);
            const cy = 50 + 28 * Math.sin(r);
            return (
              <Line
                key={`l${i}`}
                x1="50"
                y1="50"
                x2={cx}
                y2={cy}
                stroke={STROKE_DIM}
                strokeWidth={W * 0.75}
                opacity={0.7}
              />
            );
          })}
          <Path d="M 50 22 L 78 72 L 22 72 Z" stroke={STROKE} strokeWidth={W} opacity={0.6} />
        </S>
      );
    case 6:
      /* Star of David — two interlocking triangles (reference: Star of David) */
      return (
        <S size={size}>
          <Path d="M 50 18 L 78 78 L 22 78 Z" stroke={STROKE} strokeWidth={W} />
          <Path d="M 50 82 L 22 22 L 78 22 Z" stroke={STROKE_DIM} strokeWidth={W} />
        </S>
      );
    case 7:
      /* Star tetrahedron / Merkaba (reference: Merkaba) */
      return (
        <S size={size}>
          <Path d="M 50 22 L 78 72 L 22 72 Z" stroke={STROKE} strokeWidth={W} />
          <Path d="M 50 78 L 22 28 L 78 28 Z" stroke={STROKE_DIM} strokeWidth={W} />
          <Circle cx="50" cy="50" r="6" stroke={STROKE} strokeWidth={W} />
        </S>
      );
    case 8:
      /* Vesica Piscis */
      return (
        <S size={size}>
          <Circle cx="38" cy="50" r="25" stroke={STROKE} strokeWidth={W} />
          <Circle cx="62" cy="50" r="25" stroke={STROKE} strokeWidth={W} />
        </S>
      );
    case 9:
      /* Seed of Life */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="12" stroke={STROKE} strokeWidth={W} />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 12 * Math.cos(r);
            const cy = 50 + 12 * Math.sin(r);
            return <Circle key={i} cx={cx} cy={cy} r="12" stroke={STROKE} strokeWidth={W} />;
          })}
        </S>
      );
    case 10:
      /* Egg of Life */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="8" stroke={STROKE} strokeWidth={W} />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 16 * Math.cos(r);
            const cy = 50 + 16 * Math.sin(r);
            return <Circle key={i} cx={cx} cy={cy} r="8" stroke={STROKE} strokeWidth={W} />;
          })}
        </S>
      );
    case 11:
      /* Fruit of Life */
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="8" stroke={STROKE} strokeWidth={W} />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 16 * Math.cos(r);
            const cy = 50 + 16 * Math.sin(r);
            return <Circle key={i} cx={cx} cy={cy} r="8" stroke={STROKE} strokeWidth={W} />;
          })}
          {[30, 90, 150, 210, 270, 330].map((deg, i) => {
            const r = ((deg - 90) * Math.PI) / 180;
            const cx = 50 + 28 * Math.cos(r);
            const cy = 50 + 28 * Math.sin(r);
            return <Circle key={`o${i}`} cx={cx} cy={cy} r="8" stroke={STROKE_DIM} strokeWidth={W} />;
          })}
        </S>
      );
    default:
      return (
        <S size={size}>
          <Circle cx="50" cy="50" r="28" stroke={STROKE} strokeWidth={W} />
        </S>
      );
  }
}

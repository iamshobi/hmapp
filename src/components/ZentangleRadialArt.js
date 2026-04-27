/**
 * Flower of Life — vector outlines traced by comet light; faint gold wake; full metallic reveal at end.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import { PER_CIRCLE_PATH_LENGTH } from '../constants/mandalaSessionPaths';
import {
  TORUS_COMBINED_PATH,
  TORUS_CIRCLE_PATHS,
  TORUS_CIRCLE_TRAIL_POINTS,
  TORUS_OUTER_BORDER_PATH,
  TORUS_PER_CIRCLE_PATH_LENGTHS,
  TORUS_CIRCLE_COUNT,
} from '../constants/mandalaTorusPaths';
import { zenGame } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(SCREEN_W - 48, 320);

const FIELD = '#0A1628';
/** Progress at which we show the complete line drawing + border (session nearly done) */
const REVEAL_AT = 0.985;

/** Flower of Life = 19 circles in trace order */
const FLOWER_CIRCLE_COUNT = 19;

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function interpolateHead(points, t) {
  const n = points.length;
  if (n === 0) return { x: 120, y: 120 };
  const f = Math.max(0, Math.min(1, t)) * (n - 1);
  const i = Math.floor(f);
  const u = f - i;
  const a = points[i];
  const b = points[Math.min(i + 1, n - 1)];
  return { x: a.x + u * (b.x - a.x), y: a.y + u * (b.y - a.y) };
}

/**
 * @param {number} progress — 0..1 session progress (smooth)
 * @param {boolean} [overlayOnCosmic]
 * @param {number} [size]
 * @param {boolean} [compactCaption]
 * @param {boolean} [showCaption]
 * @param {'flower' | 'torusLotus'} [variant] — Flower of Life trace vs Torus/Lotus concentric rings
 */
export default function ZentangleRadialArt({
  progress = 0,
  overlayOnCosmic = false,
  size: sizeProp,
  compactCaption = false,
  showCaption = true,
  variant = 'flower',
}) {
  const baseSize = sizeProp ?? DEFAULT_SIZE;

  const mandala = useMemo(() => {
    if (variant === 'torusLotus') {
      return {
        circlePaths: TORUS_CIRCLE_PATHS,
        combinedPath: TORUS_COMBINED_PATH,
        trailPoints: TORUS_CIRCLE_TRAIL_POINTS,
        borderPath: TORUS_OUTER_BORDER_PATH,
        circleCount: TORUS_CIRCLE_COUNT,
        perLens: TORUS_PER_CIRCLE_PATH_LENGTHS,
        doneLabel: 'Torus / Lotus revealed',
      };
    }
    return {
      circlePaths: MANDALA_CIRCLE_PATHS,
      combinedPath: MANDALA_COMBINED_PATH,
      trailPoints: MANDALA_CIRCLE_TRAIL_POINTS,
      borderPath: MANDALA_OUTER_BORDER_PATH,
      circleCount: FLOWER_CIRCLE_COUNT,
      perLens: null,
      doneLabel: 'Flower of Life revealed',
    };
  }, [variant]);

  const raw = Number(progress);
  const p = Math.max(0, Math.min(1, Number.isFinite(raw) ? raw : 0));
  const revealLine = p >= REVEAL_AT;
  const drawProgress = revealLine ? 1 : Math.min(p / REVEAL_AT, 1);
  /** Linear in session time → constant-speed comet along the stroke order (no ease curves). */
  const t = mandala.circleCount * drawProgress;
  const showTrail = !revealLine && drawProgress > 0.004;

  /** Thin aesthetic strokes */
  const trailStrokeW = overlayOnCosmic ? 1.35 : 1.15;
  const wakeStrokeMain = overlayOnCosmic ? 1.15 : 1.0;
  const wakeStrokeHi = overlayOnCosmic ? 0.65 : 0.55;

  const headIdx = Math.min(
    mandala.circleCount - 1,
    Math.max(0, Math.floor(Math.min(t, mandala.circleCount - 0.001)))
  );
  /** Linear 0…1 along the active circle — matches dash offset so comet moves at uniform angular speed. */
  const headAlong = clamp01(t - headIdx);

  const head = useMemo(
    () =>
      interpolateHead(
        mandala.trailPoints[headIdx] ?? mandala.trailPoints[0],
        headAlong
      ),
    [mandala.trailPoints, headIdx, headAlong]
  );

  const caption = useMemo(() => {
    if (!showCaption) return '';
    if (p >= 0.995) return mandala.doneLabel;
    if (p >= REVEAL_AT) return 'Sacred form complete';
    if (!showTrail) return 'Light approaches…';
    return 'Light tracing the path…';
  }, [p, showTrail, showCaption, mandala.doneLabel]);

  const frameStyle = overlayOnCosmic
    ? [styles.frameOpen, { width: baseSize, height: baseSize }]
    : [styles.frame, { width: baseSize, height: baseSize }];
  const captionStyle = [
    overlayOnCosmic ? styles.captionCosmic : styles.caption,
    compactCaption && styles.captionCompact,
  ];

  const dustNodes = useMemo(() => {
    const pts = mandala.trailPoints[headIdx] ?? [];
    const n = pts.length;
    if (n < 2 || !showTrail) return [];
    const s = headAlong;
    const out = [];
    const tail = 0.1;
    for (let i = 0; i < n; i++) {
      const frac = i / (n - 1);
      if (frac > s || frac < s - tail) continue;
      const dist = s - frac;
      const fade = Math.min(1, dist / tail);
      const op = 0.12 + 0.45 * fade * fade;
      const r = 0.65 + (i % 4) * 0.28;
      const { x, y } = pts[i];
      out.push(
        <Circle key={`d${i}`} cx={x} cy={y} r={r} fill="url(#dustGold)" opacity={op * fade} />
      );
    }
    return out;
  }, [headIdx, headAlong, showTrail, mandala.trailPoints]);

  return (
    <View style={[styles.wrap, overlayOnCosmic && styles.wrapHero]}>
      {showCaption ? (
        <Text style={captionStyle} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
      <View style={frameStyle}>
        <Svg width={baseSize} height={baseSize} viewBox="0 0 240 240">
          <Defs>
            <RadialGradient id="headGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFDE7" stopOpacity="0.95" />
              <Stop offset="45%" stopColor="#FFD54F" stopOpacity="0.65" />
              <Stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="dustGold" cx="40%" cy="40%" r="65%">
              <Stop offset="0%" stopColor="#FFF8E1" stopOpacity="1" />
              <Stop offset="70%" stopColor="#E8CF7A" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#C9A227" stopOpacity="0.4" />
            </RadialGradient>
            {/* Metallic gold for final reveal — reference: polished gold lines */}
            <LinearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFF8E1" stopOpacity="1" />
              <Stop offset="28%" stopColor="#E8CF7A" stopOpacity="1" />
              <Stop offset="55%" stopColor="#C9A227" stopOpacity="1" />
              <Stop offset="82%" stopColor="#B8860B" stopOpacity="1" />
              <Stop offset="100%" stopColor="#8B7355" stopOpacity="1" />
            </LinearGradient>
            <RadialGradient id="goldShine" cx="35%" cy="32%" r="75%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <Stop offset="35%" stopColor="#E8CF7A" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#6B5B2E" stopOpacity="0.9" />
            </RadialGradient>
          </Defs>

          {revealLine ? (
            <G>
              {/* Soft “emboss” shadow under gold lines */}
              <G transform="translate(1.2, 1.8)">
                <Path
                  d={mandala.combinedPath}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth={trailStrokeW + 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.35}
                />
              </G>
              <G transform="translate(1, 1.5)">
                <Path
                  d={mandala.borderPath}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={trailStrokeW + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.32}
                />
              </G>
              <Path
                d={mandala.combinedPath}
                stroke="url(#goldShine)"
                strokeWidth={trailStrokeW + 0.85}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.95}
              />
              <Path
                d={mandala.combinedPath}
                stroke="url(#goldMetallic)"
                strokeWidth={trailStrokeW * 0.42}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.92}
              />
              <Path
                d={mandala.borderPath}
                stroke="url(#goldShine)"
                strokeWidth={trailStrokeW + 0.55}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.98}
              />
              <Path
                d={mandala.borderPath}
                stroke="url(#goldMetallic)"
                strokeWidth={trailStrokeW * 0.38}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.95}
              />
            </G>
          ) : showTrail ? (
            <G>
              {mandala.circlePaths.map((pathD, i) => {
                const perLen = mandala.perLens?.[i] ?? PER_CIRCLE_PATH_LENGTH;
                const wakeDash = `${perLen} ${perLen}`;
                const cometGap = perLen * 2.2;
                const cometLen = perLen * 0.075;
                const cometDash = `${cometLen} ${cometGap}`;
                const sLocal = clamp01(t - i);
                const wakeOffset = perLen * (1 - sLocal);
                const wakeOpacity = 0.05 + 0.2 * sLocal;
                const cometOffset = cometGap * (1 - sLocal);
                const showComet = sLocal > 0.02 && sLocal < 0.998;

                return (
                  <G key={`circ${i}`}>
                    {/* Slightly colored traced path — soft gold wash */}
                    <Path
                      d={pathD}
                      stroke="#B8956A"
                      strokeWidth={wakeStrokeMain}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray={wakeDash}
                      strokeDashoffset={wakeOffset}
                      opacity={wakeOpacity * 0.55}
                    />
                    <Path
                      d={pathD}
                      stroke="#E8D4A8"
                      strokeWidth={wakeStrokeHi}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray={wakeDash}
                      strokeDashoffset={wakeOffset}
                      opacity={wakeOpacity * 0.72}
                    />
                    {showComet ? (
                      <G>
                        <Path
                          d={pathD}
                          stroke="#FFC107"
                          strokeWidth={7.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          strokeDasharray={cometDash}
                          strokeDashoffset={cometOffset}
                          opacity={0.12}
                        />
                        <Path
                          d={pathD}
                          stroke="#FFE082"
                          strokeWidth={4.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          strokeDasharray={cometDash}
                          strokeDashoffset={cometOffset}
                          opacity={0.28}
                        />
                        <Path
                          d={pathD}
                          stroke="#FFF9C4"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          strokeDasharray={cometDash}
                          strokeDashoffset={cometOffset}
                          opacity={0.5}
                        />
                        <Path
                          d={pathD}
                          stroke="#FFFDE7"
                          strokeWidth={1.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          strokeDasharray={cometDash}
                          strokeDashoffset={cometOffset}
                          opacity={0.92}
                        />
                      </G>
                    ) : null}
                  </G>
                );
              })}
              <G>{dustNodes}</G>
              <Circle cx={head.x} cy={head.y} r={7} fill="url(#headGlow)" opacity={0.88} />
              <Circle cx={head.x} cy={head.y} r={2.6} fill="#FFFFFF" opacity={0.96} />
            </G>
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

export { MANDALA_STROKE_COUNT as TOTAL_STROKES } from '../constants/mandalaSessionPaths';

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  wrapHero: {
    marginTop: 0,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    color: zenGame.sageMuted,
    marginBottom: 10,
    letterSpacing: 0.8,
    opacity: 0.9,
  },
  frame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: FIELD,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 207, 122, 0.2)',
    shadowColor: '#E8CF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  frameOpen: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  captionCosmic: {
    color: 'rgba(230, 236, 245, 0.88)',
  },
  captionCompact: {
    fontSize: 9,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
});

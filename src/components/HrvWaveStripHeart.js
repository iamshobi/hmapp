/**
 * Ocean-theme HRV strip — heart-trace parametric wave.
 *
 *   f(t) = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
 *
 * Traces two rounded upper lobes, a shallow centre cleft, and one pointed
 * downward spike per 2π period (one full heart silhouette per cycle).
 *
 * Pass `compact={true}` for the small bottom-of-screen widget.
 */
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const LEGACY_TICK_S    = 0.034;
const BASE_PHASE       = 0.075;
const BOOST_PHASE      = 0.160;  // wider speed range so HRV visibly drives scroll
const WAVE_SLOWDOWN    = 0.45;
const HRV_SMOOTH_PER_S = 2.8;

const WAVE_STROKE = 'rgba(255,205,215,0.60)';
const DOT_FILL    = 'rgba(255,168,188,0.92)';
const DOT_GLOW    = 'rgba(255,130,165,0.22)';

function heartY(t) {
  return 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
}

/**
 * Amplitude: 18 % of height at HRV=0 → 50 % at HRV=1
 * Low coherence = flat wave; high coherence = tall, prominent wave.
 */
function getAmp(height, hrv) {
  return height * (0.18 + 0.32 * hrv);
}

/**
 * Cycle count: 2.2 at HRV=0 (rapid, tight oscillations) → 1.2 at HRV=1 (broad, slow).
 * Low coherence looks busy/choppy; high coherence looks smooth and rhythmic.
 */
function getCycles(hrv) {
  return 2.2 - hrv * 1.0;
}

function heartTracePath(width, height, phase, hrv) {
  const mid    = height / 2;
  const amp    = getAmp(height, hrv);
  const cycles = getCycles(hrv);
  const steps  = 80;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const t = (x / width) * cycles * 2 * Math.PI + phase;
    const y = mid - amp * (heartY(t) / 17);
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}

function heartTraceYAtX(x, width, height, phase, hrv) {
  const mid    = height / 2;
  const amp    = getAmp(height, hrv);
  const cycles = getCycles(hrv);
  const t      = (x / width) * cycles * 2 * Math.PI + phase;
  return mid - amp * (heartY(t) / 17);
}

export default function HrvWaveStripHeart({ hrv = 0.5, compact = false, embedWidth = null }) {
  const WAVE_H    = compact ? 26 : 72;
  const PADDING_H = compact ? 10 : 24;

  const { width: screenW } = useWindowDimensions();
  /** When set (e.g. bottom HUD), path width matches parent track — avoids full-screen width clipping / dark box */
  const width =
    embedWidth != null && embedWidth > 0
      ? Math.max(40, embedWidth)
      : Math.max(80, screenW - PADDING_H * 2);
  const hrvClamped = Math.max(0, Math.min(1, hrv));

  const phaseRef     = useRef(0);
  const hrvTargetRef = useRef(hrvClamped);
  const hrvSmoothRef = useRef(hrvClamped);
  const lastTsRef    = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { hrvTargetRef.current = hrvClamped; }, [hrvClamped]);

  useEffect(() => {
    let raf = null;
    const loop = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const hrvT = hrvTargetRef.current;
      phaseRef.current +=
        (BASE_PHASE + hrvT * BOOST_PHASE) * (dt / LEGACY_TICK_S) * WAVE_SLOWDOWN;

      const alpha = 1 - Math.exp(-HRV_SMOOTH_PER_S * dt);
      const h = hrvSmoothRef.current;
      hrvSmoothRef.current = h + (hrvT - h) * alpha;

      setTick((n) => (n + 1) % 100000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      lastTsRef.current = null;
    };
  }, []);

  const phase = phaseRef.current;

  const d = useMemo(
    () => heartTracePath(width, WAVE_H, phase, hrvSmoothRef.current),
    [width, WAVE_H, tick], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const margin = compact ? 8 : 12;
  const dot = useMemo(() => {
    const dotX = margin + hrvSmoothRef.current * (width - 2 * margin);
    return { x: dotX, y: heartTraceYAtX(dotX, width, WAVE_H, phase, hrvSmoothRef.current) };
  }, [width, WAVE_H, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const dotR     = compact ? 3   : 4.5;
  const glowR    = compact ? 5.5 : 8.5;
  const strokeW  = compact ? 1.2 : 1.6;

  const padH = embedWidth != null ? 0 : PADDING_H;
  return (
    <View style={[styles.wrap, { paddingHorizontal: padH }]}>
      <Svg width={width} height={WAVE_H} viewBox={`0 0 ${width} ${WAVE_H}`}>
        <Path
          d={d}
          stroke={WAVE_STROKE}
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={dot.x} cy={dot.y} r={glowR} fill={DOT_GLOW} />
        <Circle cx={dot.x} cy={dot.y} r={dotR}  fill={DOT_FILL} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 1,
  },
});

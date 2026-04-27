/**
 * HeartMath-style HRV strip: wave phase scrolls slowly; dot sits on the curve and
 * follows target HRV with smooth interpolation. Replace `hrv` with device value when integrated.
 */
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const PADDING_H = 24;
const WAVE_H = 56;
/** Fewer cycles across the strip = calmer */
const CYCLES = 2.2;
/** Same formula as legacy setInterval(34ms): phase += base + hrv*boost per tick */
const LEGACY_TICK_S = 0.034;
const BASE_PHASE = 0.095;
const BOOST_PHASE = 0.125;
/** Slower wave than legacy (~45% of prior phase rate) */
const WAVE_SLOWDOWN = 0.45;
/** Smooth HRV-driven horizontal position (higher = snappier) */
const HRV_SMOOTH_PER_S = 2.8;
/** Dimmed wave vs bright white — path + dot (keeps dot slightly stronger for readability) */
const WAVE_STROKE = 'rgba(255,255,255,0.52)';
const DOT_FILL = 'rgba(255,255,255,0.62)';

function wavePath(width, height, cycles, phase) {
  const mid = height / 2;
  const amp = height * 0.32;
  const steps = 72;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const t = (x / width) * cycles * 2 * Math.PI + phase;
    const y = mid + amp * Math.sin(t);
    d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  return d.trim();
}

function waveYAtX(x, width, height, cycles, phase) {
  const mid = height / 2;
  const amp = height * 0.32;
  const t = (x / width) * cycles * 2 * Math.PI + phase;
  return mid + amp * Math.sin(t);
}

export default function HrvWaveStrip({ hrv = 0.5 }) {
  const { width: screenW } = useWindowDimensions();
  const width = Math.max(120, screenW - PADDING_H * 2);
  const hrvClamped = Math.max(0, Math.min(1, hrv));

  const phaseRef = useRef(0);
  const hrvTargetRef = useRef(hrvClamped);
  const hrvSmoothRef = useRef(hrvClamped);
  const lastTsRef = useRef(null);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    hrvTargetRef.current = hrvClamped;
  }, [hrvClamped]);

  useEffect(() => {
    let raf = null;
    const loop = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const hrvT = hrvTargetRef.current;
      phaseRef.current += (BASE_PHASE + hrvT * BOOST_PHASE) * (dt / LEGACY_TICK_S) * WAVE_SLOWDOWN;
      const target = hrvT;
      const h = hrvSmoothRef.current;
      const alpha = 1 - Math.exp(-HRV_SMOOTH_PER_S * dt);
      hrvSmoothRef.current = h + (target - h) * alpha;

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
  const d = useMemo(() => wavePath(width, WAVE_H, CYCLES, phase), [width, tick]);

  const margin = 10;
  const dot = useMemo(() => {
    const dotX = margin + hrvSmoothRef.current * (width - 2 * margin);
    const y = waveYAtX(dotX, width, WAVE_H, CYCLES, phase);
    return { x: dotX, y };
  }, [width, tick]);

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={WAVE_H} viewBox={`0 0 ${width} ${WAVE_H}`}>
        <Path
          d={d}
          stroke={WAVE_STROKE}
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={dot.x} cy={dot.y} r={4.5} fill={DOT_FILL} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: PADDING_H,
    marginBottom: 4,
  },
});

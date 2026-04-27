/**
 * Soft sine wave bands with slow vertical drift + horizontal sway — motion stays readable as water darkens.
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, Easing, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function wavePath(w, y0, amp, cycles) {
  const seg = 56;
  let d = '';
  for (let i = 0; i <= seg; i++) {
    const x = (w / seg) * i;
    const y = y0 + amp * Math.sin((x / w) * Math.PI * 2 * cycles);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

/** hrvNormalized high → smooth waves; low → faster, larger storm motion */
export default function OceanWaveMotionOverlay({ depthProgress = 0, hrvNormalized = 0.5 }) {
  const { width: W, height: H } = useWindowDimensions();
  const drift = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const storm = 1 - Math.min(1, Math.max(0, hrvNormalized));

  useEffect(() => {
    const loopDrift = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const loopSway = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loopDrift.start();
    loopSway.start();
    return () => {
      loopDrift.stop();
      loopSway.stop();
    };
  }, [drift, sway]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 88],
  });
  const translateX = sway.interpolate({
    inputRange: [0, 1],
    outputRange: [-32, 32],
  });

  const layerOpacity = useMemo(() => {
    const t = Math.min(1, Math.max(0, depthProgress));
    return 0.1 + t * 0.24 + storm * 0.08;
  }, [depthProgress, storm]);

  const paths = useMemo(() => {
    const h = Math.max(H, 640);
    const s = 1 + storm * 1.1;
    const specs = [
      { y0: h * 0.18, amp: 11 * s, cycles: 2.1 + storm * 0.8, stroke: 'rgba(255,255,255,0.5)', sw: 1.25 + storm * 0.5 },
      { y0: h * 0.38, amp: 15 * s, cycles: 1.55 + storm * 0.5, stroke: 'rgba(94,207,255,0.9)', sw: 1.45 + storm * 0.55 },
      { y0: h * 0.55, amp: 12 * s, cycles: 2.6 + storm * 0.6, stroke: 'rgba(180,235,255,0.45)', sw: 1.15 + storm * 0.45 },
      { y0: h * 0.72, amp: 10 * s, cycles: 1.85 + storm * 0.7, stroke: 'rgba(14,171,212,0.75)', sw: 1.2 + storm * 0.5 },
    ];
    return specs.map((p) => ({
      ...p,
      d: wavePath(W + 48, p.y0, p.amp, p.cycles),
    }));
  }, [W, H, storm]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: layerOpacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      <Svg width={W} height={H}>
        {paths.map((p, i) => (
          <Path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.stroke}
            strokeWidth={p.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

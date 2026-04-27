/**
 * Soft drifting light bands — underwater hint. Low coherence → stronger / faster motion;
 * high coherence → calmer drift and steadier light. Optional `tintDepthM` follows pelagic palette.
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pelagicKeyColorAtDepthM } from '../../constants/oceanPelagicLayerColors';

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function OceanUnderwaterAmbientOverlay({
  depthProgress = 0,
  hrvNormalized = 0.5,
  tintDepthM = null,
}) {
  const { width: W, height: H } = useWindowDimensions();
  const driftA = useRef(new Animated.Value(0)).current;
  const driftB = useRef(new Animated.Value(0)).current;
  const shimmerOp = useRef(new Animated.Value(0.75)).current;
  const hrvRef = useRef(hrvNormalized);

  useEffect(() => {
    hrvRef.current = hrvNormalized;
  }, [hrvNormalized]);

  useEffect(() => {
    let raf = null;
    const tick = () => {
      const calm = clamp01(hrvRef.current);
      const chop = 1 - calm;
      const te = performance.now() / 1000;

      const ampScale = 0.52 + chop * 0.96;
      const freqBoost = 1 + chop * 1.35;

      driftA.setValue(
        Math.sin(te * (0.5 * freqBoost)) * W * (0.055 * ampScale) +
          Math.sin(te * (0.17 * freqBoost)) * W * (0.022 * ampScale)
      );
      driftB.setValue(
        Math.cos(te * (0.42 * freqBoost)) * W * (0.042 * ampScale) +
          Math.sin(te * (0.23 * freqBoost)) * W * (0.018 * ampScale)
      );

      const pulseAmp = 0.06 + chop * 0.14;
      const pulse = 0.86 + chop * 0.08 + Math.sin(te * (0.48 + chop * 0.7)) * pulseAmp;
      shimmerOp.setValue(clamp01(pulse));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [W, driftA, driftB, shimmerOp]);

  const deep = Math.min(1, Math.max(0, depthProgress));
  const calm = clamp01(hrvNormalized);
  const chop = 1 - calm;
  const strength = (0.22 + deep * 0.2) * (0.65 + chop * 0.35);

  const bandColors = useMemo(() => {
    const key = tintDepthM != null ? pelagicKeyColorAtDepthM(tintDepthM).color : '#8FE3FF';
    return {
      a: ['transparent', hexToRgba(key, 0.26), hexToRgba(key, 0.15), 'transparent'],
      b: ['transparent', hexToRgba(key, 0.2), hexToRgba(key, 0.12), 'transparent'],
    };
  }, [tintDepthM]);

  const bandW = W * 1.35;
  const bandH = H * 1.15;

  const slideA = driftA;
  const slideB = driftB;

  const opA = 0.055 * strength;
  const opB = 0.045 * strength;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: shimmerOp }]}
    >
      <Animated.View
        style={[
          styles.band,
          {
            width: bandW,
            height: bandH,
            left: -bandW * 0.18,
            top: -H * 0.12,
            opacity: opA,
            transform: [{ translateX: slideA }, { rotate: '-12deg' }],
          },
        ]}
      >
        <LinearGradient
          colors={bandColors.a}
          locations={[0, 0.38, 0.62, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.band,
          {
            width: bandW * 0.95,
            height: bandH * 0.85,
            left: -W * 0.1,
            bottom: -H * 0.05,
            opacity: opB,
            transform: [{ translateX: slideB }, { rotate: '8deg' }],
          },
        ]}
      >
        <LinearGradient
          colors={bandColors.b}
          locations={[0, 0.42, 0.58, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
  },
});

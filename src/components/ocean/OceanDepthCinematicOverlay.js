import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import {
  OCEAN_CINEMATIC_ZONES,
  getCinematicZoneIndexByDepth,
} from '../../constants/oceanCinematicZones';
import { OCEAN_BACKDROP_DEPTH_MAX_M } from '../../constants/oceanDepthLevels';

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

/* ── Zone glow colours (brighter than textColor for the dot) ──────── */
const ZONE_DOT_COLORS = [
  '#9DDBF5', // epipelagic  — cyan
  '#6FB8D8', // mesopelagic — mid blue
  '#5A9EC8', // bathypelagic — indigo-blue
  '#6080B8', // abyssopelagic — deep purple-blue
  '#8060C0', // hadal — violet
];

/* ── Breathing pulse durations (inhale / exhale ms) ─────────────── */
const INHALE_MS = 3200;
const EXHALE_MS = 3200;

/* ── Breathing dot sizes ─────────────────────────────────────────── */
const DOT_SIZE   = 18;   // core dot diameter at rest
const RING_SIZE  = 28;   // inner ring diameter at rest

function BreathingDot({ color }) {
  const dotScale   = useRef(new Animated.Value(1)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Alpha = useRef(new Animated.Value(0.45)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Alpha = useRef(new Animated.Value(0.22)).current;

  useEffect(() => {
    let loop = null;
    const t = setTimeout(() => {
      loop = Animated.loop(
        Animated.sequence([
        /* ── INHALE: dot grows, rings expand & fade ── */
        Animated.parallel([
          Animated.timing(dotScale, {
            toValue: 1.55,
            duration: INHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 1.6,
            duration: INHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Alpha, {
            toValue: 0.08,
            duration: INHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Scale, {
            toValue: 2.0,
            duration: INHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Alpha, {
            toValue: 0.0,
            duration: INHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        /* ── EXHALE: dot shrinks, rings collapse & glow ── */
        Animated.parallel([
          Animated.timing(dotScale, {
            toValue: 0.65,
            duration: EXHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 1.0,
            duration: EXHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Alpha, {
            toValue: 0.45,
            duration: EXHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Scale, {
            toValue: 1.1,
            duration: EXHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Alpha, {
            toValue: 0.22,
            duration: EXHALE_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
      loop.start();
    }, 200);
    return () => { clearTimeout(t); loop && loop.stop(); };
  }, [dotScale, ring1Scale, ring1Alpha, ring2Scale, ring2Alpha]);

  return (
    <View style={styles.breathingDotContainer} pointerEvents="none">
      {/* Outer diffuse ring */}
      <Animated.View
          style={[
          styles.breathingRing2,
          {
            width: RING_SIZE * 1.3,
            height: RING_SIZE * 1.3,
            borderRadius: RING_SIZE * 0.65,
            borderColor: color,
            opacity: ring2Alpha,
            transform: [{ scale: ring2Scale }],
          },
        ]}
      />
      {/* Inner tight ring */}
      <Animated.View
        style={[
          styles.breathingRing1,
          {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderColor: color,
            opacity: ring1Alpha,
            transform: [{ scale: ring1Scale }],
          },
        ]}
      />
      {/* Core dot */}
      <Animated.View
        style={[
          styles.breathingCore,
          {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: color,
            transform: [{ scale: dotScale }],
          },
        ]}
      />
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function OceanDepthCinematicOverlay({
  depthM = 0,
  visible = false,
}) {
  const zoneIndex = useMemo(() => getCinematicZoneIndexByDepth(depthM), [depthM]);
  const [displayZoneIndex, setDisplayZoneIndex] = useState(zoneIndex);
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(6)).current;

  /* Fade in on mount / become visible */
  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      slideY.setValue(6);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideY,  { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, slideY]);

  /* Cross-fade when zone changes */
  useEffect(() => {
    if (!visible || zoneIndex === displayZoneIndex) return;
    Animated.timing(opacity, { toValue: 0, duration: 360, useNativeDriver: true }).start(() => {
      setDisplayZoneIndex(zoneIndex);
      slideY.setValue(6);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 820, useNativeDriver: true }),
        Animated.timing(slideY,  { toValue: 0, duration: 820, useNativeDriver: true }),
      ]).start();
    });
  }, [visible, zoneIndex, displayZoneIndex, opacity, slideY]);

  if (!visible) return null;

  const zone     = OCEAN_CINEMATIC_ZONES[displayZoneIndex];
  const dotColor = ZONE_DOT_COLORS[displayZoneIndex] ?? '#9DDBF5';
  const p        = clamp01(depthM / OCEAN_BACKDROP_DEPTH_MAX_M);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>

      {/* ── Centre breathing dot (replaces left progress track) ── */}
      <BreathingDot color={dotColor} />

      {/* ── Right zone dot rail ── */}
      <View style={styles.dotRail}>
        {OCEAN_CINEMATIC_ZONES.map((z, i) => (
          <View key={z.id} style={[styles.dot, i === zoneIndex && styles.dotActive]} />
        ))}
      </View>

      {/* ── Bottom depth counter ── */}
      <Animated.View
        style={[styles.bottomStrip, { opacity, transform: [{ translateY: slideY }] }]}
      >
        <Text style={[styles.zoneLabel, { color: `${zone.textColor}88` }]}>
          {zone.label}
        </Text>
        <Text style={[styles.depthCounter, { color: `${zone.textColor}cc` }]}>
          {Math.round(Math.max(0, depthM)).toLocaleString()} m
        </Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Breathing dot — absolutely centred ── */
  breathingDotContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCore: {
    position: 'absolute',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.7,
    elevation: 6,
  },
  breathingRing1: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  breathingRing2: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },

  /* ── Right zone dot rail ── */
  dotRail: {
    position: 'absolute',
    right: 22,
    top: '50%',
    marginTop: -42,
    gap: 14,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  dotActive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },

  /* ── Bottom depth counter ── */
  bottomStrip: {
    position: 'absolute',
    bottom: 36,
    left: 44,
    right: 44,
    alignItems: 'center',
  },
  zoneLabel: {
    fontSize: 9,
    fontWeight: '300',
    letterSpacing: 3.5,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  depthCounter: {
    fontSize: 22,
    fontWeight: '200',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

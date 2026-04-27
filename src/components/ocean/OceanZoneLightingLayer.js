/**
 * OceanZoneLightingLayer — zone-based volumetric lighting for ocean sessions.
 *
 * Epipelagic  (0–200 m)   : 9 animated sunrays fanning from surface + caustic shimmer dots
 * Mesopelagic (200–1000 m): rays fade fast, cool blue ambient wash grows
 * Bathypelagic → Hadal    : full darkness — no rays, no caustics (creature bioluminescence
 *                           is handled by OceanLineIcon's double-shadow glow)
 *
 * All animations run on the native thread (useNativeDriver: true).
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/* ── Constants ── */
const NUM_RAYS = 9;
/** Base angles in degrees, fanning from vertical centre */
const RAY_ANGLES = [-40, -28, -18, -9, 0, 9, 18, 28, 40];
/** Max sway from the base angle, ± degrees */
const RAY_SWAY = 3.2;
const NUM_CAUSTICS = 20;

/**
 * Seeded caustic layout — deterministic so it never re-randomises on re-render.
 * Positions live in the upper 48 % of the screen (surface light zone).
 */
const CAUSTICS = Array.from({ length: NUM_CAUSTICS }, (_, i) => {
  const t = i * 2.3999; // golden-angle-like spacing
  return {
    xFrac:    Math.sin(t * 1.31) * 0.42 + 0.5,        // 0.08 … 0.92
    yFrac:    (Math.cos(t * 0.79) * 0.5 + 0.5) * 0.46, // 0 … 0.46
    size:     2.8 + (i % 5) * 1.3,
    pulseDur: 620 + (i * 173) % 740,
    delay:    (i * 127) % 950,
  };
});

/* ── Depth intensity helpers ── */
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

/** 1 at surface → ~0.48 at 200 m → 0 at 920 m */
function rayIntensity(depthM) {
  if (depthM <= 0)   return 1;
  if (depthM >= 920) return 0;
  if (depthM <= 200) return clamp01(1 - 0.52 * (depthM / 200));
  return clamp01(0.48 * (1 - (depthM - 200) / 720));
}

/** 1 at surface → 0 at 185 m */
function causticIntensity(depthM) {
  if (depthM <= 0)   return 1;
  if (depthM >= 185) return 0;
  return clamp01(1 - depthM / 185);
}

/** 0 at surface → peaks 0.38 at ~600 m → 0 at 1000 m */
function blueWashIntensity(depthM) {
  if (depthM <= 200 || depthM >= 1000) return 0;
  const t = (depthM - 200) / 800;
  return clamp01(Math.sin(t * Math.PI) * 0.38);
}

export default function OceanZoneLightingLayer({ depthM = 0 }) {
  const { width: W, height: H } = useWindowDimensions();

  /* ── Animated values ── */
  const swayAnims   = useRef(RAY_ANGLES.map(() => new Animated.Value(0))).current;
  const pulseAnims  = useRef(CAUSTICS.map(() => new Animated.Value(0))).current;
  const driftAnims  = useRef(CAUSTICS.map(() => new Animated.Value(0))).current;

  /* ── Ray sway loops — deferred to avoid too many native animations on mount ── */
  useEffect(() => {
    let loops = [];
    const t = setTimeout(() => {
      loops = swayAnims.map((anim, i) => {
        const dur = 3400 + i * 310;
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1, duration: dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: -1, duration: dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
      });
      loops.forEach(l => l.start());
    }, 600);
    return () => { clearTimeout(t); loops.forEach(l => l.stop()); };
  }, [swayAnims]);

  /* ── Caustic pulse + drift loops — deferred ── */
  useEffect(() => {
    let loops = [];
    const t = setTimeout(() => {
      loops = [
        ...pulseAnims.map((anim, i) => {
          const { pulseDur, delay } = CAUSTICS[i];
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(anim, { toValue: 1, duration: pulseDur, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0.08, duration: pulseDur, useNativeDriver: true }),
            ])
          );
        }),
        ...driftAnims.map((anim, i) => {
          const dur = 2800 + (i * 211) % 1600;
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1, duration: dur,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: -1, duration: dur,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
            ])
          );
        }),
      ];
      loops.forEach(l => l.start());
    }, 600);
    return () => { clearTimeout(t); loops.forEach(l => l.stop()); };
  }, [pulseAnims, driftAnims]);

  /* ── Derived intensities ── */
  const rI  = rayIntensity(depthM);
  const cI  = causticIntensity(depthM);
  const bwI = blueWashIntensity(depthM);

  /* Nothing to render below Mesopelagic */
  if (rI < 0.005 && cI < 0.005 && bwI < 0.005) return null;

  const rayH    = H * 0.88;
  const rayTopW = 10;
  const rayBotW = Math.max(W * 0.1, 32);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* ── Epipelagic ambient surface wash ── */}
      {rI > 0 && (
        <LinearGradient
          colors={[
            `rgba(160,215,255,${0.13 * rI})`,
            `rgba(100,175,255,${0.06 * rI})`,
            'transparent',
          ]}
          style={[StyleSheet.absoluteFill, { height: H * 0.5 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      )}

      {/* ── Sunrays ── */}
      {rI > 0 && RAY_ANGLES.map((baseDeg, i) => {
        /* Combine base angle + sway into a single interpolated string */
        const rotDeg = swayAnims[i].interpolate({
          inputRange: [-1, 1],
          outputRange: [`${baseDeg - RAY_SWAY}deg`, `${baseDeg + RAY_SWAY}deg`],
        });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: W / 2,
              width: 0,
              height: 0,
              opacity: rI,
              transform: [{ rotate: rotDeg }],
            }}
          >
            {/* Child hangs down from the pivot point at screen top-centre */}
            <LinearGradient
              colors={[
                'rgba(255,248,210,0.30)',
                'rgba(190,225,255,0.13)',
                'rgba(130,195,255,0.05)',
                'transparent',
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: -rayBotW / 2,
                width: rayBotW,
                height: rayH,
                /* Taper ray: clip left side using skew isn't available,
                   so we use a narrow gradient — looks like a tapered beam */
              }}
              pointerEvents="none"
            />
          </Animated.View>
        );
      })}

      {/* ── Caustic shimmer dots ── */}
      {cI > 0 && CAUSTICS.map((c, i) => {
        const dotOpacity = pulseAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, cI * 0.7],
        });
        const driftY = driftAnims[i].interpolate({
          inputRange: [-1, 1],
          outputRange: [-4, 4],
        });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: c.xFrac * W - c.size / 2,
              top:  c.yFrac * H,
              width:  c.size,
              height: c.size,
              borderRadius: c.size / 2,
              backgroundColor: 'rgba(215,240,255,0.95)',
              opacity: dotOpacity,
              transform: [{ translateY: driftY }],
            }}
          />
        );
      })}

      {/* ── Mesopelagic blue ambient wash ── */}
      {bwI > 0 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(8, 28, 76, ${bwI})` },
          ]}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({});

/**
 * OceanSwimmingCreatures — transparent PNG icons with a 3-layer neon glow stack.
 *
 * PNG ICONS
 * ─────────
 *   All 8 creature PNGs are RGBA transparent (colorType 6).
 *   tintColor='#FFFFFF' colours the silhouette white; zone-tint colour is used
 *   for the glow rings behind the image, giving a neon-halo effect.
 *
 * NEON GLOW STACK  (3 concentric coloured circles behind the icon)
 * ────────────────────────────────────────────────────────────────
 *   Outer ambient ring  (×1.80 icon size, low opacity, pulsed)
 *   Mid bloom ring      (×1.35 icon size, mid opacity, pulsed)
 *   Inner tight ring    (×1.05 icon size, high opacity, pulsed)
 *   PNG creature on top (tintColor white)
 *
 *   glowPulse (0.28 → 1.0, 3.2 s) drives all three ring opacities.
 *
 * CRASH SAFETY (Android RN 0.83 New Architecture / Fabric)
 * ─────────────────────────────────────────────────────────
 *   scaleX flip lives in a plain View — never mixed with native-driver animated transforms.
 *   No shadow props. Glow via solid-colour View rings (opacity animated via native driver).
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { sampleYFracAvoidingBreathDot } from '../../constants/oceanSessionBreathingExclusion';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';

/* ══════════════════════════════════════════════════════════════════ */
/*  PNG CREATURE IMAGES  (RGBA transparent, colorType=6)              */
/* ══════════════════════════════════════════════════════════════════ */
/** Shared with OceanAnalyzingInterstitialDecor — same RGBA PNGs as in-game swim layer */
export const CREATURE_IMAGES = {
  dolphin:    require('../../../assets/ocean-creatures/dolphin.png'),
  fish:       require('../../../assets/ocean-creatures/fish.png'),
  starfish:   require('../../../assets/ocean-creatures/starfish.png'),
  scallop:    require('../../../assets/ocean-creatures/scallop.png'),
  conch:      require('../../../assets/ocean-creatures/conch.png'),
  octopus:    require('../../../assets/ocean-creatures/octopus.png'),
  pufferfish: require('../../../assets/ocean-creatures/pufferfish.png'),
  seahorse:   require('../../../assets/ocean-creatures/seahorse.png'),
};

/* ══════════════════════════════════════════════════════════════════ */
/*  NEON GLOW WRAPPER                                                  */
/*                                                                     */
/*  Three coloured rings behind the PNG give the neon halo look.      */
/*  glowPulse is an Animated.Value (0.28 → 1.0) from SwimSlot.        */
/* ══════════════════════════════════════════════════════════════════ */
export function NeonCreaturePng({ name, color, size, glowPulse, scaleX }) {
  const imageSource = CREATURE_IMAGES[name] || CREATURE_IMAGES.fish;

  const outerR = size * 1.80;
  const midR   = size * 1.35;
  const innerR = size * 1.05;

  const outerOpacity = glowPulse.interpolate({
    inputRange:  [0.28, 1.0],
    outputRange: [0.04, 0.14],
    extrapolate: 'clamp',
  });
  const midOpacity = glowPulse.interpolate({
    inputRange:  [0.28, 1.0],
    outputRange: [0.10, 0.30],
    extrapolate: 'clamp',
  });
  const innerOpacity = glowPulse.interpolate({
    inputRange:  [0.28, 1.0],
    outputRange: [0.18, 0.48],
    extrapolate: 'clamp',
  });

  return (
    // scaleX flip in plain View — static transform must not live inside animated transform
    <View style={{ width: size, height: size, transform: [{ scaleX }] }}>

      {/* Outer ambient ring */}
      <Animated.View style={{
        position: 'absolute',
        width: outerR, height: outerR,
        borderRadius: outerR / 2,
        backgroundColor: color,
        opacity: outerOpacity,
        left: -(outerR - size) / 2,
        top:  -(outerR - size) / 2,
      }} />

      {/* Mid bloom ring */}
      <Animated.View style={{
        position: 'absolute',
        width: midR, height: midR,
        borderRadius: midR / 2,
        backgroundColor: color,
        opacity: midOpacity,
        left: -(midR - size) / 2,
        top:  -(midR - size) / 2,
      }} />

      {/* Inner tight ring */}
      <Animated.View style={{
        position: 'absolute',
        width: innerR, height: innerR,
        borderRadius: innerR / 2,
        backgroundColor: color,
        opacity: innerOpacity,
        left: -(innerR - size) / 2,
        top:  -(innerR - size) / 2,
      }} />

      {/* Creature PNG — white silhouette on transparent background */}
      <Image
        source={imageSource}
        style={{ width: size, height: size }}
        tintColor="#FFFFFF"
        resizeMode="contain"
      />
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  NATURAL FACING DIRECTION OF EACH PNG                              */
/*                                                                     */
/*  true  = creature faces RIGHT in its source image                  */
/*  false = creature faces LEFT  in its source image                  */
/*                                                                     */
/*  scaleX logic:                                                      */
/*    goRight === facesRight  →  scaleX =  1  (no flip needed)        */
/*    goRight !== facesRight  →  scaleX = -1  (flip to face travel)   */
/* ══════════════════════════════════════════════════════════════════ */
/** Snout / “front” points toward +X in the PNG when true; toward −X when false (horizontal swim only). */
const CREATURE_FACES_RIGHT = {
  dolphin:    true,
  fish:       true,
  starfish:   true, // radial — arbitrary
  scallop:    true,
  conch:      true,
  octopus:    true, // mostly symmetric — arbitrary
  pufferfish: false, // asset faces left
  seahorse:   true,
};

/* ══════════════════════════════════════════════════════════════════ */
/*  ZONE → CREATURE POOLS + TINT COLOURS                              */
/* ══════════════════════════════════════════════════════════════════ */
const ZONES = [
  { maxDepth: 200,      tint: '#4DD8F0', creatures: ['dolphin',    'fish',       'seahorse',  'scallop']    },
  { maxDepth: 1000,     tint: '#7AB5FF', creatures: ['pufferfish', 'seahorse',   'starfish',  'conch']      },
  { maxDepth: 4000,     tint: '#8878FF', creatures: ['octopus',    'starfish',   'conch',     'scallop']    },
  { maxDepth: 6000,     tint: '#B060E8', creatures: ['octopus',    'starfish',   'pufferfish','conch']      },
  { maxDepth: Infinity, tint: '#E050C8', creatures: ['octopus',    'starfish',   'conch',     'scallop']    },
];

function getZonePool(depthM) {
  for (const z of ZONES) if (depthM < z.maxDepth) return z;
  return ZONES[ZONES.length - 1];
}

/* ══════════════════════════════════════════════════════════════════ */
/*  LAYER CONFIG                                                       */
/* ══════════════════════════════════════════════════════════════════ */
const BASE_SIZE    = 34;
const SWIM_BASE_MS = 14000;
const GAP_MIN_MS   = 2000;
const GAP_MAX_MS   = 5500;
const FADE_MS      = 1400;

const GLOW_MIN  = 0.28;
const GLOW_MAX  = 1.00;
const GLOW_HALF = 1600;

const LAYERS = [
  { sizeMultiplier: 0.60, opacityPeak: 0.55, speedFactor: 0.65, yBand: [0.10, 0.52], unduleAmp: 5,  unduleMs: 2800, spawnDelay: 0    },
  { sizeMultiplier: 0.80, opacityPeak: 0.78, speedFactor: 0.90, yBand: [0.16, 0.68], unduleAmp: 7,  unduleMs: 2500, spawnDelay: 1200 },
  { sizeMultiplier: 1.00, opacityPeak: 0.95, speedFactor: 1.15, yBand: [0.22, 0.78], unduleAmp: 10, unduleMs: 2200, spawnDelay: 2400 },
];

/* ══════════════════════════════════════════════════════════════════ */
/*  SwimSlot                                                           */
/* ══════════════════════════════════════════════════════════════════ */
function SwimSlot({ active, depthM, layerIndex }) {
  const { width: W, height: H } = useWindowDimensions();
  const layer    = LAYERS[layerIndex];
  const iconSize = Math.round(BASE_SIZE * layer.sizeMultiplier);

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const undulateY  = useRef(new Animated.Value(0)).current;
  const glowPulse  = useRef(new Animated.Value(GLOW_MIN)).current;

  const [slot, setSlot] = React.useState({
    name: 'dolphin',
    goRight: true,
    facesRight: CREATURE_FACES_RIGHT.dolphin,
    baseY: 0,
    tint: '#4DD8F0',
  });

  const swimRef     = useRef(null);
  const unduleRef   = useRef(null);
  const glowLoopRef = useRef(null);
  const mountedRef  = useRef(true);
  const spawnRef    = useRef(null);

  const depthMRef = useRef(depthM);
  const WRef      = useRef(W);
  const HRef      = useRef(H);
  useEffect(() => { depthMRef.current = depthM; }, [depthM]);
  useEffect(() => { WRef.current = W; HRef.current = H; }, [W, H]);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const startGlowPulse = useCallback(() => {
    glowLoopRef.current && glowLoopRef.current.stop();
    glowLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: GLOW_MAX, duration: GLOW_HALF, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: GLOW_MIN, duration: GLOW_HALF, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    glowLoopRef.current.start();
  }, [glowPulse]);

  const startUndulate = useCallback(() => {
    unduleRef.current && unduleRef.current.stop();
    unduleRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(undulateY, { toValue:  layer.unduleAmp, duration: layer.unduleMs / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(undulateY, { toValue: -layer.unduleAmp, duration: layer.unduleMs / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    unduleRef.current.start();
  }, [layer.unduleAmp, layer.unduleMs, undulateY]);

  const spawnOnce = useCallback(() => {
    if (!mountedRef.current) return;

    const zone       = getZonePool(depthMRef.current);
    const name       = zone.creatures[Math.floor(Math.random() * zone.creatures.length)];
    const goRight    = Math.random() > 0.5;
    const facesRight = CREATURE_FACES_RIGHT[name] ?? true;
    const yFrac      = sampleYFracAvoidingBreathDot(layer.yBand[0], layer.yBand[1]);
    const baseY      = yFrac * HRef.current;

    const startX = goRight ? -(iconSize + 20) : WRef.current + iconSize + 20;
    const endX   = goRight ?  WRef.current + iconSize + 20 : -(iconSize + 20);
    const swimMs = SWIM_BASE_MS / layer.speedFactor * (0.8 + Math.random() * 0.4);

    if (!mountedRef.current) return;
    setSlot({ name, goRight, facesRight, baseY, tint: zone.tint });

    translateX.setValue(startX);
    opacity.setValue(0);

    swimRef.current && swimRef.current.stop();
    swimRef.current = Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: layer.opacityPeak,                              duration: FADE_MS,                             easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: layer.opacityPeak,                              duration: Math.max(100, swimMs - FADE_MS * 2),                                    useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,                                              duration: FADE_MS,                             easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.timing(translateX, { toValue: endX, duration: swimMs, easing: Easing.linear, useNativeDriver: true }),
    ]);

    startUndulate();

    swimRef.current.start(({ finished }) => {
      if (!mountedRef.current || !finished) return;
      const gap = GAP_MIN_MS + Math.random() * (GAP_MAX_MS - GAP_MIN_MS);
      setTimeout(() => { if (mountedRef.current) spawnRef.current?.(); }, gap);
    });
  }, [iconSize, layer, opacity, translateX, startUndulate]);

  useEffect(() => { spawnRef.current = spawnOnce; }, [spawnOnce]);

  useEffect(() => {
    if (!active) {
      swimRef.current     && swimRef.current.stop();
      unduleRef.current   && unduleRef.current.stop();
      glowLoopRef.current && glowLoopRef.current.stop();
      opacity.setValue(0);
      glowPulse.setValue(GLOW_MIN);
      return;
    }
    startGlowPulse();
    const t = setTimeout(() => spawnRef.current?.(), layer.spawnDelay + Math.random() * 600);
    return () => {
      clearTimeout(t);
      swimRef.current     && swimRef.current.stop();
      unduleRef.current   && unduleRef.current.stop();
      glowLoopRef.current && glowLoopRef.current.stop();
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.slot, {
        top:       slot.baseY - iconSize / 2,
        opacity,
        transform: [{ translateX }, { translateY: undulateY }],
      }]}
    >
      <NeonCreaturePng
        name={slot.name}
        color={slot.tint}
        size={iconSize}
        glowPulse={glowPulse}
        scaleX={slot.goRight === slot.facesRight ? 1 : -1}
      />
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN EXPORT                                                        */
/* ══════════════════════════════════════════════════════════════════ */
export default function OceanSwimmingCreatures({
  active = false,
  depthM = 0,
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SwimSlot active={active} depthM={depthM} layerIndex={0} />
      <SwimSlot active={active} depthM={depthM} layerIndex={1} />
      <SwimSlot active={active} depthM={depthM} layerIndex={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute' },
});

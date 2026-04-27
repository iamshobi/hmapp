/**
 * Small caption when the dive crosses 200 m (twilight / Mesopelagic boundary) — fade in → hold → out.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import {
  OCEAN_DEPTH_NOTE_200M_BRACKET_M,
  OCEAN_DEPTH_NOTE_200M_LABEL,
} from '../../constants/oceanDepthLevels';
import { oceanSessionBackdropEasedU } from '../../constants/oceanSessionScrollMath';

const CROSS_EPS = 199.5;
const FADE_IN_MS = 520;
const HOLD_MS = 1900;
const FADE_OUT_MS = 560;

export default function OceanDepthBoundaryNote({
  phase = 'calibrating',
  oceanLevelId,
  zoneStartM = 0,
  zoneEndM = 200,
  sessionProgress = 0,
  noteLabel = OCEAN_DEPTH_NOTE_200M_LABEL,
  accentColor = '#8FEFFF',
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const prevDepthRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'active') {
      prevDepthRef.current = null;
      firedRef.current = false;
      opacity.setValue(0);
    }
  }, [phase, opacity]);

  useEffect(() => {
    if (phase !== 'active') return;

    const u = oceanSessionBackdropEasedU(sessionProgress);
    const depth = zoneStartM + (zoneEndM - zoneStartM) * u;
    const prev = prevDepthRef.current;

    if (!firedRef.current) {
      const crossedTwilight =
        prev != null && prev < CROSS_EPS && depth >= CROSS_EPS;
      const startedAtTwilight =
        prev === null && oceanLevelId === 'mesopelagic' && depth >= CROSS_EPS;
      if (crossedTwilight || startedAtTwilight) {
        firedRef.current = true;
        opacity.setValue(0);
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: FADE_IN_MS, useNativeDriver: true }),
          Animated.delay(HOLD_MS),
          Animated.timing(opacity, { toValue: 0, duration: FADE_OUT_MS, useNativeDriver: true }),
        ]).start();
      }
    }

    if (prev === null) {
      prevDepthRef.current = depth;
      return;
    }
    prevDepthRef.current = depth;
  }, [phase, sessionProgress, zoneStartM, zoneEndM, oceanLevelId, opacity]);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.pill, { opacity, borderColor: `${accentColor}55` }]}>
        <Text style={[styles.kicker, { color: `${accentColor}cc` }]}>
          {OCEAN_DEPTH_NOTE_200M_BRACKET_M} m
        </Text>
        <Text style={styles.title}>{noteLabel}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '18%',
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 14, 28, 0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 280,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(248, 252, 255, 0.96)',
    letterSpacing: 0.2,
  },
});

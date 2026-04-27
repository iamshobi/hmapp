/**
 * Light rising particles — motion cue that reads as water / pressure without fighting the backdrop pan.
 * Stronger near the surface (start of dive), tapering as depth increases.
 */
import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { oceanSessionBackdropEasedU } from '../../constants/oceanSessionScrollMath';

function rand(seed) {
  let x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const DEFAULT_CORE_COUNT = 6;
const DEFAULT_EXTRA_COUNT = 10;

export default function OceanRisingBubbles({
  active = false,
  opacity = 0.55,
  /** 0…1 session progress; drives bubble density / brightness (shallow → more). */
  diveProgress = 0,
  /** Override particle counts (e.g. analyzing interstitial uses more bubbles). */
  coreCount = DEFAULT_CORE_COUNT,
  extraCount = DEFAULT_EXTRA_COUNT,
}) {
  const { height: H, width: W } = useWindowDimensions();
  const total = coreCount + extraCount;
  const anims = useMemo(
    () => Array.from({ length: total }, () => new Animated.Value(0)),
    [total]
  );

  const meta = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        left: 0.06 + rand(i) * 0.88,
        size: 3.2 + rand(i + 7) * 6.8,
        dur: 6200 + rand(i + 3) * 5400,
        delay: rand(i + 11) * 4200,
        drift: (rand(i + 19) - 0.5) * 26,
      })),
    [W, total]
  );

  useEffect(() => {
    if (!active) {
      anims.forEach((a) => a.setValue(0));
      return undefined;
    }
    const loops = anims.map((av, i) => {
      const { dur, delay } = meta[i];
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(av, {
            toValue: 1,
            duration: dur,
            useNativeDriver: true,
          }),
          Animated.timing(av, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    });
    loops.forEach((l) => l.start());
    return () => {
      loops.forEach((l) => l.stop());
    };
  }, [active, anims, meta]);

  if (!active) return null;

  const u = oceanSessionBackdropEasedU(diveProgress);
  const surfaceBias = Math.pow(1 - u, 1.12);
  const coreOpacity = opacity * (0.52 + 0.48 * surfaceBias);
  const extraOpacity = opacity * 0.92 * surfaceBias;

  const renderGroup = (start, end) => (
    <>
      {anims.slice(start, end).map((av, j) => {
        const i = start + j;
        const m = meta[i];
        const translateY = av.interpolate({
          inputRange: [0, 1],
          outputRange: [H * 0.92, -H * 0.08],
        });
        const translateX = av.interpolate({
          inputRange: [0, 1],
          outputRange: [0, m.drift],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.bubble,
              {
                left: m.left * W - m.size / 2,
                width: m.size,
                height: m.size,
                borderRadius: m.size / 2,
                transform: [{ translateX }, { translateY }],
              },
            ]}
          >
            {/* Specular highlight — upper-left bright dot */}
            <View style={styles.bubbleSpecular} />
            {/* Inner refraction arc — subtle crescent in lower-right */}
            <View style={styles.bubbleRefraction} />
          </Animated.View>
        );
      })}
    </>
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { opacity: coreOpacity }]}>
        {renderGroup(0, coreCount)}
      </View>
      <View style={[StyleSheet.absoluteFill, { opacity: extraOpacity }]}>
        {renderGroup(coreCount, total)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(180, 220, 255, 0.78)',
  },
  /* Bright specular dot — upper-left of bubble (light reflection) */
  bubbleSpecular: {
    position: 'absolute',
    width: '30%',
    height: '30%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    top: '13%',
    left: '15%',
  },
  /* Refraction arc — inner crescent hint in lower-right quadrant */
  bubbleRefraction: {
    position: 'absolute',
    width: '46%',
    height: '46%',
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    backgroundColor: 'transparent',
    bottom: '14%',
    right: '12%',
  },
});

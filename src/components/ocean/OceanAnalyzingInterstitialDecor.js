/**
 * Step-specific background motion for OceanAnalyzingInterstitial.
 * Heart bubbles (heartbeat step), neon PNG creatures (session assets), shells step (one bubble at a time).
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NeonCreaturePng } from './OceanSwimmingCreatures';

const HEARTBEAT_STEP = 0;
const SEA_ANIMALS_STEP = 3;
const SEA_SHELLS_STEP = 4;

const SHELL_EMOJIS = ['🐚', '🦪', '🐚'];

/** Pause before the next shell appears (after the previous bubble finishes its burst) */
const SHELL_SEQUENCE_GAP_MS = 420;

/**
 * Place shells/hearts only in edge bands — never in the middle where overlay copy sits.
 * `band`: 'top' | 'bottom' | 'left' | 'right'
 */
function randomPointAwayFromCenter(W, H, bubble, band, seed) {
  const r = (seed % 997) / 997;
  const r2 = ((seed * 13) % 997) / 997;
  const pad = 8;
  switch (band) {
    case 'top':
      return {
        left: pad + r * Math.max(0, W - bubble - 2 * pad),
        top: H * 0.06 + r2 * Math.max(0, H * 0.2 - bubble),
      };
    case 'bottom':
      return {
        left: pad + r * Math.max(0, W - bubble - 2 * pad),
        top: H * 0.72 + r2 * Math.max(0, H * 0.2 - bubble),
      };
    case 'left': {
      const upper = r < 0.5;
      if (upper) {
        return {
          left: pad + r2 * Math.max(0, W * 0.3 - bubble),
          top: H * 0.08 + r * Math.max(0, H * 0.22 - bubble),
        };
      }
      return {
        left: pad + r2 * Math.max(0, W * 0.3 - bubble),
        top: H * 0.72 + r * Math.max(0, H * 0.2 - bubble),
      };
    }
    default: {
      const upper = r < 0.5;
      if (upper) {
        return {
          left: W * 0.68 + r2 * Math.max(0, W * 0.3 - bubble),
          top: H * 0.08 + r * Math.max(0, H * 0.22 - bubble),
        };
      }
      return {
        left: W * 0.68 + r2 * Math.max(0, W * 0.3 - bubble),
        top: H * 0.72 + r * Math.max(0, H * 0.2 - bubble),
      };
    }
  }
}

/** Translucent bubble with heart — smooth drifting motion */
function HeartWaterBubble({ delayMs, startX, startY, size, driftX, driftY, durationMs }) {
  const t = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const fade = Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      delay: delayMs,
      useNativeDriver: true,
    });
    fade.start();
    const id = setTimeout(() => loop.start(), delayMs);
    return () => {
      clearTimeout(id);
      loop.stop();
      fade.stop();
    };
  }, [delayMs, durationMs, opacity, t]);

  const translateX = t.interpolate({
    inputRange: [0, 1],
    outputRange: [-driftX, driftX],
  });
  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [driftY * 0.3, -driftY],
  });
  const scale = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.04, 0.96],
  });

  return (
    <Animated.View
      style={[
        styles.heartBubbleWrap,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.bubbleGlass, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.heartInBubble, { fontSize: size * 0.38 }]} allowFontScaling={false}>
          🤍
        </Text>
      </View>
    </Animated.View>
  );
}

function HeartBubbleField() {
  const { width: W, height: H } = useWindowDimensions();
  const specs = useMemo(() => {
    const n = 10;
    const bands = ['top', 'top', 'bottom', 'bottom', 'left', 'left', 'right', 'right', 'top', 'bottom'];
    return Array.from({ length: n }, (_, i) => {
      const size = 34 + (i % 4) * 9;
      const { left, top } = randomPointAwayFromCenter(W, H, size, bands[i], i * 31);
      return {
        key: i,
        delayMs: i * 160,
        startX: left,
        startY: top,
        size,
        driftX: 18 + (i % 5) * 5,
        driftY: 28 + (i % 6) * 4,
        durationMs: 3400 + (i % 5) * 380,
      };
    });
  }, [W, H]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {specs.map((s) => {
        const { key: bubbleKey, ...bubbleRest } = s;
        return <HeartWaterBubble key={bubbleKey} {...bubbleRest} />;
      })}
    </View>
  );
}

/** Match OceanSwimmingCreatures SwimSlot glow timing */
const GLOW_MIN = 0.28;
const GLOW_MAX = 1.0;
const GLOW_HALF_MS = 1600;

function SwimmingCreaturesLayer() {
  const { width: W, height: H } = useWindowDimensions();
  const fishX = useRef(new Animated.Value(0)).current;
  const fishY = useRef(new Animated.Value(0)).current;
  const jellyX = useRef(new Animated.Value(0)).current;
  const jellyY = useRef(new Animated.Value(0)).current;
  const jellyPulse = useRef(new Animated.Value(1)).current;
  const glowFish = useRef(new Animated.Value(GLOW_MIN)).current;
  const glowSeahorse = useRef(new Animated.Value(GLOW_MIN)).current;

  const fishSize = Math.min(80, W * 0.2);
  const seahorseSize = Math.min(72, W * 0.19);

  useEffect(() => {
    const swimFish = Animated.loop(
      Animated.sequence([
        Animated.timing(fishX, {
          toValue: 1,
          duration: 12500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fishX, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    const fishBob = Animated.loop(
      Animated.sequence([
        Animated.timing(fishY, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(fishY, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const glowLoop = (v) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: GLOW_MAX,
            duration: GLOW_HALF_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: GLOW_MIN,
            duration: GLOW_HALF_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
    );
    const glowFishAnim = glowLoop(glowFish);
    const glowSeahorseAnim = glowLoop(glowSeahorse);
    const jellyDrift = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(jellyX, {
            toValue: 1,
            duration: 8200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(jellyY, {
            toValue: 1,
            duration: 4100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(jellyX, {
            toValue: 0,
            duration: 8200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(jellyY, {
            toValue: 0,
            duration: 4100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(jellyPulse, {
          toValue: 1.07,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(jellyPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    swimFish.start();
    fishBob.start();
    glowFishAnim.start();
    glowSeahorseAnim.start();
    jellyDrift.start();
    pulse.start();
    return () => {
      swimFish.stop();
      fishBob.stop();
      glowFishAnim.stop();
      glowSeahorseAnim.stop();
      jellyDrift.stop();
      pulse.stop();
    };
  }, [fishX, fishY, jellyX, jellyY, jellyPulse, glowFish, glowSeahorse]);

  /** Fish stays in upper band — avoids center copy */
  const fishTranslateX = fishX.interpolate({
    inputRange: [0, 1],
    outputRange: [-W * 0.06, W * 0.58],
  });
  const fishTranslateY = fishY.interpolate({
    inputRange: [0, 1],
    outputRange: [4, -10],
  });

  /** Second creature drifts along bottom — clear of center (no jellyfish asset; seahorse matches session pool) */
  const jellyTranslateX = jellyX.interpolate({
    inputRange: [0, 1],
    outputRange: [W * 0.04, W * 0.52],
  });
  const jellyTranslateY = jellyY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.creatureAnchor,
          {
            top: H * 0.1,
            transform: [{ translateX: fishTranslateX }, { translateY: fishTranslateY }],
          },
        ]}
      >
        <NeonCreaturePng
          name="fish"
          color="#4DD8F0"
          size={fishSize}
          glowPulse={glowFish}
          scaleX={1}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.creatureAnchor,
          {
            top: H * 0.72,
            transform: [{ translateX: jellyTranslateX }, { translateY: jellyTranslateY }, { scale: jellyPulse }],
          },
        ]}
      >
        <NeonCreaturePng
          name="seahorse"
          color="#7AB5FF"
          size={seahorseSize}
          glowPulse={glowSeahorse}
          scaleX={1}
        />
      </Animated.View>
    </View>
  );
}

/** One shell inside a bubble — 2s lifecycle: float in, brief hold, burst */
function ShellBubbleInstance({ id, left, top, shellEmoji, onDone }) {
  const scale = useRef(new Animated.Value(0.35)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 680,
          easing: Easing.out(Easing.back(1.15)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 380,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2.05,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 0, duration: 620, useNativeDriver: true }),
      ]),
    ]);
    anim.start(({ finished }) => {
      if (finished) onDone?.(id);
    });
    return () => anim.stop();
  }, [id, onDone, opacity, scale]);

  const bubbleSize = 56;
  return (
    <Animated.View
      style={[
        styles.shellBubbleWrap,
        { left, top, opacity, transform: [{ scale }] },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.shellBubbleGlass, { width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2 }]}>
        <Text style={styles.shellEmoji} allowFontScaling={false}>
          {shellEmoji}
        </Text>
      </View>
    </Animated.View>
  );
}

function ShellBubbleBurstField() {
  const { width: W, height: H } = useWindowDimensions();
  const [instance, setInstance] = useState(null);
  const idRef = useRef(0);
  const mountedRef = useRef(true);
  const gapTimerRef = useRef(null);

  const spawn = useCallback(() => {
    const id = idRef.current++;
    const bubble = 56;
    const bands = ['top', 'bottom', 'left', 'right'];
    const band = bands[id % 4];
    const { left, top } = randomPointAwayFromCenter(W, H, bubble, band, id * 17);
    const shellEmoji = SHELL_EMOJIS[id % SHELL_EMOJIS.length];
    setInstance({ id, left, top, shellEmoji });
  }, [W, H]);

  const scheduleNext = useCallback(() => {
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    gapTimerRef.current = setTimeout(() => {
      gapTimerRef.current = null;
      if (mountedRef.current) spawn();
    }, SHELL_SEQUENCE_GAP_MS);
  }, [spawn]);

  const onShellDone = useCallback(
    (_id) => {
      setInstance(null);
      scheduleNext();
    },
    [scheduleNext]
  );

  useEffect(() => {
    mountedRef.current = true;
    spawn();
    return () => {
      mountedRef.current = false;
      if (gapTimerRef.current) {
        clearTimeout(gapTimerRef.current);
        gapTimerRef.current = null;
      }
    };
  }, [spawn]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {instance ? (
        <ShellBubbleInstance key={instance.id} {...instance} onDone={onShellDone} />
      ) : null}
    </View>
  );
}

export function OceanAnalyzingInterstitialDecor({ stepIndex }) {
  if (stepIndex < 0) {
    return null;
  }
  if (stepIndex === HEARTBEAT_STEP) {
    return <HeartBubbleField />;
  }
  if (stepIndex === SEA_ANIMALS_STEP) {
    return <SwimmingCreaturesLayer />;
  }
  if (stepIndex === SEA_SHELLS_STEP) {
    return <ShellBubbleBurstField />;
  }
  return null;
}

export { HEARTBEAT_STEP, SEA_ANIMALS_STEP, SEA_SHELLS_STEP };

const styles = StyleSheet.create({
  heartBubbleWrap: {
    position: 'absolute',
  },
  bubbleGlass: {
    backgroundColor: 'rgba(120, 200, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(200, 235, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartInBubble: {
    textAlign: 'center',
    opacity: 0.95,
    color: '#FFFFFF',
  },
  creatureAnchor: {
    position: 'absolute',
    left: 0,
  },
  shellBubbleWrap: {
    position: 'absolute',
  },
  shellBubbleGlass: {
    backgroundColor: 'rgba(100, 190, 240, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(220, 240, 255, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(100, 200, 255, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  shellEmoji: {
    fontSize: 26,
    lineHeight: 30,
  },
});

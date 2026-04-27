/**
 * Full-screen interstitial after Dive In — sunlit surface-water gradient, concentric rings,
 * staged copy with per-line fade in / hold / fade out; then navigate to BreathSession.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionAmbient } from '../../hooks/useSessionAmbient';
import { OCEAN_SESSION_AUDIO_SOURCE } from '../../constants/sessionMedia';
import { OceanAnalyzingInterstitialDecor } from './OceanAnalyzingInterstitialDecor';

/** Long horizon so overlay music is not faded out before the session hook takes over. */
const INTERSTITIAL_AMBIENT_TOTAL_MS = 24 * 60 * 60 * 1000;

/** Slower fades + longer holds for readability */
const FADE_MS = 520;
const HOLD_MS = 2800;

/** After the last script line — “Game begins” style countdown */
const COUNTDOWN_SEQUENCE = [3, 2, 1];
const COUNTDOWN_FADE_IN_MS = 240;
const COUNTDOWN_HOLD_MS = 620;
const COUNTDOWN_FADE_OUT_MS = 220;

/**
 * Steps: each line fades in → holds → fades out before the next.
 * Then 3 → 2 → 1 countdown, then `onComplete`.
 */
const STEPS = [
  { text: 'Analyzing your heartbeat...', emphasis: 'light' },
  { text: 'and calculating your coherence...', emphasis: 'bold' },
  { text: 'Breathe deeper', emphasis: 'bold' },
  { text: 'Discover sea animals', emphasis: 'bold' },
  { text: "And don't forget to collect sea shells and pearls!", emphasis: 'bold' },
];

const COUNTDOWN_TOTAL_MS = COUNTDOWN_SEQUENCE.length * (
  COUNTDOWN_FADE_IN_MS + COUNTDOWN_HOLD_MS + COUNTDOWN_FADE_OUT_MS
);

export const OCEAN_ANALYZING_INTERSTITIAL_MS =
  STEPS.length * (2 * FADE_MS + HOLD_MS) + COUNTDOWN_TOTAL_MS;

/** Epipelagic / sunlit surface: cyan → clear tropical blue (lighter toward top like sky reflection) */
const SURFACE_OCEAN_GRADIENT = ['#5EC4EB', '#3FAFDC', '#2B98CC', '#1F7FA8'];

/** Shared center for rings + digit — avoids flex offset from hint text */
const COUNTDOWN_STAGE = 260;
const RING_OUTER = 260;
const RING_INNER = 160;

function CountdownRippleRings() {
  const waveA = useRef(new Animated.Value(0)).current;
  const waveB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const slow = (v, durationMs) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: durationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: durationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    const outerLoop = slow(waveA, 3200);
    const innerLoop = slow(waveB, 4100);
    outerLoop.start();
    innerLoop.start();
    return () => {
      outerLoop.stop();
      innerLoop.stop();
    };
  }, [waveA, waveB]);

  const outerScale = waveA.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.07],
  });
  const outerOpacity = waveA.interpolate({
    inputRange: [0, 1],
    outputRange: [0.07, 0.16],
  });
  const innerScale = waveB.interpolate({
    inputRange: [0, 1],
    outputRange: [1.05, 1],
  });
  const innerOpacity = waveB.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.18],
  });

  const innerOffset = (COUNTDOWN_STAGE - RING_INNER) / 2;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ringOuterAbs,
          {
            opacity: outerOpacity,
            transform: [{ scale: outerScale }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ringInnerAbs,
          {
            left: innerOffset,
            top: innerOffset,
            opacity: innerOpacity,
            transform: [{ scale: innerScale }],
          },
        ]}
      />
    </>
  );
}

export default function OceanAnalyzingInterstitial({ onComplete }) {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  /** `script` = interstitial lines; `countdown` = 3,2,1 then session */
  const [overlayPhase, setOverlayPhase] = useState('script');
  const [countdownN, setCountdownN] = useState(null);
  const textOpacity = useRef(new Animated.Value(0)).current;
  const countOpacity = useRef(new Animated.Value(0)).current;
  const countScale = useRef(new Animated.Value(0.5)).current;
  const wallStartRef = useRef(Date.now());
  const [wallMs, setWallMs] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWallMs(Date.now() - wallStartRef.current);
    }, 100);
    return () => clearInterval(id);
  }, []);

  useSessionAmbient({
    enabled: true,
    totalDurationMs: INTERSTITIAL_AMBIENT_TOTAL_MS,
    wallMs,
    source: OCEAN_SESSION_AUDIO_SOURCE,
  });

  useEffect(() => {
    let cancelled = false;

    const fadeTo = (value) =>
      new Promise((resolve) => {
        Animated.timing(textOpacity, {
          toValue: value,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => resolve(finished));
      });

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return;
        setStepIndex(i);
        textOpacity.setValue(0);
        await fadeTo(1);
        if (cancelled) return;
        await delay(HOLD_MS);
        if (cancelled) return;
        await fadeTo(0);
        if (cancelled) return;
      }

      if (cancelled) return;
      setOverlayPhase('countdown');

      for (const n of COUNTDOWN_SEQUENCE) {
        if (cancelled) return;
        setCountdownN(n);
        countOpacity.setValue(0);
        countScale.setValue(0.42);
        await new Promise((resolve) => {
          Animated.parallel([
            Animated.timing(countOpacity, {
              toValue: 1,
              duration: COUNTDOWN_FADE_IN_MS,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.spring(countScale, {
              toValue: 1,
              friction: 6,
              tension: 140,
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => resolve(finished));
        });
        if (cancelled) return;
        await delay(COUNTDOWN_HOLD_MS);
        if (cancelled) return;
        await new Promise((resolve) => {
          Animated.parallel([
            Animated.timing(countOpacity, {
              toValue: 0,
              duration: COUNTDOWN_FADE_OUT_MS,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(countScale, {
              toValue: 1.12,
              duration: COUNTDOWN_FADE_OUT_MS,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => resolve(finished));
        });
        if (cancelled) return;
      }

      setCountdownN(null);
      if (!cancelled) onComplete?.();
    })();

    return () => {
      cancelled = true;
      textOpacity.stopAnimation();
      countOpacity.stopAnimation();
      countScale.stopAnimation();
    };
  }, [onComplete, countOpacity, countScale, textOpacity]);

  const step = STEPS[stepIndex] ?? STEPS[0];
  const textStyle = step.emphasis === 'light' ? styles.lineLight : styles.lineBold;

  const decorStepIndex = overlayPhase === 'countdown' ? -1 : stepIndex;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient
        colors={SURFACE_OCEAN_GRADIENT}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.42, y: 0 }}
        end={{ x: 0.58, y: 1 }}
      />
      <OceanAnalyzingInterstitialDecor stepIndex={decorStepIndex} />
      {overlayPhase === 'script' ? (
        <View style={styles.textWrap} pointerEvents="none">
          <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
            <Text style={textStyle}>{step.text}</Text>
          </Animated.View>
        </View>
      ) : (
        <>
          <View style={styles.countdownCenterWrap} pointerEvents="none">
            <View style={styles.countdownStage}>
              <CountdownRippleRings />
              <Animated.View
                style={[
                  styles.countdownDigitLayer,
                  {
                    opacity: countOpacity,
                    transform: [{ scale: countScale }],
                  },
                ]}
              >
                {countdownN !== null ? (
                  <Text
                    style={styles.countdownDigit}
                    allowFontScaling={false}
                    {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
                  >
                    {countdownN}
                  </Text>
                ) : null}
              </Animated.View>
            </View>
          </View>
          <Text
            style={[
              styles.countdownHint,
              { paddingBottom: Math.max(insets.bottom, 12) + 8 },
            ]}
            pointerEvents="none"
          >
            Game begins
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 105,
    elevation: 105,
    overflow: 'hidden',
  },
  countdownCenterWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** Rings + digit share one box so the number stays optically centered in the circles */
  countdownStage: {
    width: COUNTDOWN_STAGE,
    height: COUNTDOWN_STAGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringOuterAbs: {
    position: 'absolute',
    width: RING_OUTER,
    height: RING_OUTER,
    borderRadius: RING_OUTER / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    left: 0,
    top: 0,
  },
  ringInnerAbs: {
    position: 'absolute',
    width: RING_INNER,
    height: RING_INNER,
    borderRadius: RING_INNER / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  countdownDigitLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  textBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    maxWidth: 340,
  },
  lineLight: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 38,
    textShadowColor: 'rgba(91,200,245,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  lineBold: {
    fontSize: 30,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.97)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 40,
    textShadowColor: 'rgba(91,200,245,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  countdownDigit: {
    fontSize: 112,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.98)',
    letterSpacing: -4,
    lineHeight: 112,
    textAlign: 'center',
    textAlignVertical: 'center',
    textShadowColor: 'rgba(91,200,245,0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  countdownHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(200, 230, 255, 0.78)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

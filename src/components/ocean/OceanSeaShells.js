/**
 * Rare sea shells float briefly; tap to collect (once per shell type per session — parent dedupes).
 * Tap plays a short chime, then a pop: main bubble swells and fades while small bubbles scatter and vanish.
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { pickRandomZoneCollectible } from '../../constants/oceanZoneCollectibles';
import { isNormalizedPointInBreathingExclusion } from '../../constants/oceanSessionBreathingExclusion';
import { SHELL_TAP_CHIME_SOURCE } from '../../constants/sessionMedia';

const SHELL_SIZE = 52;
const SPAWN_MIN_MS = 7500;
const SPAWN_MAX_MS = 17000;
const ON_SCREEN_MS = 15000;

/** Main bubble: subtle nip, then gentle swell + dissolve (small zoom — emphasis on particles) */
const BURST_ANTICIPATION_MS = 70;
const BURST_EXPAND_MS = 400;
const BURST_ANTICIPATION_SCALE = 1.06;
const BURST_EXPAND_SCALE = 1.38;
/** Mini bubbles: drift out and fade (stagger overlaps main) */
const PARTICLE_COUNT = 16;
const PARTICLE_DURATION_MS = 460;
const PARTICLE_STAGGER_MS = 14;
const TAP_VOLUME = 0.22;

function hashInstId(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic 0…1 per shell instance + particle index */
function particleRng(seed, i) {
  const x = Math.sin(seed * 0.001 + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function ShellFloater({
  label,
  emoji,
  instId,
  left,
  top,
  onCollect,
  onShellTapSound,
  kind,
  collectId,
}) {
  const floatX = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const burstScale = useRef(new Animated.Value(1)).current;
  const burstOpacity = useRef(new Animated.Value(1)).current;
  const particleProgress = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => new Animated.Value(0))
  ).current;
  const floatXLoopRef = useRef(null);
  const floatYLoopRef = useRef(null);
  const pulseLoopRef = useRef(null);
  const settledRef = useRef(false);
  const [bursting, setBursting] = useState(false);

  const particleMeta = useMemo(() => {
    const seed = hashInstId(String(instId));
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const r1 = particleRng(seed, i * 3);
      const r2 = particleRng(seed, i * 3 + 1);
      const r3 = particleRng(seed, i * 3 + 2);
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (r1 - 0.5) * 0.95;
      const dist = 34 + r2 * 46;
      const size = 7 + r3 * 7;
      return { angle, dist, size };
    });
  }, [instId]);

  /** Like `OceanSwimmingCreatures` undulate — ± sway on X/Y with independent periods so motion stays organic. */
  const floatMotion = useMemo(() => {
    const seed = hashInstId(String(instId));
    const r = (k) => particleRng(seed, k);
    return {
      xAmp: 3 + r(20) * 3.5,
      yAmp: 5 + r(21) * 4,
      xMs: 2800 + Math.floor(r(22) * 900),
      yMs: 2300 + Math.floor(r(23) * 700),
    };
  }, [instId]);

  useEffect(() => {
    const { xAmp, yAmp, xMs, yMs } = floatMotion;
    const xLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatX, {
          toValue: xAmp,
          duration: xMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: -xAmp,
          duration: xMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const yLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: yAmp,
          duration: yMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: -yAmp,
          duration: yMs / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatXLoopRef.current = xLoop;
    floatYLoopRef.current = yLoop;
    xLoop.start();
    yLoop.start();
    return () => {
      xLoop.stop();
      yLoop.stop();
      floatXLoopRef.current = null;
      floatYLoopRef.current = null;
    };
  }, [floatMotion, floatX, floatY]);

  useEffect(() => {
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulseLoopRef.current = p;
    p.start();
    return () => {
      p.stop();
      pulseLoopRef.current = null;
    };
  }, [pulse]);

  const handlePress = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    setBursting(true);
    floatXLoopRef.current?.stop();
    floatYLoopRef.current?.stop();
    floatX.setValue(0);
    floatY.setValue(0);
    pulseLoopRef.current?.stop();
    pulse.setValue(1);
    particleProgress.forEach((p) => p.setValue(0));
    onShellTapSound?.();

    const mainBurst = Animated.sequence([
      Animated.timing(burstScale, {
        toValue: BURST_ANTICIPATION_SCALE,
        duration: BURST_ANTICIPATION_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(burstScale, {
          toValue: BURST_EXPAND_SCALE,
          duration: BURST_EXPAND_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(burstOpacity, {
          toValue: 0,
          duration: BURST_EXPAND_MS - 20,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const particleBurst = Animated.stagger(
      PARTICLE_STAGGER_MS,
      particleProgress.map((p) =>
        Animated.timing(p, {
          toValue: 1,
          duration: PARTICLE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    );

    Animated.parallel([mainBurst, particleBurst]).start(({ finished }) => {
      if (finished) onCollect(instId, kind, collectId);
    });
  }, [
    burstOpacity,
    burstScale,
    collectId,
    instId,
    kind,
    onCollect,
    onShellTapSound,
    particleProgress,
    pulse,
  ]);

  const anchorSize = SHELL_SIZE + 20;
  const center = anchorSize / 2;

  return (
    <Animated.View
      style={[
        styles.anchor,
        { left, top },
        { transform: [{ translateX: floatX }, { translateY: floatY }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Collect ${label}`}
        style={styles.hit}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View style={[styles.burstStage, { width: anchorSize, height: anchorSize }]}>
          <Animated.View
            style={[
              styles.burstWrap,
              styles.bubbleLayer,
              {
                opacity: burstOpacity,
                transform: [{ scale: burstScale }],
              },
            ]}
          >
            <Animated.View style={[styles.glowRing, { transform: [{ scale: pulse }] }]}>
              <View style={styles.glowInner}>
                <Text style={styles.emoji} allowFontScaling={false}>
                  {emoji}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>

          {bursting
            ? particleMeta.map((meta, i) => {
                const t = particleProgress[i];
                const tx = t.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.cos(meta.angle) * meta.dist],
                });
                const ty = t.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(meta.angle) * meta.dist],
                });
                const op = t.interpolate({
                  inputRange: [0, 0.08, 0.78, 1],
                  outputRange: [0, 0.95, 0.35, 0],
                });
                const sc = t.interpolate({
                  inputRange: [0, 0.25, 1],
                  outputRange: [0.85, 1, 0.2],
                });
                const { size } = meta;
                return (
                  <Animated.View
                    key={`p-${i}`}
                    pointerEvents="none"
                    style={[
                      styles.popParticle,
                      styles.particleLayer,
                      {
                        left: center - size / 2,
                        top: center - size / 2,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        opacity: op,
                        transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
                      },
                    ]}
                  />
                );
              })
            : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OceanSeaShells({ active = false, depthM = 0, oceanLevelId, onCollect }) {
  const { width: W, height: H } = useWindowDimensions();
  const depthRef = useRef(depthM);
  depthRef.current = depthM;
  const [instances, setInstances] = useState([]);
  const instIdRef = useRef(0);
  const spawnTimersRef = useRef([]);
  const expireTimersRef = useRef([]);

  const tapPlayer = useAudioPlayer(SHELL_TAP_CHIME_SOURCE, { updateInterval: 250 });
  const tapStatus = useAudioPlayerStatus(tapPlayer);

  const playShellTapSound = useCallback(() => {
    if (!tapStatus.isLoaded) return;
    try {
      tapPlayer.loop = false;
      tapPlayer.volume = TAP_VOLUME;
      tapPlayer
        .seekTo(0)
        .then(() => {
          tapPlayer.play();
        })
        .catch(() => {});
    } catch (_) {}
  }, [tapPlayer, tapStatus.isLoaded]);

  const removeInstance = useCallback((instId) => {
    setInstances((prev) => prev.filter((x) => x.id !== instId));
  }, []);

  const trySpawn = useCallback(() => {
    const marginX = 28;
    const marginTop = H * 0.19;
    const marginBot = H * 0.36;
    const anchor = SHELL_SIZE + 20;
    const spanW = Math.max(40, W - 2 * marginX - anchor);
    const spanH = Math.max(40, H - marginTop - marginBot - anchor);

    const pickPositionAwayFromBreathingDot = () => {
      for (let attempt = 0; attempt < 36; attempt++) {
        const left = marginX + Math.random() * spanW;
        const top = marginTop + Math.random() * spanH;
        const nx = (left + anchor / 2) / W;
        const ny = (top + anchor / 2) / H;
        if (!isNormalizedPointInBreathingExclusion(nx, ny)) {
          return { left, top };
        }
      }
      const stripMaxTop = H * 0.34 - anchor;
      const top =
        marginTop + Math.random() * Math.max(16, Math.max(0, stripMaxTop - marginTop));
      let left = marginX + Math.random() * spanW;
      let nx = (left + anchor / 2) / W;
      const ny = (top + anchor / 2) / H;
      if (isNormalizedPointInBreathingExclusion(nx, ny)) {
        left = Math.random() < 0.5 ? marginX : W - marginX - anchor;
      }
      return { left, top };
    };

    setInstances((prev) => {
      if (prev.length >= 2) return prev;
      const picked = pickRandomZoneCollectible(oceanLevelId);
      const id = `inst_${instIdRef.current++}`;
      const { left, top } = pickPositionAwayFromBreathingDot();
      const row =
        picked.kind === 'shell'
          ? {
              id,
              kind: 'shell',
              collectId: picked.item.id,
              label: picked.item.name,
              emoji: picked.item.emoji,
              left,
              top,
            }
          : {
              id,
              kind: 'pearl',
              collectId: picked.item.id,
              label: picked.item.name,
              emoji: picked.item.emoji,
              left,
              top,
            };
      const ex = setTimeout(() => removeInstance(id), ON_SCREEN_MS);
      expireTimersRef.current.push(ex);
      return [...prev, row];
    });
  }, [H, W, removeInstance, oceanLevelId]);

  useEffect(() => {
    const clearAllSpawn = () => {
      spawnTimersRef.current.forEach(clearTimeout);
      spawnTimersRef.current = [];
    };
    expireTimersRef.current.forEach(clearTimeout);
    expireTimersRef.current = [];
    clearAllSpawn();

    if (!active) {
      setInstances([]);
      return undefined;
    }

    const scheduleNext = () => {
      const delay = SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS);
      const tid = setTimeout(() => {
        trySpawn();
        scheduleNext();
      }, delay);
      spawnTimersRef.current.push(tid);
    };

    const boot = setTimeout(() => {
      trySpawn();
      scheduleNext();
    }, 1600 + Math.random() * 2200);
    spawnTimersRef.current.push(boot);

    return () => {
      clearAllSpawn();
      expireTimersRef.current.forEach(clearTimeout);
      expireTimersRef.current = [];
    };
  }, [active, trySpawn]);

  const handleCollect = useCallback(
    (instId, kind, collectId) => {
      onCollect?.(kind, collectId);
      removeInstance(instId);
    },
    [onCollect, removeInstance]
  );

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {instances.map((inst) => (
        <ShellFloater
          key={inst.id}
          instId={inst.id}
          kind={inst.kind}
          collectId={inst.collectId}
          label={inst.label}
          emoji={inst.emoji}
          left={inst.left}
          top={inst.top}
          onCollect={handleCollect}
          onShellTapSound={playShellTapSound}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: SHELL_SIZE + 20,
    height: SHELL_SIZE + 20,
  },
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstStage: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  burstWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleLayer: {
    zIndex: 1,
  },
  particleLayer: {
    zIndex: 2,
  },
  popParticle: {
    position: 'absolute',
    backgroundColor: 'rgba(190, 235, 255, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#a8dcff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 3,
    elevation: 2,
  },
  glowRing: {
    width: SHELL_SIZE + 12,
    height: SHELL_SIZE + 12,
    borderRadius: (SHELL_SIZE + 12) / 2,
    backgroundColor: 'rgba(120, 200, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 235, 255, 0.35)',
  },
  glowInner: {
    width: SHELL_SIZE,
    height: SHELL_SIZE,
    borderRadius: SHELL_SIZE / 2,
    backgroundColor: 'rgba(0, 40, 80, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
});

/**
 * Breath play session — theme gradient + ambient audio from `sessionMedia`.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  UIManager,
  Alert,
  useWindowDimensions,
  StatusBar as RNStatusBar,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { HelpCircle } from 'lucide-react-native';
import { useMysession } from '../context/mysessionContext';
import { spacing, borderRadius, gradients, palette } from '../theme';
import ZentangleRadialArt from '../components/ZentangleRadialArt';
import HrvWaveStrip from '../components/HrvWaveStrip';
import HrvWaveStripHeart from '../components/HrvWaveStripHeart';
import HeartCoherencePills from '../components/HeartCoherencePills';
import OceanSessionScrollingBackground from '../components/ocean/OceanSessionScrollingBackground';
import OceanUnderwaterAmbientOverlay from '../components/ocean/OceanUnderwaterAmbientOverlay';
import OceanDepthCinematicOverlay from '../components/ocean/OceanDepthCinematicOverlay';
import OceanRisingBubbles from '../components/ocean/OceanRisingBubbles';
import OceanSwimmingCreatures from '../components/ocean/OceanSwimmingCreatures';
import OceanZoneLightingLayer from '../components/ocean/OceanZoneLightingLayer';
import OceanSeafloorLayer from '../components/ocean/OceanSeafloorLayer';
import OceanSeaShells from '../components/ocean/OceanSeaShells';
import OceanFingerBubbleTrail from '../components/ocean/OceanFingerBubbleTrail';
import MoodChooserModal from '../components/MoodChooserModal';
import { useSessionAmbient } from '../hooks/useSessionAmbient';
import { OCEAN_SESSION_AUDIO_SOURCE, SESSION_AUDIO_SOURCE } from '../constants/sessionMedia';
import {
  getOceanLevelById,
  getOceanLevelGroupId,
  getOceanZoneScrollDepthBoundsM,
  OCEAN_FULL_COLUMN_LEVEL_ID,
  OCEAN_BACKDROP_DEPTH_MAX_M,
} from '../constants/oceanDepthLevels';
import {
  getPelagicDepthOverlayGradientRGBA,
  pelagicNormalizedDepthM,
} from '../constants/oceanPelagicLayerColors';
import { oceanSessionBackdropEasedU } from '../constants/oceanSessionScrollMath';
import {
  OCEAN_CINEMATIC_ZONES,
  getCinematicZoneIndexByDepth,
} from '../constants/oceanCinematicZones';
import {
  SACRED_GEOMETRY_SYMBOLS,
  SACRED_SYMBOL_COUNT,
  getRewardSymbolIndexForTitle,
} from '../constants/sacredGeometryRewards';
import { ZONE_INFO } from '../constants/oceanZoneInfo';

if (
  Platform.OS === 'android' &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function' &&
  typeof global !== 'undefined' &&
  !global.nativeFabricUIManager
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CAL_MS = 4000;
/** Header / UI icons — 34×34 pt */
const SESSION_HEADER_ICON_PX = 34;
/** Ocean bottom HUD: HRV wave starts after divider; ends before glass edge */
const OCEAN_WAVE_INSET_AFTER_DIVIDER = 20;
const OCEAN_WAVE_INSET_BEFORE_GLASS_END = 30;
/** Glass HUD: visible for this long, then fades out; tap empty band to show again */
const OCEAN_HUD_VISIBLE_MS = 5000;
const OCEAN_HUD_FADE_MS = 320;

export default function BreathSessionScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const route = useRoute();
  const nav = useNavigation();
  const {
    completePlaySession,
    totalSessions,
    mergeShellCollection,
    mergePearlCollection,
    recordOceanModeSessionComplete,
    recordMoodEntry,
  } = useMysession();
  const sessionWallStartRef = useRef(Date.now());
  const [wallMs, setWallMs] = useState(0);
  /** Fades session UI to white before `replace` → SessionRewards */
  const sessionCompleteWhiteOpacity = useRef(new Animated.Value(0)).current;
  /** Ocean: navigate from level detail — fade session content in (no white flash). */
  const oceanEntryFadeIn = route.params?.oceanEntryFadeIn === true;
  const sessionRootOpacity = useRef(
    new Animated.Value(oceanEntryFadeIn && (route.params?.themeId ?? 'universe') === 'ocean' ? 0 : 1)
  ).current;

  const levelName = route.params?.levelName ?? '';
  const symbolName = route.params?.symbolName ?? levelName;
  const themeId = route.params?.themeId ?? 'universe';
  const oceanLevel = themeId === 'ocean' ? getOceanLevelById(route.params?.oceanLevelId) : null;
  const sessionTitle = (
    oceanLevel?.sessionTitle ??
    route.params?.sessionTitle ??
    (symbolName || levelName || 'Session')
  ).trim();
  const rewardSymbolIndex = getRewardSymbolIndexForTitle(sessionTitle);
  const mandalaVariant =
    SACRED_GEOMETRY_SYMBOLS[rewardSymbolIndex]?.id === 'torus' ? 'torusLotus' : 'flower';
  const sessionBgGradient = themeId === 'ocean' ? gradients.gameSessionOcean : gradients.gameSessionUniverse;
  const oceanAccent = oceanLevel ? palette[oceanLevel.accentToken] ?? palette.hmAppBlue : palette.hmAppBlue;
  const oceanFullColumn = oceanLevel?.id === OCEAN_FULL_COLUMN_LEVEL_ID;
  const oceanZoneBounds = useMemo(() => {
    if (!oceanLevel) return { startM: 0, endM: 200 };
    if (oceanFullColumn) return { startM: 0, endM: OCEAN_BACKDROP_DEPTH_MAX_M };
    return getOceanZoneScrollDepthBoundsM(oceanLevel);
  }, [oceanLevel, oceanFullColumn]);
  const globalLevelIndex = route.params?.globalLevelIndex ?? 0;
  /** Mandala completes with session — max 2 minutes (sacred geometry timing). */
  const durationSec = Math.min(120, Math.max(30, route.params?.durationSec ?? 120));

  const [phase, setPhase] = useState('calibrating');
  const [elapsedMs, setElapsedMs] = useState(0);
  const scoreRef = useRef(0.45);
  const [scoreDisplay, setScoreDisplay] = useState(0.45);
  /** Coherence-driven dive progress — accumulates faster at high coherence, slower at low. */
  const coherenceDiveProgressRef = useRef(0);
  const [coherenceDiveProgress, setCoherenceDiveProgress] = useState(0);
  const sessionDoneRef = useRef(false);
  const totalSessionsRef = useRef(totalSessions);
  const [showZoneInfo, setShowZoneInfo] = useState(false);
  const [showStartMoodChooser, setShowStartMoodChooser] = useState(true);
  /** Width for `HrvWaveStripHeart` when embedded in bottom HUD (insets applied on track). */
  const [oceanWaveEmbedW, setOceanWaveEmbedW] = useState(0);
  /** After fade-out completes — tap the band to fade HUD back in for another 5s */
  const [oceanHudDismissed, setOceanHudDismissed] = useState(false);
  const oceanHudOpacity = useRef(new Animated.Value(1)).current;
  const oceanHudHideTimerRef = useRef(null);
  /** Unique sea shell / pearl ids collected this session (ocean only). */
  const collectedShellIdsRef = useRef([]);
  const collectedPearlIdsRef = useRef([]);

  const onShellCollect = useCallback((kind, collectId) => {
    if (kind === 'pearl') {
      if (collectedPearlIdsRef.current.includes(collectId)) return;
      collectedPearlIdsRef.current = [...collectedPearlIdsRef.current, collectId];
      return;
    }
    if (collectedShellIdsRef.current.includes(collectId)) return;
    collectedShellIdsRef.current = [...collectedShellIdsRef.current, collectId];
  }, []);

  useEffect(() => {
    totalSessionsRef.current = totalSessions;
  }, [totalSessions]);

  useEffect(() => {
    const id = setInterval(() => {
      setWallMs(Date.now() - sessionWallStartRef.current);
    }, 100);
    return () => clearInterval(id);
  }, []);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      return () => {
        ScreenOrientation.unlockAsync().catch(() => {});
      };
    }, [])
  );

  useEffect(() => {
    if (showStartMoodChooser) return undefined;
    const t = setTimeout(() => {
      setPhase('active');
    }, CAL_MS);
    return () => clearTimeout(t);
  }, [showStartMoodChooser]);

  const handleSelectStartMood = useCallback(
    (moodId) => {
      recordMoodEntry({ timing: 'start', moodId, skipped: false });
      setShowStartMoodChooser(false);
    },
    [recordMoodEntry]
  );

  const handleSkipStartMood = useCallback(() => {
    recordMoodEntry({ timing: 'start', moodId: null, skipped: true });
    setShowStartMoodChooser(false);
  }, [recordMoodEntry]);

  useEffect(() => {
    if (!oceanEntryFadeIn || themeId !== 'ocean') return;
    Animated.timing(sessionRootOpacity, {
      toValue: 1,
      duration: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [oceanEntryFadeIn, themeId, sessionRootOpacity]);

  const clearOceanHudTimer = useCallback(() => {
    if (oceanHudHideTimerRef.current) {
      clearTimeout(oceanHudHideTimerRef.current);
      oceanHudHideTimerRef.current = null;
    }
  }, []);

  const fadeOutOceanHud = useCallback(() => {
    clearOceanHudTimer();
    Animated.timing(oceanHudOpacity, {
      toValue: 0,
      duration: OCEAN_HUD_FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setOceanHudDismissed(true);
    });
  }, [oceanHudOpacity, clearOceanHudTimer]);

  const scheduleOceanHudAutoHide = useCallback(() => {
    clearOceanHudTimer();
    oceanHudHideTimerRef.current = setTimeout(fadeOutOceanHud, OCEAN_HUD_VISIBLE_MS);
  }, [clearOceanHudTimer, fadeOutOceanHud]);

  const revealOceanHud = useCallback(() => {
    clearOceanHudTimer();
    setOceanHudDismissed(false);
    Animated.timing(oceanHudOpacity, {
      toValue: 1,
      duration: OCEAN_HUD_FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) scheduleOceanHudAutoHide();
    });
  }, [oceanHudOpacity, clearOceanHudTimer, scheduleOceanHudAutoHide]);

  useEffect(() => {
    if (themeId !== 'ocean' || !oceanLevel || phase !== 'active') {
      clearOceanHudTimer();
      return;
    }
    oceanHudOpacity.setValue(1);
    setOceanHudDismissed(false);
    scheduleOceanHudAutoHide();
    return () => clearOceanHudTimer();
  }, [themeId, oceanLevel?.id, phase, clearOceanHudTimer, scheduleOceanHudAutoHide, oceanHudOpacity]);

  const goToSessionRewards = useCallback(
    (params) => {
      Animated.timing(sessionCompleteWhiteOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        nav.replace('SessionRewards', params);
      });
    },
    [nav, sessionCompleteWhiteOpacity]
  );

  /** Ocean session end: white flash, then Session Complete. */
  const completeOceanSessionAndNavigateToRewards = useCallback(() => {
    if (!oceanLevel) return;
    const mins = Math.max(1, Math.round(durationSec / 60));
    const shellIds = [...collectedShellIdsRef.current];
    const pearlIds = [...collectedPearlIdsRef.current];
    mergeShellCollection(shellIds);
    mergePearlCollection(pearlIds);
    completePlaySession(mins, 15, globalLevelIndex);
    const modeGroup = getOceanLevelGroupId(oceanLevel.id);
    if (modeGroup === 'drift' || modeGroup === 'swim') {
      recordOceanModeSessionComplete(modeGroup);
    }
    goToSessionRewards({
      themeId: 'ocean',
      oceanLevelId: oceanLevel.id,
      durationMinutes: mins,
      collectedShellIds: shellIds,
      collectedPearlIds: pearlIds,
    });
  }, [
    oceanLevel,
    durationSec,
    mergeShellCollection,
    mergePearlCollection,
    completePlaySession,
    globalLevelIndex,
    goToSessionRewards,
    recordOceanModeSessionComplete,
  ]);

  useEffect(() => {
    if (phase !== 'active') return;
    sessionDoneRef.current = false;
    collectedShellIdsRef.current = [];
    collectedPearlIdsRef.current = [];
    coherenceDiveProgressRef.current = 0;
    setCoherenceDiveProgress(0);
    const started = Date.now();
    setElapsedMs(0);
    const id = setInterval(() => {
      const e = Date.now() - started;
      setElapsedMs(e);
      // Coherence drives BOTH the speed of descent AND the maximum depth reached.
      // Normalize score (0.15 – 1.45) → 0–1, then map to factor range 0.05 – 1.40:
      //   Low coherence  ≈ 0.05 — barely descending
      //   Medium         ≈ 0.70 — moderate pace
      //   High           ≈ 1.40 — fast dive, reaches full depth ahead of time
      const coherenceT = Math.max(0, Math.min(1, (scoreRef.current - 0.15) / 1.3));
      const coherenceFactor = 0.05 + coherenceT * 1.35;
      coherenceDiveProgressRef.current = Math.min(
        1,
        coherenceDiveProgressRef.current + (50 / (durationSec * 1000)) * coherenceFactor
      );
      setCoherenceDiveProgress(coherenceDiveProgressRef.current);
      if (e >= durationSec * 1000 && !sessionDoneRef.current) {
        sessionDoneRef.current = true;
        if (themeId === 'ocean' && oceanLevel) {
          completeOceanSessionAndNavigateToRewards();
          return;
        }
        const highlightIndex = getRewardSymbolIndexForTitle(sessionTitle);
        const sessionsAfterThis = totalSessionsRef.current + 1;
        const collectionCount = Math.min(
          Math.max(sessionsAfterThis, highlightIndex + 1),
          SACRED_SYMBOL_COUNT
        );
        const mins = Math.max(1, Math.round(durationSec / 60));
        completePlaySession(mins, 15, globalLevelIndex);
        goToSessionRewards({
          collectionCount,
          highlightIndex,
          themeId,
          durationMinutes: mins,
        });
      }
    }, 50);
    return () => clearInterval(id);
  }, [
    phase,
    durationSec,
    completePlaySession,
    globalLevelIndex,
    sessionTitle,
    themeId,
    oceanLevel,
    completeOceanSessionAndNavigateToRewards,
    goToSessionRewards,
  ]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = setInterval(() => {
      scoreRef.current += (Math.random() - 0.47) * 0.12;
      scoreRef.current = Math.max(0.15, Math.min(1.45, scoreRef.current));
      setScoreDisplay(scoreRef.current);
    }, 280);
    return () => clearInterval(id);
  }, [phase]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const { lowPct, medPct, highPct } = useMemo(() => {
    const t = scoreDisplay / 1.45;
    const high = Math.round(Math.max(0, Math.min(100, t * 55)));
    const low = Math.round(Math.max(0, (1 - t) * 70));
    const med = Math.max(0, 100 - high - low);
    return { lowPct: low, medPct: med, highPct: high };
  }, [scoreDisplay]);

  /** 0–1 HRV-style drive for the wave; replace with HeartMath device HRV when integrated */
  const hrvNormalized = useMemo(() => {
    const t = (scoreDisplay - 0.15) / 1.3;
    return Math.max(0, Math.min(1, t));
  }, [scoreDisplay]);

  const elapsedSec = Math.floor(elapsedMs / 1000);
  /** Raw time-based progress (0–1) — drives session end timer only. */
  const sessionProgress = phase === 'active' ? Math.min(1, elapsedMs / (durationSec * 1000)) : 0;
  /**
   * Coherence-gated dive progress (0–1).
   * Advances at a rate proportional to coherence score: score ≥1.0 = full speed, lower = slower (min 20%).
   * Drives all visual ocean descent: backdrop scroll, depth meter, bubbles, creatures, tints.
   */
  const diveDriveProgress = phase === 'active' ? coherenceDiveProgress : 0;
  const mandalaSize = Math.min(winW - 24, 420);

  /** Modeled depth (m) — matches backdrop pan + tints (split zone or full column) */
  const modeledOceanDepthM = useMemo(() => {
    if (themeId !== 'ocean' || !oceanLevel) return 0;
    if (phase !== 'active') return oceanZoneBounds.startM;
    const u = oceanSessionBackdropEasedU(diveDriveProgress);
    return (
      oceanZoneBounds.startM + (oceanZoneBounds.endM - oceanZoneBounds.startM) * u
    );
  }, [themeId, oceanLevel, phase, diveDriveProgress, oceanZoneBounds]);

  /** 0–1 along full axis (−8000 m … 10,994 m) for light-band shimmer strength */
  const oceanDepthT = useMemo(() => {
    if (themeId !== 'ocean' || !oceanLevel) return 0;
    return pelagicNormalizedDepthM(modeledOceanDepthM);
  }, [themeId, oceanLevel, modeledOceanDepthM]);

  /** Same easing as backdrop — drives extra “going deeper” tint + vignette */
  const oceanDiveVisualU = useMemo(() => {
    if (phase !== 'active') return 0;
    return oceanSessionBackdropEasedU(diveDriveProgress);
  }, [phase, diveDriveProgress]);

  const pelagicOverlayColors = useMemo(
    () =>
      themeId === 'ocean' && oceanLevel
        ? getPelagicDepthOverlayGradientRGBA(modeledOceanDepthM, oceanDiveVisualU)
        : null,
    [themeId, oceanLevel, modeledOceanDepthM, oceanDiveVisualU]
  );
  const cinematicTintColor = useMemo(() => {
    if (themeId !== 'ocean' || !oceanLevel) return null;
    const idx = getCinematicZoneIndexByDepth(modeledOceanDepthM);
    return OCEAN_CINEMATIC_ZONES[idx]?.bgColor ?? '#062540';
  }, [themeId, oceanLevel, modeledOceanDepthM]);

  const showSessionBackdrop = phase === 'calibrating' || phase === 'active';
  const totalSessionMs = CAL_MS + durationSec * 1000;

  useSessionAmbient({
    enabled: showSessionBackdrop,
    totalDurationMs: totalSessionMs,
    wallMs,
    source: themeId === 'ocean' ? OCEAN_SESSION_AUDIO_SOURCE : SESSION_AUDIO_SOURCE,
  });

  return (
    <Animated.View
      style={[
        styles.bg,
        oceanEntryFadeIn && themeId === 'ocean' ? { opacity: sessionRootOpacity } : null,
      ]}
    >
      <RNStatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <MoodChooserModal
        visible={showStartMoodChooser}
        title="How do you feel right now?"
        subtitle="Pick your start mood before this session begins."
        onSelectMood={handleSelectStartMood}
        onSkip={handleSkipStartMood}
      />
      {themeId === 'ocean' && oceanLevel ? (
        <OceanSessionScrollingBackground
          sessionProgress={phase === 'active' ? diveDriveProgress : 0}
          phase={phase}
          hrvNormalized={phase === 'active' ? hrvNormalized : 0.5}
          zoneStartDepthM={oceanZoneBounds.startM}
          zoneEndDepthM={oceanZoneBounds.endM}
          fullColumnMode={oceanFullColumn}
        />
      ) : (
        <LinearGradient
          colors={sessionBgGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      )}
      {themeId === 'ocean' && oceanLevel && pelagicOverlayColors ? (
        <LinearGradient
          pointerEvents="none"
          colors={pelagicOverlayColors}
          locations={[0, 0.34, 0.66, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <OceanSeafloorLayer depthM={modeledOceanDepthM} />
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <OceanZoneLightingLayer depthM={modeledOceanDepthM} />
      ) : null}
      {themeId === 'ocean' && oceanLevel && cinematicTintColor ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: cinematicTintColor, opacity: 0.26 + oceanDiveVisualU * 0.18 },
          ]}
        />
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <LinearGradient
          pointerEvents="none"
          colors={[
            'transparent',
            `rgba(2, 8, 22, ${0.018 + (phase === 'active' ? oceanDiveVisualU * 0.12 : 0.015)})`,
          ]}
          locations={[0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <OceanRisingBubbles
          active={phase === 'active'}
          opacity={0.62}
          diveProgress={phase === 'active' ? diveDriveProgress : 0}
        />
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <OceanSwimmingCreatures
          active={phase === 'active'}
          diveProgress={phase === 'active' ? diveDriveProgress : 0}
          depthM={modeledOceanDepthM}
        />
      ) : null}
      {themeId === 'ocean' && oceanLevel && phase === 'active' ? (
        <OceanFingerBubbleTrail />
      ) : null}
      {themeId === 'ocean' && oceanLevel && phase === 'active' ? (
        <View style={styles.shellLayer} pointerEvents="box-none">
          <OceanSeaShells
            active
            depthM={modeledOceanDepthM}
            oceanLevelId={oceanLevel?.id}
            onCollect={onShellCollect}
          />
        </View>
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <OceanUnderwaterAmbientOverlay
          depthProgress={oceanDepthT}
          hrvNormalized={phase === 'active' ? hrvNormalized : 0.5}
          tintDepthM={modeledOceanDepthM}
        />
      ) : null}
      {themeId === 'ocean' && oceanLevel ? (
        <OceanDepthCinematicOverlay
          depthM={modeledOceanDepthM}
          visible={phase === 'calibrating' || phase === 'active'}
        />
      ) : null}

      {/* ── Ocean bottom HUD: glass panel fades out after 5s; tap band to fade in again ── */}
      {themeId === 'ocean' && oceanLevel && phase === 'active' ? (
        <View
          style={[styles.oceanBottomHud, { bottom: 96 + Math.min(insets.bottom, 10) }]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[styles.oceanBottomHudAnimated, { opacity: oceanHudOpacity }]}
            pointerEvents="none"
          >
            <View style={styles.oceanBottomHudGlass}>
              <View style={styles.oceanCoherenceCardSide}>
                <Text style={styles.oceanCoherenceLabel}>COHERENCE</Text>
                <Text style={styles.oceanCoherenceValue}>{scoreDisplay.toFixed(1)}</Text>
                <Text style={styles.oceanCoherenceSub}>
                  {scoreDisplay < 0.5 ? 'Low' : scoreDisplay < 1.0 ? 'Medium' : 'High'}
                </Text>
              </View>
              <View style={styles.oceanBottomHudDivider} />
              <View style={styles.oceanWavePillsCombined}>
                <View
                  style={styles.oceanHrvWaveTrack}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    const inner = w - OCEAN_WAVE_INSET_AFTER_DIVIDER - OCEAN_WAVE_INSET_BEFORE_GLASS_END;
                    if (inner > 0) setOceanWaveEmbedW(inner);
                  }}
                >
                  {oceanWaveEmbedW > 0 ? (
                    <HrvWaveStripHeart
                      hrv={hrvNormalized}
                      compact
                      embedWidth={oceanWaveEmbedW}
                    />
                  ) : null}
                </View>
                <View style={styles.oceanHeartPillsWrap}>
                  <HeartCoherencePills
                    lowPct={lowPct}
                    medPct={medPct}
                    highPct={highPct}
                    activeTier={scoreDisplay < 0.5 ? 'low' : scoreDisplay < 1.0 ? 'medium' : 'high'}
                    compact
                  />
                </View>
              </View>
            </View>
          </Animated.View>
          {oceanHudDismissed ? (
            <Pressable
              style={styles.oceanBottomHudTapBand}
              onPress={revealOceanHud}
              accessibilityRole="button"
              accessibilityLabel="Show coherence and wave panel"
            />
          ) : null}
        </View>
      ) : null}
      {themeId !== 'ocean' ? (
        <View style={[styles.bgDim, styles.bgDimUniverse]} pointerEvents="none" />
      ) : null}
      <View style={[styles.header, styles.headerCompact, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.headerSide}>
          <Text style={styles.timeLabelCompact}>Time {formatTime(phase === 'active' ? elapsedSec : 0)}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSessionTitle} numberOfLines={2}>
            {sessionTitle}
          </Text>
        </View>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <TouchableOpacity
            onPress={() => {
              if (themeId === 'ocean' && oceanLevel) {
                setShowZoneInfo(true);
              } else {
                Alert.alert(
                  sessionTitle || 'Session',
                  'Coherence is simulated until a HeartMath sensor is connected. Finish the session to collect sacred geometry symbols.'
                );
              }
            }}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <HelpCircle size={SESSION_HEADER_ICON_PX} color="rgba(255,255,255,0.88)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.goBack()} hitSlop={12} style={styles.exitBtn}>
            <Text style={styles.exitTextCompact}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {phase === 'calibrating' ? (
        oceanLevel ? null : (
          <View style={styles.calibBox}>
            <Text style={styles.calibTitleCosmic}>Take a breath</Text>
            <Text style={styles.calibSubCosmic}>Relax · Focus · Breathe</Text>
          </View>
        )
      ) : (
        <View
          style={[
            styles.activeColumn,
            themeId === 'ocean' && oceanLevel && phase === 'active' && styles.activeColumnOceanTouch,
          ]}
        >
          {themeId === 'ocean' && oceanLevel ? null : (
            <>
              <LinearGradient
                colors={['rgba(12, 24, 48, 0.55)', 'rgba(8, 16, 32, 0.62)']}
                style={styles.coherenceCardCompact}
              >
                <Text style={styles.coherenceLabelCompact}>Coherence</Text>
                <Text style={styles.coherenceValueCompact}>{scoreDisplay.toFixed(1)}</Text>
              </LinearGradient>
              <View style={styles.mandalaBlock}>
                <View style={styles.symbolGlow}>
                  <ZentangleRadialArt
                    progress={sessionProgress}
                    overlayOnCosmic
                    size={mandalaSize}
                    compactCaption
                    showCaption={false}
                    variant={mandalaVariant}
                  />
                </View>
              </View>
              <HrvWaveStrip hrv={hrvNormalized} />
              <View style={[styles.metricsZen, styles.metricsCompact, { paddingBottom: insets.bottom + spacing.sm }]}>
                <View style={[styles.metricPill, styles.metricPillCosmicLow]}>
                  <View style={styles.metricRow}>
                    <View style={[styles.zoneSq, styles.zoneSqAmber]} />
                    <Text style={styles.metricPillTextCompact}>Low {lowPct}%</Text>
                  </View>
                </View>
                <View style={[styles.metricPill, styles.metricPillCosmicMed]}>
                  <View style={styles.metricRow}>
                    <View style={[styles.zoneSq, styles.zoneSqBlue]} />
                    <Text style={styles.metricPillTextCompact}>Medium {medPct}%</Text>
                  </View>
                </View>
                <View style={[styles.metricPill, styles.metricPillCosmicHigh]}>
                  <View style={styles.metricRow}>
                    <View style={[styles.zoneSq, styles.zoneSqGreen]} />
                    <Text style={styles.metricPillTextCompact}>High {highPct}%</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      )}

      {/* ── Zone info modal ── */}
      <Modal
        visible={showZoneInfo && !!oceanLevel}
        transparent
        animationType="fade"
        onRequestClose={() => setShowZoneInfo(false)}
      >
        <View style={styles.zoneInfoBackdrop}>
          <View style={styles.zoneInfoCard}>
            {/* Coloured accent bar */}
            <View style={[styles.zoneInfoAccentBar, { backgroundColor: oceanAccent }]} />

            <ScrollView
              style={styles.zoneInfoScroll}
              contentContainerStyle={styles.zoneInfoScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title block */}
              <Text style={styles.zoneInfoTitle}>
                {(ZONE_INFO[oceanLevel?.id] ?? ZONE_INFO.epipelagic).title}
              </Text>
              <Text style={[styles.zoneInfoSubtitle, { color: oceanAccent }]}>
                {(ZONE_INFO[oceanLevel?.id] ?? ZONE_INFO.epipelagic).subtitle}
              </Text>

              {/* Divider */}
              <View style={styles.zoneInfoDivider} />

              {/* Body */}
              <Text style={styles.zoneInfoBody}>
                {(ZONE_INFO[oceanLevel?.id] ?? ZONE_INFO.epipelagic).body}
              </Text>

              {/* Coherence note */}
              <View style={styles.zoneInfoNotePill}>
                <Text style={styles.zoneInfoNoteText}>
                  Coherence is simulated until a HeartMath sensor is connected.
                </Text>
              </View>
            </ScrollView>

            {/* Close button */}
            <TouchableOpacity
              style={[styles.zoneInfoCloseBtn, { backgroundColor: oceanAccent }]}
              onPress={() => setShowZoneInfo(false)}
              activeOpacity={0.82}
            >
              <Text style={styles.zoneInfoCloseTxt}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: '#FFFFFF',
            opacity: sessionCompleteWhiteOpacity,
            zIndex: 10000,
            elevation: 10000,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  bg: { flex: 1, width: '100%', position: 'relative', overflow: 'hidden' },
  bgDim: {
    ...StyleSheet.absoluteFillObject,
  },
  bgDimUniverse: {
    backgroundColor: 'rgba(18, 8, 32, 0.28)',
  },
  oceanSpacer: {
    flex: 1,
    minHeight: 80,
  },
  oceanCreatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    opacity: 0.85,
  },
  oceanCreatureLabel: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 220,
    flexShrink: 1,
  },
  activeColumn: {
    flex: 1,
    width: '100%',
  },
  /** Let taps reach sea-shell layer in empty areas (shells render below this column in tree). */
  activeColumnOceanTouch: {
    pointerEvents: 'box-none',
  },
  shellLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 16,
    elevation: 16,
  },
  /** Bottom HUD: one glass panel — coherence | divider | wave + hearts */
  oceanBottomHud: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 20,
    elevation: 20,
    minHeight: 92,
  },
  oceanBottomHudAnimated: {
    width: '100%',
  },
  /** Invisible hit area when HUD is faded out — same footprint as glass row */
  oceanBottomHudTapBand: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  /** Single frosted panel — no inner fill layer; content sits on this surface only */
  oceanBottomHudGlass: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
  },
  oceanCoherenceCardSide: {
    width: 108,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 6,
  },
  oceanBottomHudDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 8,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  oceanWavePillsCombined: {
    flex: 1,
    minWidth: 0,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  /** Insets: wave starts 20px after divider, ends 30px before glass right — no inner fill */
  oceanHrvWaveTrack: {
    width: '100%',
    paddingLeft: OCEAN_WAVE_INSET_AFTER_DIVIDER,
    paddingRight: OCEAN_WAVE_INSET_BEFORE_GLASS_END,
    paddingBottom: 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  oceanHeartPillsWrap: {
    paddingHorizontal: 6,
    paddingTop: 2,
    backgroundColor: 'transparent',
  },
  oceanCoherenceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(157, 219, 245, 0.65)',
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  oceanCoherenceValue: {
    fontSize: 22,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.97)',
    letterSpacing: -0.5,
    lineHeight: 28,
    textAlign: 'center',
  },
  oceanCoherenceSub: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(157, 219, 245, 0.55)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    minHeight: 48,
    zIndex: 30,
    elevation: 30,
  },
  headerCompact: {
    minHeight: 40,
  },
  headerSide: { flex: 1, minWidth: 68 },
  headerSideRight: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  headerCenter: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  headerSessionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.98)',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  timeLabelCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 2,
  },
  exitTextCompact: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
  iconBtn: { padding: spacing.xs },
  exitBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, marginLeft: spacing.sm },
  coherenceCardCompact: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  coherenceLabelCompact: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(230, 236, 245, 0.65)',
    marginBottom: 2,
    letterSpacing: 0.8,
  },
  coherenceValueCompact: {
    fontSize: 26,
    fontWeight: '200',
    letterSpacing: -0.5,
    color: 'rgba(255,255,255,0.98)',
  },
  mandalaBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  symbolGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8CF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 16,
  },
  calibTitleCosmic: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.98)',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  calibDiveSubLine: {
    fontSize: 26,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 36,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(91,200,245,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  calibDiveLine: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.97)',
    textAlign: 'center',
    letterSpacing: 0.8,
    lineHeight: 42,
    textShadowColor: 'rgba(91,200,245,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  calibOceanInfographic: {
    flexDirection: 'row',
    alignItems: 'stretch',
    maxWidth: 420,
    width: '100%',
  },
  calibDepthRail: {
    width: 76,
    backgroundColor: '#000000',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-between',
    borderRadius: borderRadius.sm,
  },
  calibDepthMark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  calibOceanCopy: {
    flex: 1,
    paddingLeft: spacing.md,
    justifyContent: 'center',
  },
  calibZoneTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.98)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  calibDepthSpanText: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  calibSubCosmic: {
    fontSize: 15,
    color: 'rgba(230, 236, 245, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.md,
  },
  calibDiscovery: { marginTop: spacing.sm, fontSize: 14, opacity: 0.95 },
  metricPillCosmicLow: { backgroundColor: 'rgba(212, 168, 75, 0.22)' },
  metricPillCosmicMed: { backgroundColor: 'rgba(107, 159, 189, 0.26)' },
  metricPillCosmicHigh: { backgroundColor: 'rgba(145, 168, 140, 0.24)' },
  metricPillTextCompact: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.92)' },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneSq: {
    width: 7,
    height: 7,
    borderRadius: 1.5,
    marginRight: 5,
  },
  zoneSqAmber: { backgroundColor: 'rgba(255, 193, 7, 0.95)' },
  zoneSqBlue: { backgroundColor: 'rgba(66, 165, 245, 0.95)' },
  zoneSqGreen: { backgroundColor: 'rgba(102, 187, 106, 0.95)' },
  calibBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  metricsZen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: 'auto',
    paddingTop: spacing.sm,
  },
  metricsCompact: {
    paddingTop: spacing.xs,
  },
  metricPill: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: borderRadius.full,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
  },

  /* ── Zone info modal ─────────────────────────────────────────── */
  zoneInfoBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 6, 18, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  zoneInfoCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '82%',
    backgroundColor: '#07182E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(80,190,255,0.18)',
    overflow: 'hidden',
  },
  zoneInfoAccentBar: {
    height: 4,
    width: '100%',
    opacity: 0.85,
  },
  zoneInfoScroll: {
    flexGrow: 0,
  },
  zoneInfoScrollContent: {
    padding: 24,
    paddingBottom: 8,
  },
  zoneInfoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.97)',
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  zoneInfoSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 16,
  },
  zoneInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginBottom: 16,
  },
  zoneInfoBody: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 22,
    marginBottom: 20,
  },
  zoneInfoNotePill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  zoneInfoNoteText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
    textAlign: 'center',
  },
  zoneInfoCloseBtn: {
    margin: 16,
    marginTop: 8,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  zoneInfoCloseTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

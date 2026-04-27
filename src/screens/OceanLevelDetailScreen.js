/**
 * OceanLevelDetailScreen — per-zone detail, dive mode selector, and Dive In button.
 *
 * Mirrors the Constellation Game detail screens (Basic / Medium / Advanced)
 * adapted to the Ocean theme:
 *
 *   Drift  (Basic)    — sine-wave card  + "build your breath rhythm" coaching
 *   Swim   (Medium)   — HRV card        + sustain medium coherence
 *   Dive   (Advanced) — HRV card        + sustain high coherence
 *
 * Navigation params (in) :  levelId, themeId, durationSec
 * Navigates to            :  BreathSession (all required params)
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle, Ellipse } from 'react-native-svg';
import {
  getOceanLevelById,
  getOceanLevelGroupId,
  resolveLevelIdForGroup,
  getOceanLevelUnlockIndex,
} from '../constants/oceanDepthLevels';
import { getOceanSwimDiveUnlockState } from '../constants/oceanZoneCollectibles';
import { useBreathGarden } from '../context/BreathGardenContext';
import OceanGlassBubble from '../components/ocean/OceanGlassBubble';
import OceanAnalyzingInterstitial from '../components/ocean/OceanAnalyzingInterstitial';

/* ── Zone accent gradients (matches OceanTideScreen thumbnails) ─── */
const ZONE_GRADS = {
  fullColumn:    ['#2AA8D2', '#145FB0'],
  epipelagic:    ['#5ABCE0', '#1688C6'],
  mesopelagic:   ['#4F91C8', '#385FB7'],
  bathypelagic:  ['#5E58B5', '#3A2F8E'],
  abyssopelagic: ['#503A94', '#2A1E5F'],
  hadal:         ['#6A3A90', '#2A1240'],
};

/* ── Dive mode definitions ──────────────────────────────────────── */
/** Shown under the Drift / Swim / Dive control — matches pelagic level groupings. */
const MODE_ZONE_HINT = {
  drift: 'Epipelagic · Mesopelagic',
  swim: 'Bathypelagic · Abyssopelagic',
  dive: 'Hadalpelagic · Full column dive',
};

const MODES = [
  {
    id:       'drift',
    label:    'Drift',
    cardType: 'wave',
  },
  {
    id:        'swim',
    label:     'Swim',
    cardType:  'hrv',
    activeHrv: 'med',
    coaching:  ['Sustain ', 'medium coherence', ' for longer to complete the dive on time.'],
  },
  {
    id:        'dive',
    label:     'Dive',
    cardType:  'hrv',
    activeHrv: 'high',
    coaching:  ['Sustain ', 'high coherence', ' for longer to complete the dive on time.'],
  },
];

/* Mock HRV session history — real app would pull from data store */
const MOCK_HRV = { low: 10, med: 10, high: 80 };

/* ══════════════════════════════════════════════════════════════════ */
/*  HERO ORB (self-contained, matches OceanTideScreen style)          */
/* ══════════════════════════════════════════════════════════════════ */
function OceanHeroOrb() {
  const floatY = useRef(new Animated.Value(0)).current;
  const S = 128;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [floatY]);

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const scale = floatY.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });

  return (
    <Animated.View style={[heroSt.wrap, { transform: [{ translateY }, { scale }] }]}>
      <View style={heroSt.glowOuter} />
      <View style={heroSt.glowInner} />
      <Svg width={S} height={S} viewBox="0 0 148 148" style={heroSt.globe}>
        <SvgCircle cx={74} cy={74} r={72} fill="none"
          stroke="rgba(80,190,245,0.22)" strokeWidth={1.5} />
        <SvgCircle cx={74} cy={74} r={62}
          fill="rgba(4,30,72,0.88)"
          stroke="rgba(70,190,255,0.55)" strokeWidth={1.8} />
        <Path d="M12,55 Q40,47 74,55 Q108,63 136,55"
          stroke="rgba(80,200,255,0.28)" strokeWidth={1.5} fill="none" />
        <Path d="M12,70 Q40,62 74,70 Q108,78 136,70"
          stroke="rgba(80,200,255,0.42)" strokeWidth={2} fill="none" />
        <Path d="M15,85 Q40,77 74,85 Q108,93 133,85"
          stroke="rgba(80,200,255,0.28)" strokeWidth={1.5} fill="none" />
        <Path d="M74,12 Q108,40 108,74 Q108,108 74,136"
          stroke="rgba(80,200,255,0.16)" strokeWidth={1.2} fill="none" />
        <Path d="M74,12 Q40,40 40,74 Q40,108 74,136"
          stroke="rgba(80,200,255,0.10)" strokeWidth={1} fill="none" />
        <Ellipse cx={74} cy={22} rx={22} ry={7}
          fill="rgba(160,230,255,0.12)" />
        <Ellipse cx={74} cy={132} rx={30} ry={6}
          fill="rgba(0,0,0,0.25)" />
      </Svg>
      <View style={heroSt.reflection} />
      <View style={heroSt.sp1}><OceanGlassBubble size={20} /></View>
      <View style={heroSt.sp2}><OceanGlassBubble size={12} opacity={0.72} /></View>
      <View style={heroSt.sp3}><OceanGlassBubble size={15} opacity={0.85} /></View>
      <View style={heroSt.sp4}><OceanGlassBubble size={10} opacity={0.62} /></View>
    </Animated.View>
  );
}

const heroSt = StyleSheet.create({
  wrap: {
    width: 180, height: 168,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 26,
  },
  glowOuter: {
    position: 'absolute', width: 196, height: 196, borderRadius: 98,
    backgroundColor: 'rgba(30,140,210,0.07)',
  },
  glowInner: {
    position: 'absolute', width: 156, height: 156, borderRadius: 78,
    backgroundColor: 'rgba(30,140,210,0.11)',
  },
  globe: { zIndex: 1 },
  reflection: {
    position: 'absolute', bottom: 0,
    width: 78, height: 12, borderRadius: 39,
    backgroundColor: 'rgba(60,160,210,0.18)',
  },
  sp1: { position: 'absolute', top: 4,  right: 20 },
  sp2: { position: 'absolute', top: 26, left: 16 },
  sp3: { position: 'absolute', bottom: 26, right: 14 },
  sp4: { position: 'absolute', bottom: 46, left: 22 },
});

/* ══════════════════════════════════════════════════════════════════ */
/*  INFO CARD CONTENTS                                                 */
/* ══════════════════════════════════════════════════════════════════ */

/* Drift mode — sine-wave visual (mirrors Constellation "Basic" card) */
function WaveCard() {
  return (
    <View style={cardSt.waveWrap}>
      <Svg width={220} height={54} viewBox="0 0 220 54">
        <Path
          d="M0,27 C18,10 36,10 55,27 C74,44 92,44 110,27 C128,10 146,10 165,27 C184,44 202,44 220,27"
          stroke="#3ABFB8" strokeWidth={2.2} fill="none" strokeLinecap="round"
        />
        <SvgCircle cx={110} cy={27} r={5.5} fill="#3ABFB8" />
      </Svg>
      <Text style={cardSt.waveText}>
        Increase your capacity to{' '}
        <Text style={cardSt.bold}>sustain coherence.</Text>
      </Text>
    </View>
  );
}

/* Swim / Dive mode — HRV percentage breakdown + coaching */
function HrvCard({ mode }) {
  const { activeHrv, coaching } = mode;
  const tiers = [
    { id: 'low',  dot: '#F0C060', pct: MOCK_HRV.low  },
    { id: 'med',  dot: '#8FCC88', pct: MOCK_HRV.med  },
    { id: 'high', dot: '#3CC87A', pct: MOCK_HRV.high, label: 'High' },
  ];
  return (
    <View style={cardSt.hrvWrap}>
      <View style={cardSt.tierRow}>
        {tiers.map((t) => {
          const active = t.id === activeHrv;
          return active ? (
            <View key={t.id} style={cardSt.activePill}>
              <Text style={cardSt.activePillText}>{t.label ?? (t.id[0].toUpperCase() + t.id.slice(1))} {t.pct}%</Text>
            </View>
          ) : (
            <View key={t.id} style={cardSt.flatTier}>
              <View style={[cardSt.dot, { backgroundColor: t.dot }]} />
              <Text style={cardSt.flatText}>{t.pct}%</Text>
            </View>
          );
        })}
      </View>
      <View style={cardSt.divider} />
      <Text style={cardSt.coachText}>
        {coaching[0]}
        <Text style={cardSt.bold}>{coaching[1]}</Text>
        {coaching[2]}
      </Text>
    </View>
  );
}

const cardSt = StyleSheet.create({
  waveWrap: {
    alignItems: 'center',
    paddingTop: 18, paddingBottom: 14,
    paddingHorizontal: 16,
  },
  waveText: {
    fontSize: 14, fontWeight: '400', color: '#2A3A50',
    textAlign: 'center', marginTop: 12, lineHeight: 21,
  },
  hrvWrap: {
    paddingVertical: 18, paddingHorizontal: 22,
  },
  tierRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  activePill: {
    backgroundColor: '#2BA868',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20,
  },
  activePillText: {
    fontSize: 13, fontWeight: '700', color: '#fff',
  },
  flatTier: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  dot: {
    width: 14, height: 14, borderRadius: 7,
  },
  flatText: {
    fontSize: 13, color: '#4A5A70',
  },
  divider: {
    height: 1, backgroundColor: 'rgba(0,0,0,0.07)',
    marginVertical: 14,
  },
  coachText: {
    fontSize: 14, color: '#2A3A50',
    textAlign: 'center', lineHeight: 22,
  },
  bold: { fontWeight: '700' },
});

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN SCREEN                                                        */
/* ══════════════════════════════════════════════════════════════════ */
export default function OceanLevelDetailScreen() {
  const insets = useSafeAreaInsets();
  const nav    = useNavigation();
  const route  = useRoute();
  const { oceanMaxUnlockedLevelIndex, shellCollectionIds, pearlCollectionIds } = useBreathGarden();

  const { levelId, themeId = 'ocean', durationSec = 90 } = route.params ?? {};

  const { swimUnlocked, diveUnlocked } = useMemo(
    () => getOceanSwimDiveUnlockState(shellCollectionIds, pearlCollectionIds),
    [shellCollectionIds, pearlCollectionIds]
  );

  const [selectedMode, setSelectedMode] = useState(() => getOceanLevelGroupId(levelId));
  const [activeLevelId, setActiveLevelId] = useState(levelId);
  /** Dark analyzing interstitial → navigate to BreathSession (fade-in entry, no white flash). */
  const [showAnalyzingOverlay, setShowAnalyzingOverlay] = useState(false);
  const pendingBreathParams = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setShowAnalyzingOverlay(false);
      return undefined;
    }, [])
  );

  /** If this timeline zone is Swim/Dive but that mode is not unlocked yet, fall back to the best allowed mode + zone. */
  useEffect(() => {
    const g = getOceanLevelGroupId(levelId);
    let nextMode = g;
    let nextLevel = levelId;
    if (g === 'dive' && !diveUnlocked) {
      if (swimUnlocked) {
        nextMode = 'swim';
        nextLevel = resolveLevelIdForGroup('swim', levelId);
      } else {
        nextMode = 'drift';
        nextLevel = resolveLevelIdForGroup('drift', levelId);
      }
    } else if (g === 'swim' && !swimUnlocked) {
      nextMode = 'drift';
      nextLevel = resolveLevelIdForGroup('drift', levelId);
    }
    setSelectedMode(nextMode);
    setActiveLevelId(nextLevel);
  }, [levelId, swimUnlocked, diveUnlocked]);

  const level = getOceanLevelById(activeLevelId);
  const levelUnlockIdx = getOceanLevelUnlockIndex(level.id);
  const levelLocked = levelUnlockIdx > oceanMaxUnlockedLevelIndex;

  const accentGrad = ZONE_GRADS[level?.id] ?? ZONE_GRADS.epipelagic;
  const mode       = MODES.find((m) => m.id === selectedMode) ?? MODES[2];

  const onSelectMode = (modeId) => {
    if (modeId === 'swim' && !swimUnlocked) {
      Alert.alert(
        'Swim locked',
        'Collect all shells and pearls in Epipelagic and Mesopelagic (Drift zones) to unlock Swim.',
      );
      return;
    }
    if (modeId === 'dive' && !diveUnlocked) {
      Alert.alert(
        'Dive locked',
        'Collect all shells and pearls in Bathypelagic and Abyssopelagic (Swim zones) to unlock Dive.',
      );
      return;
    }
    setSelectedMode(modeId);
    setActiveLevelId((prev) => resolveLevelIdForGroup(modeId, prev));
  };

  const startSession = () => {
    if (getOceanLevelUnlockIndex(level.id) > oceanMaxUnlockedLevelIndex) {
      Alert.alert(
        'Zone locked',
        'Collect all shells and pearls in the previous pelagic zone to unlock this dive.',
      );
      return;
    }
    if (selectedMode === 'swim' && !swimUnlocked) {
      Alert.alert(
        'Swim locked',
        'Collect every shell and pearl in Epipelagic and Mesopelagic to unlock Swim.',
      );
      return;
    }
    if (selectedMode === 'dive' && !diveUnlocked) {
      Alert.alert(
        'Dive locked',
        'Collect every shell and pearl in Bathypelagic and Abyssopelagic to unlock Dive.',
      );
      return;
    }
    pendingBreathParams.current = {
      themeId,
      oceanLevelId: level.id,
      levelName: level.zone,
      symbolName: level.creature,
      sessionTitle: level.sessionTitle,
      durationSec,
      globalLevelIndex: -1,
    };
    setShowAnalyzingOverlay(true);
  };

  const onAnalyzingComplete = useCallback(() => {
    setShowAnalyzingOverlay(false);
    const p = pendingBreathParams.current;
    pendingBreathParams.current = null;
    if (p) {
      nav.navigate('BreathSession', {
        ...p,
        oceanEntryFadeIn: true,
      });
    }
  }, [nav]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0A2448', '#0C3460', '#0E2658', '#081830']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 44 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showAnalyzingOverlay}
      >
        {/* ── Title + zone subtitle ── */}
        <Text style={styles.title}>The Ocean Dive</Text>
        <Text style={styles.subtitle}>{level.zone}</Text>

        {/* ── Description ── */}
        <Text style={styles.description}>
          Use your heart's coherence to descend through the{' '}
          <Text style={styles.descBold}>{level.zone}</Text>
          {'\n'}and explore the depths of {level.depthRange}
        </Text>

        {/* ── Hero orb ── */}
        <OceanHeroOrb />

        {/* ── Info card (white) ── */}
        <View style={styles.card}>
          {mode.cardType === 'wave' ? <WaveCard /> : <HrvCard mode={mode} />}
        </View>

        {/* ── Dive mode selector (Drift always; Swim/Dive unlock via Drift+shells / Swim+shells) ── */}
        <View style={styles.modeBar}>
          {MODES.map((m) => {
            const active = m.id === selectedMode;
            const modeLocked =
              (m.id === 'swim' && !swimUnlocked) || (m.id === 'dive' && !diveUnlocked);
            if (active) {
              return (
                <LinearGradient
                  key={m.id}
                  colors={accentGrad}
                  style={styles.modeSegmentActive}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <TouchableOpacity
                    onPress={() => onSelectMode(m.id)}
                    activeOpacity={0.9}
                    style={styles.modeSegmentInner}
                  >
                    <Text style={styles.modeLabelActive}>{m.label}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            }
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeSegment, modeLocked && styles.modeSegmentLocked]}
                onPress={() => onSelectMode(m.id)}
                activeOpacity={0.75}
              >
                {modeLocked ? (
                  <View style={styles.modeLabelRow}>
                    <Lock size={12} color="rgba(255,255,255,0.45)" style={{ marginRight: 4 }} />
                    <Text style={styles.modeLabelLocked}>{m.label}</Text>
                  </View>
                ) : (
                  <Text style={styles.modeLabel}>{m.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.modeHint}>{MODE_ZONE_HINT[selectedMode]}</Text>
        {!swimUnlocked ? (
          <Text style={styles.modeUnlockHint}>
            Swim unlocks after a completed Drift session and all Drift shells collected.
          </Text>
        ) : !diveUnlocked ? (
          <Text style={styles.modeUnlockHint}>
            Dive unlocks after a completed Swim session and all Swim shells collected.
          </Text>
        ) : null}

        {/* ── Dive In button ── */}
        <TouchableOpacity
          onPress={startSession}
          activeOpacity={0.88}
          style={[styles.diveTouchable, levelLocked && styles.diveTouchableLocked]}
        >
          <LinearGradient
            colors={levelLocked ? ['#444C60', '#3A3F52'] : ['#3A65C0', '#5535A8', '#3A1C88']}
            style={styles.diveGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.diveText, levelLocked && styles.diveTextLocked]}>
              {levelLocked ? 'Locked' : 'Dive In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {showAnalyzingOverlay ? (
        <OceanAnalyzingInterstitial onComplete={onAnalyzingComplete} />
      ) : null}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  scroll: {
    paddingHorizontal: 22,
  },

  title: {
    fontSize: 22, fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, fontWeight: '500',
    color: 'rgba(150,220,255,0.90)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  description: {
    fontSize: 14, fontWeight: '400',
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
    marginBottom: 28,
  },
  descBold: { fontWeight: '700', color: 'rgba(255,255,255,0.96)' },

  /* White card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 28,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    // Android
    elevation: 5,
    overflow: 'hidden',
  },

  /* Mode selector bar */
  modeBar: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    overflow: 'hidden',
    height: 48,
  },
  modeSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSegmentLocked: {
    opacity: 0.92,
  },
  modeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabelLocked: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.42)',
  },
  modeUnlockHint: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(180,220,255,0.55)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  modeSegmentActive: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  modeSegmentInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontSize: 14, fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
  modeLabelActive: {
    fontSize: 14, fontWeight: '700',
    color: '#FFFFFF',
  },
  modeHint: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  /* Dive In button */
  diveTouchable: {
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 12,
  },
  diveTouchableLocked: {
    opacity: 0.92,
  },
  diveGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diveText: {
    fontSize: 17, fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  diveTextLocked: {
    color: 'rgba(255,255,255,0.75)',
  },
});

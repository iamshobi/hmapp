/**
 * Session rewards — Session Complete, zone/symbol badges, shells (ocean), My Shell Collection,
 * How do you feel now, My Notes, Done.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle as SvgCircle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMysession } from '../context/mysessionContext';
import SacredSymbolMini from '../components/SacredSymbolMini';
import { SACRED_GEOMETRY_SYMBOLS, SACRED_SYMBOL_COUNT } from '../constants/sacredGeometryRewards';
import { getOceanLevelById, getOceanLevelGroupId } from '../constants/oceanDepthLevels';
import { getSeaShellById } from '../constants/seaShells';
import { getPearlById } from '../constants/oceanZoneCollectibles';
import OceanGlassBubble from '../components/ocean/OceanGlassBubble';
import SessionMoodFaceIcon from '../components/SessionMoodFaceIcons';
import MoodChooserModal from '../components/MoodChooserModal';
import { gradients, shadows } from '../theme';

/** Shared text / chrome — cards & accents switch via `SESSION_REWARDS_THEMES` */
const C = {
  white:   '#FFFFFF',
  white72: 'rgba(255,255,255,0.72)',
  white50: 'rgba(255,255,255,0.50)',
  white18: 'rgba(255,255,255,0.18)',
  white12: 'rgba(255,255,255,0.12)',
};

/**
 * Session Complete screen: magenta/purple (universe / sacred geometry) vs deep blue–teal (ocean),
 * aligned with `gradients.gameSessionOcean` and Ocean Tide accents.
 */
const SESSION_REWARDS_THEMES = {
  universe: {
    grad: ['#D81B7A', '#8B1FA8', '#5E1688'],
    iconGrad: ['#00C2D8', '#0076CB'],
    selGrad: ['#FFB300', '#FF6D00', '#E91E63'],
    doneTxt: '#8B1FA8',
    cardBg: 'rgba(255,255,255,0.14)',
    cardBdr: 'rgba(255,255,255,0.22)',
    journalInputBorder: 'rgba(255,255,255,0.18)',
    journalInputBg: 'rgba(255,255,255,0.07)',
    shellNavBorder: 'rgba(255,255,255,0.35)',
    shellNavBg: 'rgba(255,255,255,0.12)',
    moodUnselBg: 'rgba(255,255,255,0.20)',
    gradientStart: { x: 0.4, y: 0 },
    gradientEnd: { x: 0.6, y: 1 },
  },
  ocean: {
    grad: [...gradients.gameSessionOcean],
    iconGrad: ['#2AB8E0', '#1070CB'],
    selGrad: ['#4DD0E1', '#00ACC1', '#006064'],
    doneTxt: '#01579B',
    cardBg: 'rgba(130, 210, 255, 0.14)',
    cardBdr: 'rgba(80, 180, 230, 0.38)',
    journalInputBorder: 'rgba(100, 200, 255, 0.30)',
    journalInputBg: 'rgba(15, 55, 95, 0.45)',
    shellNavBorder: 'rgba(120, 210, 255, 0.50)',
    shellNavBg: 'rgba(25, 85, 130, 0.45)',
    moodUnselBg: 'rgba(50, 130, 190, 0.38)',
    gradientStart: { x: 0.35, y: 0 },
    gradientEnd: { x: 0.65, y: 1 },
  },
};

/* ── SVG helpers ─────────────────────────────────────────────────── */
function HeartPlusIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 14 21 14 21"
        stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M5 7V11M3 9H7" stroke="white" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SparkleIcon({ size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 2 12.8 6.5 14.5 8.5C16.2 10.5 21 11.2 21 12C21 12.8 16.2 13.5 14.5 15.5C12.8 17.5 12 22 12 22C12 22 11.2 17.5 9.5 15.5C7.8 13.5 3 12.8 3 12C3 11.2 7.8 10.5 9.5 8.5C11.2 6.5 12 2 12 2Z"
        fill="white"
      />
      <Path
        d="M19 2C19 2 19.4 3.8 20.2 4.6C21 5.4 23 5.8 23 6.2C23 6.6 21 7 20.2 7.8C19.4 8.6 19 10 19 10C19 10 18.6 8.6 17.8 7.8C17 7 15 6.6 15 6.2C15 5.8 17 5.4 17.8 4.6C18.6 3.8 19 2 19 2Z"
        fill="rgba(255,255,255,0.70)"
      />
    </Svg>
  );
}

/* ── Floating celebration particle (sparkle = universe, glass bubble = ocean) ── */
function CelebrationParticle({ x, y, delay, size = 10, travelY = 48, ocean = false }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let stopped = false;
    const cycle = () => {
      if (stopped) return;
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!stopped) setTimeout(cycle, 600 + Math.random() * 1400);
      });
    };
    cycle();
    return () => { stopped = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -travelY] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.10, 0.60, 1], outputRange: [0, 1, 0.75, 0] });
  const scale      = anim.interpolate({ inputRange: [0, 0.18, 0.65, 1], outputRange: [0.1, 1.2, 1.0, 0.4] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x, top: y, opacity, transform: [{ translateY }, { scale }] }}
    >
      {ocean ? (
        <OceanGlassBubble size={size} />
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2C12 2 12.8 6.5 14.5 8.5C16.2 10.5 21 11.2 21 12C21 12.8 16.2 13.5 14.5 15.5C12.8 17.5 12 22 12 22C12 22 11.2 17.5 9.5 15.5C7.8 13.5 3 12.8 3 12C3 11.2 7.8 10.5 9.5 8.5C11.2 6.5 12 2 12 2Z"
            fill="rgba(255,255,255,0.92)"
          />
        </Svg>
      )}
    </Animated.View>
  );
}

/* ── Corner accent — sparkles (universe) vs glass bubbles (ocean) ── */
function CornerAccent({ corner, ocean = false }) {
  const flipX = corner === 'tr' || corner === 'br';
  const flipY = corner === 'bl' || corner === 'br';
  const size  = 88;
  return (
    <View pointerEvents="none" style={[styles.corner, styles[`corner_${corner}`]]}>
      <Svg
        width={size} height={size} viewBox="0 0 88 88"
        style={{ transform: [{ scaleX: flipX ? -1 : 1 }, { scaleY: flipY ? -1 : 1 }] }}
      >
        <Path d="M4 4 Q4 84 84 84"
          stroke="rgba(255,255,255,0.16)" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <Path d="M5 20 L9 21.5"   stroke="rgba(255,255,255,0.24)" strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M11 39 L15 41"   stroke="rgba(255,255,255,0.20)" strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M25 60 L28 63.5" stroke="rgba(255,255,255,0.17)" strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M47 75 L49 79"   stroke="rgba(255,255,255,0.13)" strokeWidth={1.2} strokeLinecap="round" />
        {ocean ? (
          <>
            <SvgCircle cx={14} cy={14} r={6.5} fill="rgba(160,220,255,0.2)" stroke="rgba(255,255,255,0.42)" strokeWidth={1.1} />
            <SvgCircle cx={30} cy={10} r={3.2} fill="rgba(200,240,255,0.32)" stroke="rgba(255,255,255,0.28)" strokeWidth={0.9} />
            <SvgCircle cx={11} cy={34} r={2.6} fill="rgba(140,210,240,0.28)" />
            <SvgCircle cx={36} cy={28} r={2.2} fill="rgba(180,235,255,0.22)" />
          </>
        ) : (
          <>
            <Path d="M14 14 L14 7 M14 14 L21 14 M14 14 L10 10 M14 14 L18 10"
              stroke="rgba(255,255,255,0.38)" strokeWidth={1.3} strokeLinecap="round" />
            <SvgCircle cx={14} cy={14} r={3.2} fill="rgba(255,255,255,0.68)" />
            <SvgCircle cx={30} cy={9}  r={1.8} fill="rgba(255,255,255,0.30)" />
            <SvgCircle cx={40} cy={16} r={1.3} fill="rgba(255,255,255,0.22)" />
            <SvgCircle cx={9}  cy={30} r={1.8} fill="rgba(255,255,255,0.30)" />
            <SvgCircle cx={16} cy={40} r={1.3} fill="rgba(255,255,255,0.22)" />
            <SvgCircle cx={22} cy={22} r={1.1} fill="rgba(255,255,255,0.18)" />
            <Path d="M36 20 L36 17 M36 20 L39 20 M36 20 L34 18 M36 20 L38 18"
              stroke="rgba(255,255,255,0.22)" strokeWidth={1.0} strokeLinecap="round" />
            <SvgCircle cx={36} cy={20} r={1.8} fill="rgba(255,255,255,0.38)" />
            <Path d="M20 36 L20 33 M20 36 L23 36 M20 36 L18 34 M20 36 L22 34"
              stroke="rgba(255,255,255,0.20)" strokeWidth={1.0} strokeLinecap="round" />
            <SvgCircle cx={20} cy={36} r={1.8} fill="rgba(255,255,255,0.35)" />
          </>
        )}
      </Svg>
    </View>
  );
}

/* ── Celebration overlay — corners + floating motifs ─────────────── */
function CelebrationOverlay({ ocean = false }) {
  const { width: W, height: H } = useWindowDimensions();

  const particles = [
    { xf: 0.10, yf: 0.16, delay: 0,    size: 12, travelY: 52 },
    { xf: 0.84, yf: 0.12, delay: 260,  size: 9,  travelY: 44 },
    { xf: 0.48, yf: 0.07, delay: 110,  size: 14, travelY: 58 },
    { xf: 0.24, yf: 0.30, delay: 480,  size: 8,  travelY: 38 },
    { xf: 0.74, yf: 0.35, delay: 190,  size: 11, travelY: 48 },
    { xf: 0.06, yf: 0.48, delay: 650,  size: 7,  travelY: 34 },
    { xf: 0.93, yf: 0.55, delay: 360,  size: 9,  travelY: 42 },
    { xf: 0.34, yf: 0.20, delay: 430,  size: 8,  travelY: 40 },
    { xf: 0.64, yf: 0.15, delay: 240,  size: 11, travelY: 50 },
    { xf: 0.16, yf: 0.62, delay: 800,  size: 7,  travelY: 36 },
    { xf: 0.80, yf: 0.68, delay: 540,  size: 8,  travelY: 42 },
    { xf: 0.52, yf: 0.42, delay: 700,  size: 10, travelY: 46 },
    { xf: 0.42, yf: 0.55, delay: 920,  size: 7,  travelY: 38 },
    { xf: 0.70, yf: 0.50, delay: 145,  size: 9,  travelY: 44 },
  ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <CornerAccent corner="tl" ocean={ocean} />
      <CornerAccent corner="tr" ocean={ocean} />
      <CornerAccent corner="bl" ocean={ocean} />
      <CornerAccent corner="br" ocean={ocean} />
      {particles.map((p, i) => (
        <CelebrationParticle
          key={i}
          ocean={ocean}
          x={p.xf * W - (p.size / 2)}
          y={p.yf * H}
          delay={p.delay + i * 60}
          size={p.size}
          travelY={p.travelY}
        />
      ))}
    </View>
  );
}

/* ── Zone badge icons — one per pelagic zone ─────────────────────── */
function ZoneBadgeIcon({ zoneId = 'epipelagic', size = 60, color = '#9DDBF5' }) {
  const op = (v) => v; // opacity helper — kept inline for clarity

  const designs = {
    /* ── Sunlit zone: sun + water surface + light shafts ── */
    epipelagic: (
      <>
        {/* Sun */}
        <SvgCircle cx={50} cy={26} r={10} fill="none" stroke={color} strokeWidth={3} />
        {/* Sun rays */}
        <Path d="M50,10 L50,6 M64,16 L67,13 M72,28 L76,28 M64,38 L67,41 M36,38 L33,41 M28,28 L24,28 M36,16 L33,13"
          stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        {/* Water surface wavy line */}
        <Path d="M8,52 Q20,46 32,52 Q44,58 56,52 Q68,46 80,52 Q86,55 92,52"
          stroke={color} strokeWidth={2.5} fill="none" />
        {/* Light shafts below surface */}
        <Path d="M28,54 L22,82" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
        <Path d="M40,54 L36,82" stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        <Path d="M52,54 L50,82" stroke={color} strokeWidth={2.8} strokeLinecap="round" opacity={0.5} />
        <Path d="M64,54 L66,82" stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        <Path d="M76,54 L80,82" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
      </>
    ),

    /* ── Twilight zone: crescent + fading shafts + scattered glows ── */
    mesopelagic: (
      <>
        {/* Fading shafts from top */}
        <Path d="M30,10 L28,48" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.18} />
        <Path d="M42,10 L41,52" stroke={color} strokeWidth={2.2} strokeLinecap="round" opacity={0.24} />
        <Path d="M54,10 L54,52" stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.28} />
        <Path d="M66,10 L67,48" stroke={color} strokeWidth={2.2} strokeLinecap="round" opacity={0.22} />
        {/* Crescent moon */}
        <Path d="M62,34 A20,20 0 1,1 62,66 A13,13 0 1,0 62,34 Z" fill={color} opacity={0.88} />
        {/* Scattered bioluminescent dots */}
        <SvgCircle cx={24} cy={70} r={2.5} fill={color} opacity={0.42} />
        <SvgCircle cx={38} cy={80} r={2}   fill={color} opacity={0.32} />
        <SvgCircle cx={55} cy={75} r={1.8} fill={color} opacity={0.28} />
        <SvgCircle cx={72} cy={83} r={2.2} fill={color} opacity={0.36} />
        <SvgCircle cx={82} cy={70} r={1.5} fill={color} opacity={0.24} />
      </>
    ),

    /* ── Midnight zone: bioluminescent constellation in darkness ── */
    bathypelagic: (
      <>
        {/* Central glow cluster */}
        <SvgCircle cx={50} cy={50} r={16} fill={color} opacity={0.1} />
        <SvgCircle cx={50} cy={50} r={9}  fill={color} opacity={0.22} />
        <SvgCircle cx={50} cy={50} r={4}  fill={color} opacity={0.85} />
        {/* Radiating thin spines */}
        <Path d="M50,34 L50,29 M64,38 L68,34 M68,52 L73,52 M62,64 L66,68 M50,66 L50,71 M38,64 L34,68 M32,52 L27,52 M36,38 L32,34"
          stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
        {/* Satellite dots */}
        <SvgCircle cx={22} cy={32} r={3}   fill={color} opacity={0.55} />
        <SvgCircle cx={78} cy={30} r={2.5} fill={color} opacity={0.48} />
        <SvgCircle cx={18} cy={64} r={2.2} fill={color} opacity={0.4}  />
        <SvgCircle cx={82} cy={68} r={3}   fill={color} opacity={0.52} />
        <SvgCircle cx={36} cy={82} r={2}   fill={color} opacity={0.35} />
        <SvgCircle cx={68} cy={80} r={2.5} fill={color} opacity={0.42} />
      </>
    ),

    /* ── Abyssal plain: diamond crystal + flat seabed ── */
    abyssopelagic: (
      <>
        {/* Diamond outline */}
        <Path d="M50,14 L76,50 L50,80 L24,50 Z"
          fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {/* Inner diamond fill */}
        <Path d="M50,24 L68,50 L50,72 L32,50 Z" fill={color} opacity={0.18} />
        {/* Central glow */}
        <SvgCircle cx={50} cy={50} r={4.5} fill={color} opacity={0.9} />
        <SvgCircle cx={50} cy={50} r={10}  fill={color} opacity={0.12} />
        {/* Flat seabed lines */}
        <Line x1={12} y1={88} x2={88} y2={88} stroke={color} strokeWidth={2} opacity={0.35} strokeLinecap="round" />
        <Line x1={22} y1={93} x2={78} y2={93} stroke={color} strokeWidth={1.5} opacity={0.2} strokeLinecap="round" />
      </>
    ),

    /* ── Hadal trenches: nested V-chevrons pointing to trench floor ── */
    hadal: (
      <>
        {/* Outer trench walls */}
        <Path d="M12,12 L50,84 L88,12"
          stroke={color} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Middle chevron */}
        <Path d="M24,12 L50,68 L76,12"
          stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
        {/* Inner chevron */}
        <Path d="M36,12 L50,52 L64,12"
          stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.38} />
        {/* Trench floor glow */}
        <SvgCircle cx={50} cy={84} r={5}  fill={color} opacity={0.82} />
        <SvgCircle cx={50} cy={84} r={10} fill={color} opacity={0.14} />
        <SvgCircle cx={50} cy={84} r={18} fill={color} opacity={0.06} />
      </>
    ),

    /* ── Full column dive: layered zone bands on a central axis ── */
    fullColumn: (
      <>
        {/* Vertical axis */}
        <Path d="M50,8 L50,88" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.28} />
        {/* Zone dots at depth percentages */}
        {[14, 28, 44, 62, 76].map((y, i) => (
          <SvgCircle key={i} cx={50} cy={y} r={i === 2 ? 6 : 3.5}
            fill={color} opacity={i === 2 ? 0.9 : 0.5 - i * 0.05} />
        ))}
        {/* Horizontal ticks */}
        {[14, 28, 44, 62, 76].map((y, i) => (
          <Path key={i} d={`M ${44 - i * 1},${y} L ${56 + i * 1},${y}`}
            stroke={color} strokeWidth={1.5} opacity={0.35} strokeLinecap="round" />
        ))}
        {/* Down arrow at bottom */}
        <Path d="M43,80 L50,90 L57,80"
          stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {designs[zoneId] ?? designs.fullColumn}
    </Svg>
  );
}

/** Session Complete subtitle + italic line — tuned by Drift / Swim / Dive and zone */
function getOceanRewardsMessaging(level) {
  const group = getOceanLevelGroupId(level.id);
  const modeLabel = { drift: 'Drift', swim: 'Swim', dive: 'Dive' }[group];

  if (level.id === 'fullColumn') {
    return {
      completeSub: 'Dive · Full column — all pelagic zones',
      quote:
        'You crossed the whole water column in one session — from sunlit shallows to the hadal floor. Remarkable focus.',
    };
  }

  const completeSub = `${modeLabel} · ${level.zone}`;

  const quoteByGroup = {
    drift: `You finished a Drift in ${level.zone} (${level.depthRange}). Steady breath, gentle depth — exactly what this layer rewards.`,
    swim: `You finished a Swim in ${level.zone} (${level.depthRange}). Sustained coherence carried you through the midnight and abyss.`,
    dive: `You finished a Dive in ${level.zone} (${level.depthRange}). Full commitment where pressure and darkness peak.`,
  };

  return {
    completeSub,
    quote: quoteByGroup[group] ?? quoteByGroup.drift,
  };
}

/* ── Zone badge accent colours ────────────────────────────────────── */
const ZONE_BADGE_COLORS = {
  epipelagic:    '#7DD8F0',
  mesopelagic:   '#60A8D8',
  bathypelagic:  '#5888C0',
  abyssopelagic: '#7060C8',
  hadal:         '#B060D8',
  fullColumn:    '#60B8D8',
};

/* ── Session mood faces (Very sad → Very happy) — see SessionMoodFaceIcons ── */
const MOODS = [
  { label: 'Very sad', faceKey: 'verySad' },
  { label: 'Sad', faceKey: 'sad' },
  { label: 'The Same', faceKey: 'neutral' },
  { label: 'Happy', faceKey: 'happy' },
  { label: 'Very happy', faceKey: 'veryHappy' },
];

const NUMERIC_METRICS = [
  { key: 'stress', title: 'Stress', left: 'Low stress', right: 'High stress' },
  { key: 'energy', title: 'Energy', left: 'Drained', right: 'Energized' },
  { key: 'mood', title: 'Mood', left: 'Feel bad', right: 'Feel good' },
];

function averageSurveyPairs(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const avg = (key) => {
    const vals = safeRows.map((r) => r?.[key]).filter((v) => Number.isFinite(v));
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((sum, n) => sum + n, 0) / vals.length);
  };
  return {
    stressBefore: avg('stressBefore'),
    stressAfter: avg('stressAfter'),
    energyBefore: avg('energyBefore'),
    energyAfter: avg('energyAfter'),
    moodBefore: avg('moodBefore'),
    moodAfter: avg('moodAfter'),
  };
}

function MoodCircle({ mood, selected, onPress, selGrad, moodUnselBg, ringSize, innerSize }) {
  const r = ringSize / 2;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.moodWrap}>
      {selected ? (
        <LinearGradient
          colors={selGrad}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[styles.moodCircle, { width: ringSize, height: ringSize, borderRadius: r }]}
        >
          <View style={[styles.moodInner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
            <SessionMoodFaceIcon size={innerSize} faceKey={mood.faceKey} dimmed={false} />
          </View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.moodCircle,
            { width: ringSize, height: ringSize, borderRadius: r, backgroundColor: moodUnselBg },
          ]}
        >
          <View style={[styles.moodInner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
            <SessionMoodFaceIcon size={innerSize} faceKey={mood.faceKey} dimmed />
          </View>
        </View>
      )}
      <Text style={[styles.moodLabel, selected && styles.moodLabelSel]} numberOfLines={2}>
        {mood.label}
      </Text>
    </TouchableOpacity>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function SessionRewardsScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const route  = useRoute();
  const nav    = useNavigation();
  const {
    mergeShellCollection,
    mergePearlCollection,
    recordMoodEntry,
    currentSurveyBefore,
    lastSurveyResult,
    surveyResults,
    recordSessionSurveyAfter,
  } = useMysession();

  const themeId         = route.params?.themeId ?? 'universe';
  const collectionCount = Math.min(Math.max(0, route.params?.collectionCount ?? 1), SACRED_SYMBOL_COUNT);
  const highlightIndex  = Math.min(Math.max(0, route.params?.highlightIndex ?? collectionCount - 1), SACRED_SYMBOL_COUNT - 1);
  const oceanLevel      = themeId === 'ocean' ? getOceanLevelById(route.params?.oceanLevelId) : null;
  const zoneBadgeColor  = ZONE_BADGE_COLORS[oceanLevel?.id] ?? ZONE_BADGE_COLORS.fullColumn;
  const collectedShellIds = Array.isArray(route.params?.collectedShellIds)
    ? route.params.collectedShellIds
    : [];
  const collectedPearlIds = Array.isArray(route.params?.collectedPearlIds)
    ? route.params.collectedPearlIds
    : [];
  const sessionInsightsParams =
    route.params?.sessionInsights && typeof route.params.sessionInsights === 'object'
      ? route.params.sessionInsights
      : null;

  const [moodIndex,      setMoodIndex]      = useState(null);
  const [modalIndex,     setModalIndex]     = useState(null);
  const [journalText,    setJournalText]    = useState('');
  const [showEndMoodChooser, setShowEndMoodChooser] = useState(true);
  const [showEndNumericSurvey, setShowEndNumericSurvey] = useState(currentSurveyBefore != null);
  const [endSurvey, setEndSurvey] = useState({ stress: null, energy: null, mood: null });
  const [localLastSurveyResult, setLocalLastSurveyResult] = useState(null);
  const effectiveLastSurveyResult = localLastSurveyResult ?? lastSurveyResult ?? null;
  const insightsSourceParams = useMemo(() => {
    if (sessionInsightsParams) return sessionInsightsParams;
    if (!effectiveLastSurveyResult) return null;
    const sessionCount = Array.isArray(surveyResults) ? surveyResults.length : 0;
    const lastSessionFields = {
      stressBefore: effectiveLastSurveyResult.stressBefore,
      stressAfter: effectiveLastSurveyResult.stressAfter,
      energyBefore: effectiveLastSurveyResult.energyBefore,
      energyAfter: effectiveLastSurveyResult.energyAfter,
      moodBefore: effectiveLastSurveyResult.moodBefore,
      moodAfter: effectiveLastSurveyResult.moodAfter,
    };
    if (sessionCount >= 100) {
      return {
        variant: 'pro',
        sessionCount,
        averages: averageSurveyPairs(surveyResults),
        ...lastSessionFields,
      };
    }
    if (sessionCount >= 10) {
      return {
        variant: 'beginner',
        sessionCount,
        milestoneTarget: 21,
        averages: averageSurveyPairs(surveyResults),
        ...lastSessionFields,
      };
    }
    return {
      variant: 'firstTime',
      sessionCount: Math.max(1, sessionCount),
      ...lastSessionFields,
    };
  }, [sessionInsightsParams, effectiveLastSurveyResult, surveyResults]);
  useEffect(() => {
    if (themeId !== 'ocean') return;
    if (collectedShellIds.length > 0) mergeShellCollection(collectedShellIds);
    if (collectedPearlIds.length > 0) mergePearlCollection(collectedPearlIds);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — once on rewards entry

  const handleSelectEndMood = useCallback(
    (moodId) => {
      recordMoodEntry({ timing: 'end', moodId, skipped: false });
      setShowEndMoodChooser(false);
    },
    [recordMoodEntry]
  );

  const handleSkipEndMood = useCallback(() => {
    recordMoodEntry({ timing: 'end', moodId: null, skipped: true });
    setShowEndMoodChooser(false);
  }, [recordMoodEntry]);
  const canSaveEndSurvey =
    endSurvey.stress != null && endSurvey.energy != null && endSurvey.mood != null;
  const saveEndSurveyAndContinue = useCallback(() => {
    if (!canSaveEndSurvey) return;
    const created = recordSessionSurveyAfter(endSurvey);
    if (created) setLocalLastSurveyResult(created);
    setShowEndNumericSurvey(false);
  }, [canSaveEndSurvey, endSurvey, recordSessionSurveyAfter]);
  const skipEndSurvey = useCallback(() => {
    setShowEndNumericSurvey(false);
  }, []);

  // Badge entrance animation — springs in on mount
  const badgeAnim = useRef(new Animated.Value(0)).current;
  /** Continues from BreathSession white flash: fade white → Session Complete gradient */
  const introWhiteOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(badgeAnim, {
      toValue: 1, tension: 48, friction: 5, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      Animated.timing(introWhiteOpacity, {
        toValue: 0,
        duration: 440,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => cancelAnimationFrame(id);
  }, [introWhiteOpacity]);

  const { completeSub, quote } = useMemo(() => {
    if (themeId === 'ocean' && oceanLevel) {
      return getOceanRewardsMessaging(oceanLevel);
    }
    return {
      completeSub: 'Well done on completing your practice',
      quote: 'Congratulations — you did a great job.',
    };
  }, [themeId, oceanLevel]);

  const goBack = () => {
    if (themeId === 'ocean') nav.navigate('OceanTide', { themeId: 'ocean' });
    else nav.navigate('ThemeGames', { themeId });
  };
  const openSessionInsights = () => {
    if (!insightsSourceParams) return;
    nav.navigate('SessionInsights', {
      ...insightsSourceParams,
      summaryRouteName: 'SessionRewards',
      summaryRouteParams: route.params,
    });
  };

  const rwTheme = SESSION_REWARDS_THEMES[themeId === 'ocean' ? 'ocean' : 'universe'];

  /** Five mood columns — fit one row within scroll maxWidth 360 */
  const moodRowW = Math.min(winW - 48, 360);
  const moodRingSize = Math.max(44, Math.min(58, Math.floor((moodRowW - 20) / 5)));
  const moodInnerSize = moodRingSize - 6;

  return (
    <LinearGradient
      colors={rwTheme.grad}
      style={styles.root}
      start={rwTheme.gradientStart}
      end={rwTheme.gradientEnd}
    >
      <StatusBar style="light" />
      <MoodChooserModal
        visible={showEndMoodChooser}
        title="How do you feel after this session?"
        subtitle="Choose an end mood for your tracker history."
        onSelectMood={handleSelectEndMood}
        onSkip={handleSkipEndMood}
      />
      <Modal visible={showEndNumericSurvey} transparent animationType="fade" onRequestClose={skipEndSurvey}>
        <View style={styles.surveyBackdrop}>
          <View style={styles.surveyCard}>
            <Text style={styles.surveyTitle}>How do you feel now?</Text>
            <Text style={styles.surveySub}>Complete your post-session check-in.</Text>
            {NUMERIC_METRICS.map((metric) => (
              <View key={metric.key} style={styles.surveyMetric}>
                <Text style={styles.surveyMetricTitle}>{metric.title}</Text>
                <View style={styles.surveyMetricLabels}>
                  <Text style={styles.surveyMetricLabel}>{metric.left}</Text>
                  <Text style={styles.surveyMetricLabel}>{metric.right}</Text>
                </View>
                <View style={styles.surveyDotRow}>
                  {Array.from({ length: 10 }).map((_, index) => {
                    const value = index + 1;
                    const selected = endSurvey[metric.key] === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[styles.surveyDot, selected && styles.surveyDotSelected]}
                        onPress={() => setEndSurvey((prev) => ({ ...prev, [metric.key]: value }))}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityLabel={`${metric.title} ${value} out of 10`}
                      >
                        {selected ? <View style={styles.surveyDotInner} /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.surveyPrimaryBtn, !canSaveEndSurvey && styles.surveyPrimaryBtnDisabled]}
              onPress={saveEndSurveyAndContinue}
              disabled={!canSaveEndSurvey}
              activeOpacity={0.88}
            >
              <Text style={styles.surveyPrimaryTxt}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.surveySkipBtn} onPress={skipEndSurvey} activeOpacity={0.8}>
              <Text style={styles.surveySkipTxt}>Skip</Text>
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
            opacity: introWhiteOpacity,
            zIndex: 200,
          },
        ]}
      />

      {/* ── Celebration layer: corner accents + floating motifs ── */}
      <CelebrationOverlay ocean={themeId === 'ocean'} />

      {/* ── Symbol modal ── */}
      <Modal visible={modalIndex !== null} transparent animationType="fade" onRequestClose={() => setModalIndex(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalIndex(null)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            {modalIndex !== null && (
              <>
                <SacredSymbolMini index={modalIndex} size={200} />
                <Text style={styles.modalTitle}>{SACRED_GEOMETRY_SYMBOLS[modalIndex]?.title ?? '—'}</Text>
                <TouchableOpacity onPress={() => setModalIndex(null)} style={styles.modalClose}>
                  <Text style={styles.modalCloseTxt}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════════════════════════════════ */}
        {/* SESSION COMPLETE                         */}
        {/* ════════════════════════════════════════ */}

        {/* Session badge — glass bubble (ocean) or sparkle (universe) */}
        <Animated.View style={{ transform: [{ scale: badgeAnim }] }}>
          <LinearGradient colors={rwTheme.iconGrad} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {themeId === 'ocean' ? <OceanGlassBubble size={38} /> : <SparkleIcon size={32} />}
          </LinearGradient>
        </Animated.View>

        <Text style={styles.completeTitle}>Session Complete</Text>
        <Text style={styles.completeSub}>{completeSub}</Text>

        <Text style={styles.quote}>{quote}</Text>

        {/* Zone completed badge (ocean) — tap opens full zone info screen */}
        {themeId === 'ocean' && oceanLevel ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => nav.navigate('OceanZoneInfo', { levelId: oceanLevel.id })}
            style={[styles.rewardPill, { backgroundColor: rwTheme.cardBg, borderColor: rwTheme.cardBdr }]}
            accessibilityLabel={`Zone completed: ${oceanLevel.zone}. Open zone details.`}
          >
            <View style={[styles.pillBadge, { borderColor: `${zoneBadgeColor}88` }]}>
              <ZoneBadgeIcon zoneId={oceanLevel.id} size={30} color={zoneBadgeColor} />
            </View>
            <View style={styles.pillText}>
              <Text style={styles.pillTitle}>{oceanLevel.zone}</Text>
              <Text style={styles.pillSub}>Zone completed · {oceanLevel.depthRange}</Text>
            </View>
          </TouchableOpacity>
        ) : collectionCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setModalIndex(highlightIndex)}
            style={[styles.rewardPill, { backgroundColor: rwTheme.cardBg, borderColor: rwTheme.cardBdr }]}
          >
            <SacredSymbolMini index={highlightIndex} size={36} />
            <View style={styles.pillText}>
              <Text style={styles.pillTitle}>{SACRED_GEOMETRY_SYMBOLS[highlightIndex]?.title ?? '—'}</Text>
              <Text style={styles.pillSub}>Latest unlock</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Shells & pearls collected this session (ocean) */}
        {themeId === 'ocean' ? (
          <View style={styles.shellRewards}>
            <Text style={styles.shellRewardsTitle}>Sea shells collected</Text>
            {collectedShellIds.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shellRewardsRow}
              >
                {collectedShellIds.map((id) => {
                  const s = getSeaShellById(id);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.shellChip, { backgroundColor: rwTheme.cardBg, borderColor: rwTheme.cardBdr }]}
                      onPress={() => nav.navigate('SeaShellDetail', { shellId: id })}
                      activeOpacity={0.88}
                    >
                      <Text style={styles.shellChipEmoji} allowFontScaling={false}>{s.emoji}</Text>
                      <Text style={styles.shellChipName} numberOfLines={2}>{s.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.shellRewardsEmpty}>No new shells this session.</Text>
            )}
            <Text style={[styles.shellRewardsTitle, { marginTop: 14 }]}>Pearls collected</Text>
            {collectedPearlIds.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shellRewardsRow}
              >
                {collectedPearlIds.map((id) => {
                  const p = getPearlById(id);
                  if (!p) return null;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.shellChip, { backgroundColor: rwTheme.cardBg, borderColor: rwTheme.cardBdr }]}
                      onPress={() => nav.navigate('SeaShellDetail', { pearlId: id })}
                      activeOpacity={0.88}
                    >
                      <Text style={styles.shellChipEmoji} allowFontScaling={false}>{p.emoji}</Text>
                      <Text style={styles.shellChipName} numberOfLines={2}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.shellRewardsEmpty}>No new pearls this session.</Text>
            )}
          </View>
        ) : null}

        {themeId === 'ocean' ? (
          <TouchableOpacity
            style={[
              styles.shellCollectionNavBtn,
              { borderColor: rwTheme.shellNavBorder, backgroundColor: rwTheme.shellNavBg },
            ]}
            onPress={() =>
              nav.navigate('ShellCollection', {
                resumeToSessionRewards: true,
                resumeParams: route.params,
              })
            }
            activeOpacity={0.88}
          >
            <Text style={styles.shellCollectionNavTxt}>My Shell Collection</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionDivider} />
        <Text style={styles.feedbackTitle}>How do you feel now?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m, i) => (
            <MoodCircle
              key={m.faceKey}
              mood={m}
              selected={i === moodIndex}
              onPress={() => setMoodIndex(i)}
              selGrad={rwTheme.selGrad}
              moodUnselBg={rwTheme.moodUnselBg}
              ringSize={moodRingSize}
              innerSize={moodInnerSize}
            />
          ))}
        </View>
        <View style={[styles.journalCard, { backgroundColor: rwTheme.cardBg, borderColor: rwTheme.cardBdr }]}>
          <Text style={styles.journalLabel}>My Notes</Text>
          <TextInput
            style={[
              styles.journalInput,
              {
                borderColor: rwTheme.journalInputBorder,
                backgroundColor: rwTheme.journalInputBg,
              },
            ]}
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Add notes about this session…"
            placeholderTextColor="rgba(255,255,255,0.30)"
            multiline
            textAlignVertical="top"
          />
        </View>

        {insightsSourceParams ? (
          <TouchableOpacity style={styles.secondaryCtaBtn} onPress={openSessionInsights} activeOpacity={0.88}>
            <Text style={styles.secondaryCtaTxt}>View session insights</Text>
          </TouchableOpacity>
        ) : null}

        {/* ── Done button ── */}
        <TouchableOpacity style={styles.doneBtn} onPress={goBack} activeOpacity={0.88}>
          <Text style={[styles.doneTxt, { color: rwTheme.doneTxt }]}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  /* Session complete badge circle */
  iconCircle: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },

  /* Complete section */
  completeTitle: {
    fontSize: 26, fontWeight: '800',
    color: C.white, textAlign: 'center',
    letterSpacing: -0.3, marginBottom: 6,
  },
  completeSub: {
    fontSize: 14, fontWeight: '400',
    color: C.white72, textAlign: 'center',
    lineHeight: 20, marginBottom: 20,
  },

  /* Quote */
  quote: {
    fontSize: 13, fontStyle: 'italic',
    color: C.white50, textAlign: 'center',
    marginBottom: 20, paddingHorizontal: 8, lineHeight: 19,
  },

  /* Reward pill — background/border from SESSION_REWARDS_THEMES */
  rewardPill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 20,
    width: '100%', maxWidth: 360,
  },
  pillBadge: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  pillText: { flex: 1, marginLeft: 12 },
  pillTitle: { fontSize: 14, fontWeight: '700', color: C.white },
  pillSub:   { fontSize: 12, fontWeight: '400', color: C.white72, marginTop: 2 },

  shellRewards: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 20,
  },
  shellRewardsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  shellRewardsEmpty: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
  },
  shellRewardsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingRight: 8,
  },
  shellChip: {
    width: 92,
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  shellChipEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  shellChipName: {
    fontSize: 11,
    fontWeight: '600',
    color: C.white,
    textAlign: 'center',
  },
  shellCollectionNavBtn: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  shellCollectionNavTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.3,
  },

  /* Section divider */
  sectionDivider: {
    width: '100%', maxWidth: 360,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 28,
  },

  /* Feedback section */
  feedbackTitle: {
    fontSize: 22, fontWeight: '800',
    color: C.white,
    letterSpacing: -0.3, marginBottom: 24,
    alignSelf: 'flex-start',
  },

  moodRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  moodWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  moodCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  moodInner: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    paddingHorizontal: 0,
  },
  moodLabelSel: {
    color: C.white, fontWeight: '700',
  },

  /* Journal — card fill/border from SESSION_REWARDS_THEMES */
  journalCard: {
    width: '100%', maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16, paddingHorizontal: 18,
    marginBottom: 16,
  },
  journalLabel: {
    fontSize: 13, fontWeight: '700',
    color: C.white72,
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  journalInput: {
    color: C.white,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  /* Done button */
  doneBtn: {
    width: '100%', maxWidth: 360,
    backgroundColor: C.white,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
    ...shadows.card,
  },
  secondaryCtaBtn: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryCtaTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
    letterSpacing: 0.2,
  },
  doneTxt: {
    fontSize: 17, fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Celebration overlay corners */
  corner: { position: 'absolute' },
  corner_tl: { top: 0,    left: 0  },
  corner_tr: { top: 0,    right: 0 },
  corner_bl: { bottom: 0, left: 0  },
  corner_br: { bottom: 0, right: 0 },

  /* Modals */
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,8,20,0.58)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 28, alignItems: 'center',
    maxWidth: 340, width: '100%',
  },
  modalTitle: {
    marginTop: 14, fontSize: 20, fontWeight: '800',
    color: '#0F2233', textAlign: 'center',
  },
  modalClose: {
    marginTop: 18, paddingVertical: 8, paddingHorizontal: 24,
  },
  modalCloseTxt: { fontSize: 16, fontWeight: '700', color: '#0076CB' },
  surveyBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 24, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  surveyCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: '#EAD8F6',
    padding: 16,
  },
  surveyTitle: { fontSize: 24, fontWeight: '700', color: '#2D1745' },
  surveySub: { fontSize: 13, color: '#5E4C73', marginTop: 4, marginBottom: 12 },
  surveyMetric: {
    backgroundColor: '#B66BD8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  surveyMetricTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  surveyMetricLabels: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surveyMetricLabel: { fontSize: 11, color: 'rgba(255,255,255,0.92)' },
  surveyDotRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surveyDot: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surveyDotSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  surveyDotInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  surveyPrimaryBtn: {
    marginTop: 6,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EFD9',
  },
  surveyPrimaryBtnDisabled: { opacity: 0.45 },
  surveyPrimaryTxt: { fontSize: 15, fontWeight: '700', color: '#7A3F6B' },
  surveySkipBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 6 },
  surveySkipTxt: { fontSize: 13, color: '#5D3A69', textDecorationLine: 'underline' },
});

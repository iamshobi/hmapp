/**
 * Ocean game intro screen.
 * Layout: top-bar → floating ocean-orb hero → coherence instruction →
 *         vertical-timeline level list.
 * Reference: The Constellation Game intro screen.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle, Ellipse } from 'react-native-svg';
import OceanLineIcon from '../components/ocean/OceanLineIcon';
import OceanGlassBubble from '../components/ocean/OceanGlassBubble';
import MyShellCollectionIcon from '../components/ocean/MyShellCollectionIcon';
import {
  OCEAN_DEPTH_LEVELS,
  OCEAN_FULL_COLUMN_LEVEL_ID,
  getOceanLevelUnlockIndex,
} from '../constants/oceanDepthLevels';
import { useMysession } from '../context/mysessionContext';
import { spacing, borderRadius, shadows, palette, oceanDepthIconGlow } from '../theme';

/* ── Session durations ────────────────────────────────────────────── */
const DEFAULT_SESSION_SEC     = 90;
const FULL_COLUMN_SESSION_SEC = 120;

/* ── Zone gradient thumbnails ─────────────────────────────────────── */
const THUMB_GRADS = {
  fullColumn:    ['#2AA8D2', '#1D7EC1', '#145FB0'],
  epipelagic:    ['#5ABCE0', '#2D9FD2', '#1688C6'],
  mesopelagic:   ['#4F91C8', '#3F76C0', '#385FB7'],
  bathypelagic:  ['#5E58B5', '#4A3EA7', '#3A2F8E'],
  abyssopelagic: ['#503A94', '#392A77', '#2A1E5F'],
  hadal:         ['#3A2D69', '#2A2250', '#1A1A3A'],
};

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ══════════════════════════════════════════════════════════════════ */
/* SUB-COMPONENTS                                                     */
/* ══════════════════════════════════════════════════════════════════ */

/* ── Floating ocean orb ───────────────────────────────────────────── */
function OceanHeroOrb() {
  const S = 148;
  return (
    <View style={heroStyles.wrap}>
      {/* Outer atmospheric glow */}
      <View style={heroStyles.glowOuter} />
      <View style={heroStyles.glowInner} />

      {/* Globe */}
      <Svg width={S} height={S} viewBox="0 0 148 148" style={heroStyles.globe}>
        {/* Diffuse rim */}
        <SvgCircle cx={74} cy={74} r={72} fill="none"
          stroke="rgba(80,190,245,0.22)" strokeWidth={1.5} />
        {/* Ocean body */}
        <SvgCircle cx={74} cy={74} r={62}
          fill="rgba(4,30,72,0.88)"
          stroke="rgba(70,190,255,0.55)" strokeWidth={1.8} />
        {/* Horizontal pelagic-zone bands */}
        <Path d="M12,55 Q40,47 74,55 Q108,63 136,55"
          stroke="rgba(80,200,255,0.28)" strokeWidth={1.5} fill="none" />
        <Path d="M12,70 Q40,62 74,70 Q108,78 136,70"
          stroke="rgba(80,200,255,0.42)" strokeWidth={2} fill="none" />
        <Path d="M15,85 Q40,77 74,85 Q108,93 133,85"
          stroke="rgba(80,200,255,0.28)" strokeWidth={1.5} fill="none" />
        <Path d="M22,100 Q44,93 74,100 Q104,107 126,100"
          stroke="rgba(80,200,255,0.18)" strokeWidth={1.2} fill="none" />
        {/* Vertical meridian arcs */}
        <Path d="M74,12 Q108,40 108,74 Q108,108 74,136"
          stroke="rgba(80,200,255,0.16)" strokeWidth={1.2} fill="none" />
        <Path d="M74,12 Q40,40 40,74 Q40,108 74,136"
          stroke="rgba(80,200,255,0.10)" strokeWidth={1} fill="none" />
        {/* Polar shimmer */}
        <Ellipse cx={74} cy={22} rx={22} ry={7}
          fill="rgba(160,230,255,0.12)" />
        {/* Seafloor shadow */}
        <Ellipse cx={74} cy={132} rx={30} ry={6}
          fill="rgba(0,0,0,0.25)" />
      </Svg>

      {/* Reflection under globe */}
      <View style={heroStyles.reflection} />

      {/* Glassy bubbles */}
      <View style={heroStyles.sp1}><OceanGlassBubble size={22} /></View>
      <View style={heroStyles.sp2}><OceanGlassBubble size={13} opacity={0.72} /></View>
      <View style={heroStyles.sp3}><OceanGlassBubble size={16} opacity={0.85} /></View>
      <View style={heroStyles.sp4}><OceanGlassBubble size={11} opacity={0.62} /></View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  wrap: {
    width: 200,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  glowOuter: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(30,140,210,0.07)',
  },
  glowInner: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(30,140,210,0.11)',
  },
  globe: { zIndex: 1 },
  reflection: {
    position: 'absolute',
    bottom: 0,
    width: 90, height: 14,
    borderRadius: 45,
    backgroundColor: 'rgba(60,160,210,0.18)',
  },
  sp1: { position: 'absolute', top: 4,  right: 24 },
  sp2: { position: 'absolute', top: 30, left: 18 },
  sp3: { position: 'absolute', bottom: 32, right: 16 },
  sp4: { position: 'absolute', bottom: 50, left: 26 },
});

/* ── Timeline + Level row ─────────────────────────────────────────── */
const CARD_H    = 76;
const DOT_SIZE  = 10;
const LINE_W    = 1.5;

function LevelRow({ level, isFirst, isLast, locked, onPress }) {
  const grad = THUMB_GRADS[level.id] ?? THUMB_GRADS.epipelagic;
  const glow = oceanDepthIconGlow(level.accent);

  return (
    <View style={[rowStyles.outer, locked && rowStyles.outerLocked]}>
      {/* ── Left timeline column ── */}
      <View style={rowStyles.timelineCol}>
        {/* Line above dot */}
        <View style={[rowStyles.line, { opacity: isFirst ? 0 : 1 }]} />
        {/* Dot */}
        <View style={[rowStyles.dot, isFirst && rowStyles.dotFilled]} />
        {/* Line below dot */}
        <View style={[rowStyles.line, { opacity: isLast ? 0 : 1 }]} />
      </View>

      {/* ── Card ── */}
      <TouchableOpacity
        style={[rowStyles.card, shadows.card, locked && rowStyles.cardLocked]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        {/* Thumbnail */}
        <LinearGradient
          colors={grad}
          style={rowStyles.thumb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <OceanLineIcon
            iconKey={level.iconKey}
            size={30}
            color={level.accent}
            strokeWidth={1.6}
            glow
            glowColor={glow}
          />
        </LinearGradient>

        {/* Text */}
        <View style={rowStyles.textCol}>
          <Text style={rowStyles.title} numberOfLines={1}>{level.title}</Text>
          <Text style={rowStyles.sub}>
            {locked ? 'Complete the previous dive to unlock' : `Dive in ${fmtTime(level.durationSec)}`}
          </Text>
        </View>

        {locked ? (
          <Lock size={18} color="rgba(255,255,255,0.45)" />
        ) : (
          <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: CARD_H,
    marginBottom: 10,
  },
  timelineCol: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  line: {
    flex: 1,
    width: LINE_W,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderStyle: 'dashed',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.8,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'transparent',
    marginVertical: 2,
  },
  dotFilled: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'white',
  },
  outerLocked: {
    opacity: 0.72,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  cardLocked: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  sub: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.60)',
  },
});

/* ══════════════════════════════════════════════════════════════════ */
/* MAIN SCREEN                                                        */
/* ══════════════════════════════════════════════════════════════════ */
export default function OceanTideScreen() {
  const insets = useSafeAreaInsets();
  const nav    = useNavigation();
  const route  = useRoute();
  const themeId = route.params?.themeId ?? 'ocean';
  const { oceanMaxUnlockedLevelIndex } = useMysession();

  /** Go straight to zone detail; Dive In opens the analyzing interstitial then session (OceanLevelDetail). */
  const openSession = (level, durationSec = DEFAULT_SESSION_SEC) => {
    nav.navigate('OceanLevelDetail', {
      levelId: level.id,
      themeId,
      durationSec,
    });
  };

  /* ── Build ordered level list: zones first, Full Column last (same order as OCEAN_LEVEL_UNLOCK_ORDER) ── */
  const levels = [
    ...OCEAN_DEPTH_LEVELS.map((lvl) => ({
      id:          lvl.id,
      title:       lvl.zone,
      blurb:       lvl.depthRange,
      durationSec: DEFAULT_SESSION_SEC,
      iconKey:     lvl.iconKey,
      accent:      palette[lvl.accentToken] ?? palette.hmAppBlue,
      levelRef:    lvl,
    })),
    {
      id:          OCEAN_FULL_COLUMN_LEVEL_ID,
      title:       'Full Column Dive',
      blurb:       'Surface to 10,994 m',
      durationSec: FULL_COLUMN_SESSION_SEC,
      iconKey:     'oceanTrench',
      accent:      palette.hmAppBlue,
      levelRef: {
        id:            OCEAN_FULL_COLUMN_LEVEL_ID,
        zone:          'Full column dive',
        creature:      'Surface → trench',
        sessionTitle:  'Ocean • Full column dive',
        iconKey:       'oceanTrench',
        accentToken:   'hmAppBlue',
      },
    },
  ];

  return (
    <View style={styles.root}>
      {/* Deep ocean gradient background */}
      <LinearGradient
        colors={['#0A2A48', '#0D3B60', '#112A52', '#0C1A3A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <StatusBar style="light" />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => nav.goBack()}
          activeOpacity={0.75}
        >
          <ChevronLeft size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>The Ocean Dive</Text>

        {/* My Shell Collection — opens gallery (replaces sparkle badge) */}
        <TouchableOpacity
          style={styles.badgeOrbTouch}
          onPress={() => nav.navigate('ShellCollection')}
          activeOpacity={0.82}
          accessibilityLabel="My Shell Collection"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#2AB8E0', '#1070CB']}
            style={styles.badgeOrb}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MyShellCollectionIcon size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.introLine}>
          Each zone is another layer of the ocean—dive deeper and collect shells along the way.
        </Text>

        {/* ── Coherence instruction ── */}
        <Text style={styles.instruction}>
          Sustain{' '}
          <Text style={styles.instructionBold}>high coherence</Text>
          {' '}for longer to complete the dive on time.
        </Text>

        {/* ── Hero orb ── */}
        <OceanHeroOrb />

        {/* ── Level list ── */}
        <View style={styles.listWrap}>
          {levels.map((level, idx) => {
            const unlockIdx = getOceanLevelUnlockIndex(level.id);
            const locked = unlockIdx > oceanMaxUnlockedLevelIndex;
            return (
              <LevelRow
                key={level.id}
                level={level}
                isFirst={idx === 0}
                isLast={idx === levels.length - 1}
                locked={locked}
                onPress={() => {
                  if (locked) {
                    Alert.alert(
                      'Zone locked',
                      'Complete the previous ocean dive in order to unlock this zone.',
                    );
                    return;
                  }
                  openSession(level.levelRef, level.durationSec);
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    letterSpacing: 0.2,
  },
  badgeOrbTouch: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  badgeOrb: {
    width: 40, height: 40,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Scroll content */
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  introLine: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 14,
  },

  /* Instruction */
  instruction: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  instructionBold: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
  },

  /* Level list container */
  listWrap: {
    marginTop: 8,
  },

});

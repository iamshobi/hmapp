/**
 * My Shell Collection — acrylic display-case: 3×5 glass grid (15 shells or 15 pearls per tab).
 */
import React, { useId, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  Platform,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  G,
  Ellipse,
  Circle,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useBreathGarden } from '../../context/BreathGardenContext';
import {
  OCEAN_COLLECTIBLE_ZONE_ORDER,
  OCEAN_ZONE_SHELL_IDS,
  ALL_OCEAN_COLLECTIBLE_SHELL_IDS,
  ALL_OCEAN_COLLECTIBLE_PEARL_IDS,
  getPearlsForZone,
} from '../../constants/oceanZoneCollectibles';
import { getShellById } from '../../constants/seaShells';
import { shadows } from '../../theme';

const BEACH_COLLECTION_BG = require('../../../assets/shell-collection-beach-bg.png');

/** Three shells per row × five rows (pelagic order) */
const GRID_COLS = 3;
const GRID_ROWS = 5;
const TOTAL_SLOTS = GRID_COLS * GRID_ROWS;

/** Heart path — viewBox 0 0 24 24 (classic “rounded” heart silhouette) */
const HEART_PATH_24 =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/** Heart glyph is smaller than the grid slot so three columns fit cleanly; shell sits dead-centre. */
const HEART_IN_SLOT_SCALE = 0.68;

/** Eight-point sparkle (unit scale); drawn at each glitter site via transform */
const SPARKLE_STAR_D =
  'M0 -1.05 L0.24 -0.24 L1.08 0 L0.24 0.24 L0 1.05 L-0.24 0.24 L-1.08 0 L-0.24 -0.24 Z';

const GLITTER_ENTER_DURATION_MS = 720;
const GLITTER_STAGGER_MS = 34;

const AnimatedG = Animated.createAnimatedComponent(G);

function hashUidGlitter(uid) {
  let h = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildHeartGlitter(uid, filled) {
  let h = hashUidGlitter(uid);
  const next = () => {
    h = Math.imul(h, 1103515245) + 12345;
    return h >>> 0;
  };
  const sparkles = [];
  for (let i = 0; i < 5; i++) {
    const n1 = next();
    const n2 = next();
    const n3 = next();
    const n4 = next();
    sparkles.push({
      x: 3.2 + (n1 % 1000) / 1000 * 17.6,
      y: 3 + (n2 % 1000) / 1000 * 15.5,
      s: 0.26 + (n3 % 1000) / 1000 * 0.42,
      rot: (n4 % 360) + i * 17,
      op: filled ? 0.42 + (n3 % 280) / 1000 : 0.22 + (n3 % 200) / 1000,
    });
  }
  const dots = [];
  for (let i = 0; i < 12; i++) {
    const n1 = next();
    const n2 = next();
    const n3 = next();
    dots.push({
      x: 2.8 + (n1 % 1000) / 1000 * 18.4,
      y: 2.5 + (n2 % 1000) / 1000 * 17,
      r: 0.12 + (n3 % 1000) / 1000 * 0.22,
      op: filled ? 0.2 + (n3 % 350) / 1000 : 0.1 + (n3 % 200) / 1000,
    });
  }
  return { sparkles, dots };
}

/**
 * Glossy glass heart — unique SVG ids per instance; shell/pearl centred in the glyph.
 * @param {{ entranceDelayMs?: number; entranceCycleKey?: string }} props
 */
function HeartShellHolder({
  slotSize,
  heartSize,
  filled,
  children,
  entranceDelayMs = 0,
  entranceCycleKey = '0',
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gidGlass = `hg${uid}`;
  const gidShine = `hs${uid}`;
  const gidWarm = `hw${uid}`;
  const gidClip = `hc${uid}`;

  const glitter = useMemo(() => buildHeartGlitter(uid, filled), [uid, filled]);

  const glitterEnter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    glitterEnter.setValue(0);
    const anim = Animated.timing(glitterEnter, {
      toValue: 1,
      duration: GLITTER_ENTER_DURATION_MS,
      delay: entranceDelayMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [entranceCycleKey, entranceDelayMs, glitterEnter]);

  const glitterOpacity = glitterEnter.interpolate({
    inputRange: [0, 0.18, 1],
    outputRange: [0, 0.75, 1],
  });
  const glitterTranslateY = glitterEnter.interpolate({
    inputRange: [0, 1],
    outputRange: [2.4, 0],
  });
  const glitterScale = glitterEnter.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });
  const shineLayerOpacity = glitterEnter.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.92, 1],
  });

  return (
    <View style={[styles.heartSlot, { width: slotSize, height: slotSize }]}>
      <View style={[styles.heartGlyphWrap, { width: heartSize, height: heartSize }]}>
        <Svg width={heartSize} height={heartSize} viewBox="0 0 24 24" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <ClipPath id={gidClip}>
              <Path d={HEART_PATH_24} />
            </ClipPath>
            <SvgLinearGradient id={gidGlass} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={filled ? 'rgba(255,255,255,0.52)' : 'rgba(200,230,255,0.22)'} />
              <Stop offset="42%" stopColor={filled ? 'rgba(210,235,255,0.28)' : 'rgba(120,185,215,0.18)'} />
              <Stop offset="100%" stopColor={filled ? 'rgba(60,120,155,0.38)' : 'rgba(15,55,75,0.45)'} />
            </SvgLinearGradient>
            <RadialGradient
              id={gidShine}
              cx="32%"
              cy="28%"
              rx="55%"
              ry="42%"
              fx="28%"
              fy="22%"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
              <Stop offset="45%" stopColor="rgba(255,255,255,0.18)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </RadialGradient>
            <RadialGradient
              id={gidWarm}
              cx="50%"
              cy="42%"
              rx="65%"
              ry="58%"
              fx="45%"
              fy="38%"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="rgba(255, 248, 210, 0.55)" />
              <Stop offset="42%" stopColor="rgba(255, 230, 160, 0.12)" />
              <Stop offset="100%" stopColor="rgba(255, 220, 140, 0)" />
            </RadialGradient>
          </Defs>
          <G clipPath={`url(#${gidClip})`}>
            <Path d={HEART_PATH_24} fill={`url(#${gidGlass})`} />
            <AnimatedG opacity={shineLayerOpacity}>
              <Ellipse cx={12} cy={8.2} rx={7.2} ry={5.8} fill={`url(#${gidShine})`} opacity={0.85} />
              <Ellipse cx={12} cy={9.5} rx={6.2} ry={6} fill={`url(#${gidWarm})`} opacity={filled ? 0.38 : 0.18} />
            </AnimatedG>
          </G>
          <Path
            d={HEART_PATH_24}
            fill="none"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth={0.55}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.95}
          />
          <Path
            d={HEART_PATH_24}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={0.35}
            strokeLinejoin="round"
            opacity={0.9}
            transform="translate(0.15, 0.2)"
          />
          <AnimatedG
            pointerEvents="none"
            opacity={glitterOpacity}
            transform={[
              { translateX: 12 },
              { translateY: 12 },
              { scale: glitterScale },
              { translateX: -12 },
              { translateY: -12 },
              { translateY: glitterTranslateY },
            ]}
          >
            {glitter.dots.map((d, i) => (
              <Circle
                key={`gd-${i}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="rgba(255, 252, 235, 0.95)"
                opacity={d.op}
              />
            ))}
            {glitter.sparkles.map((sp, i) => (
              <G key={`gs-${i}`} transform={`translate(${sp.x}, ${sp.y}) rotate(${sp.rot}) scale(${sp.s})`}>
                <Path d={SPARKLE_STAR_D} fill="rgba(255, 253, 248, 0.92)" opacity={sp.op} />
              </G>
            ))}
          </AnimatedG>
        </Svg>
        <View style={[styles.heartHolderInner, { width: heartSize, height: heartSize }]}>{children}</View>
      </View>
    </View>
  );
}

function CornerRivet({ style }) {
  return (
    <View style={[rivetStyles.holder, style]} pointerEvents="none">
      <LinearGradient
        colors={['#f0f6fa', '#a8b8c4', '#d8e4ec', '#6a7a86']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={rivetStyles.disc}
      />
      <View style={rivetStyles.glint} />
    </View>
  );
}

const rivetStyles = StyleSheet.create({
  holder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  disc: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  glint: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});

/**
 * @param {{ onClose: () => void; resumeToSessionRewards?: boolean; resumeParams?: object }} props
 */
export default function ShellCollectionPanel({ onClose, resumeToSessionRewards, resumeParams }) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const nav = useNavigation();
  const { shellCollectionIds, pearlCollectionIds } = useBreathGarden();
  const [tab, setTab] = useState('shells');
  /** Bumps when the screen is focused again (e.g. back from detail) so glitter replay runs */
  const [entranceEpoch, setEntranceEpoch] = useState(0);
  const focusPassRef = useRef(0);
  useFocusEffect(
    useCallback(() => {
      focusPassRef.current += 1;
      if (focusPassRef.current === 1) return;
      setEntranceEpoch((e) => e + 1);
    }, [])
  );
  const entranceCycleKey = `${tab}-${entranceEpoch}`;

  const shellSet = useMemo(() => new Set(shellCollectionIds), [shellCollectionIds]);
  const pearlSet = useMemo(() => new Set(pearlCollectionIds), [pearlCollectionIds]);

  const shellsOrdered = useMemo(
    () =>
      OCEAN_COLLECTIBLE_ZONE_ORDER.flatMap((z) =>
        (OCEAN_ZONE_SHELL_IDS[z] ?? []).map((id) => getShellById(id)).filter(Boolean)
      ),
    []
  );
  const pearlsOrdered = useMemo(
    () => OCEAN_COLLECTIBLE_ZONE_ORDER.flatMap((z) => getPearlsForZone(z)),
    []
  );

  const shellFound = useMemo(
    () => ALL_OCEAN_COLLECTIBLE_SHELL_IDS.filter((id) => shellSet.has(id)).length,
    [shellSet]
  );
  const pearlFound = useMemo(
    () => ALL_OCEAN_COLLECTIBLE_PEARL_IDS.filter((id) => pearlSet.has(id)).length,
    [pearlSet]
  );

  const totalFound = tab === 'shells' ? shellFound : pearlFound;
  const totalMax = 15;
  const isEmptyCollection = shellFound === 0 && pearlFound === 0;

  const pad = 14;
  const casePad = 8;
  const gutter = 2;
  const caseFullW = Math.min(winW - pad * 2, 400);
  const innerW = caseFullW - casePad * 2;
  /** Reserve vertical space so the 3×5 grid fits without scrolling (higher = shorter glass panel) */
  const TOP_UI_RESERVE = 182;
  const emptyFooterReserve =
    shellCollectionIds.length === 0 && pearlCollectionIds.length === 0 ? 108 : 0;
  const availForGrid =
    winH - insets.top - insets.bottom - TOP_UI_RESERVE - 6 - emptyFooterReserve;
  const cellFromW = (innerW - gutter * (GRID_COLS - 1)) / GRID_COLS;
  const cellFromH = (availForGrid - gutter * (GRID_ROWS - 1)) / GRID_ROWS;
  const cellSize = Math.max(38, Math.floor(Math.min(cellFromW, cellFromH) * 0.99));

  const handleClose = () => {
    if (resumeToSessionRewards && resumeParams) {
      nav.replace('SessionRewards', resumeParams);
      return;
    }
    onClose();
  };

  /** Push detail on top of this screen so Got it / back returns here (do not call onClose). */
  const onPressShell = (shell) => {
    nav.navigate('SeaShellDetail', { shellId: shell.id });
  };

  const onPressPearl = (pearl) => {
    nav.navigate('SeaShellDetail', { pearlId: pearl.id });
  };

  const goToOceanDiveLevels = () => {
    onClose();
    requestAnimationFrame(() => {
      nav.navigate('OceanLevelDetail', {
        themeId: 'ocean',
        levelId: 'epipelagic',
        durationSec: 90,
      });
    });
  };

  const renderGridCell = (slotIndex) => {
    const heartSize = Math.round(cellSize * HEART_IN_SLOT_SCALE);
    const emojiSize = Math.max(18, Math.round(heartSize * 0.36));
    const emojiLine = Math.round(emojiSize + 4);

    if (tab === 'shells') {
      const shell = shellsOrdered[slotIndex];
      if (!shell) {
        return null;
      }
      const collected = shellSet.has(shell.id);
      const content = (
        <View style={[styles.heartCell, { width: cellSize }, collected ? styles.heartSlotGlow : null]}>
          <HeartShellHolder
            slotSize={cellSize}
            heartSize={heartSize}
            filled={collected}
            entranceDelayMs={slotIndex * GLITTER_STAGGER_MS}
            entranceCycleKey={entranceCycleKey}
          >
            {collected ? (
              <Text
                style={[styles.pocketEmoji, { fontSize: emojiSize, lineHeight: emojiLine }]}
                allowFontScaling={false}
              >
                {shell.emoji}
              </Text>
            ) : (
              <View
                style={[
                  styles.pocketShallowHeart,
                  { width: heartSize * 0.32, height: heartSize * 0.28 },
                ]}
              />
            )}
          </HeartShellHolder>
        </View>
      );
      if (collected) {
        return (
          <TouchableOpacity
            key={shell.id}
            activeOpacity={0.85}
            onPress={() => onPressShell(shell)}
            accessibilityRole="button"
            accessibilityLabel={`${shell.name}, collected. Open details.`}
          >
            {content}
          </TouchableOpacity>
        );
      }
      return (
        <View key={shell.id} accessibilityRole="text" accessibilityLabel={`Empty slot, ${shell.name} not yet found`}>
          {content}
        </View>
      );
    }

    const pearl = pearlsOrdered[slotIndex];
    if (!pearl) {
      return null;
    }
    const collected = pearlSet.has(pearl.id);
    const pearlContent = (
      <View style={[styles.heartCell, { width: cellSize }, collected ? styles.heartSlotGlow : null]}>
        <HeartShellHolder
          slotSize={cellSize}
          heartSize={heartSize}
          filled={collected}
          entranceDelayMs={slotIndex * GLITTER_STAGGER_MS}
          entranceCycleKey={entranceCycleKey}
        >
          {collected ? (
            <Text
              style={[styles.pocketEmoji, { fontSize: emojiSize, lineHeight: emojiLine }]}
              allowFontScaling={false}
            >
              {pearl.emoji}
            </Text>
          ) : (
            <View
              style={[
                styles.pocketShallowHeart,
                { width: heartSize * 0.32, height: heartSize * 0.28 },
              ]}
            />
          )}
        </HeartShellHolder>
      </View>
    );
    if (collected) {
      return (
        <TouchableOpacity
          key={pearl.id}
          activeOpacity={0.85}
          onPress={() => onPressPearl(pearl)}
          accessibilityRole="button"
          accessibilityLabel={`${pearl.name}, collected. Open details.`}
        >
          {pearlContent}
        </TouchableOpacity>
      );
    }
    return (
      <View key={pearl.id} accessibilityRole="text" accessibilityLabel={`Empty slot, ${pearl.name} not yet found`}>
        {pearlContent}
      </View>
    );
  };

  const blurIntensity = Platform.OS === 'ios' ? 55 : 28;

  return (
    <ImageBackground source={BEACH_COLLECTION_BG} style={styles.root} resizeMode="cover">
      <LinearGradient
        colors={['rgba(8,52,72,0.52)', 'rgba(6,42,58,0.38)', 'rgba(4,32,48,0.48)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: pad }]}>
        <View style={styles.headerSide} />
        <Text style={styles.title}>My Shell Collection</Text>
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={handleClose} hitSlop={14} style={styles.closeBtn} accessibilityLabel="Close">
            <X size={26} color="rgba(255,255,255,0.95)" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'shells' && styles.tabBtnActive]}
          onPress={() => setTab('shells')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'shells' }}
        >
          <Text style={[styles.tabLabel, tab === 'shells' && styles.tabLabelActive]}>Shells</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'pearls' && styles.tabBtnActive]}
          onPress={() => setTab('pearls')}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === 'pearls' }}
        >
          <Text style={[styles.tabLabel, tab === 'pearls' && styles.tabLabelActive]}>Pearls</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.collectionBody}>
        <Text style={[styles.subtitle, { paddingHorizontal: pad }]}>
          {isEmptyCollection ? (
            'Treasure each find — your display case fills as you dive.'
          ) : (
            <>
              Collector&apos;s case ·{' '}
              <Text style={styles.subtitleBold}>
                {totalFound}/{totalMax} {tab === 'shells' ? 'shells' : 'pearls'}
              </Text>
            </>
          )}
        </Text>

        <View style={[styles.collectionMain, { paddingBottom: insets.bottom + 12 }]}>
          <View style={[styles.caseOuter, { width: caseFullW }]}>
            <BlurView intensity={blurIntensity} tint="light" style={styles.caseBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.42)', 'rgba(180,220,240,0.18)', 'rgba(255,255,255,0.12)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.caseBorderHighlight} pointerEvents="none" />
              <CornerRivet style={styles.rivetTL} />
              <CornerRivet style={styles.rivetTR} />
              <CornerRivet style={styles.rivetBL} />
              <CornerRivet style={styles.rivetBR} />

              <View style={[styles.caseInner, { padding: casePad }]}>
                <View style={[styles.grid, { width: innerW }]}>
                  {Array.from({ length: GRID_ROWS }, (_, row) => (
                    <View
                      key={`row-${row}`}
                      style={[
                        styles.gridRow,
                        {
                          width: innerW,
                          marginBottom: row < GRID_ROWS - 1 ? gutter : 0,
                        },
                      ]}
                    >
                      {[0, 1, 2].map((col) => {
                        const slotIndex = row * GRID_COLS + col;
                        return (
                          <View
                            key={`slot-${slotIndex}`}
                            style={{
                              width: cellSize,
                              marginRight: col < GRID_COLS - 1 ? gutter : 0,
                            }}
                          >
                            {renderGridCell(slotIndex)}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </BlurView>
          </View>

          {isEmptyCollection ? (
            <View style={styles.emptyFooter}>
              <Text style={styles.emptyStateText}>
                Your case is ready. Dive the ocean zones to fill each compartment with shells and pearls.
              </Text>
              <Pressable onPress={goToOceanDiveLevels} style={({ pressed }) => [styles.diveInTouchable, pressed && { opacity: 0.9 }]}>
                <LinearGradient
                  colors={['#3ac4e8', '#1070cb']}
                  style={styles.diveInGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.diveInLabel}>Dive in</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeBtn: { padding: 2 },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,40,60,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
    textShadowColor: 'rgba(0,30,45,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  collectionBody: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  collectionMain: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  caseOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  caseBlur: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.15)' : undefined,
  },
  caseBorderHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  rivetTL: { position: 'absolute', top: 8, left: 8, zIndex: 10 },
  rivetTR: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
  rivetBL: { position: 'absolute', bottom: 8, left: 8, zIndex: 10 },
  rivetBR: { position: 'absolute', bottom: 8, right: 8, zIndex: 10 },
  caseInner: {
    zIndex: 2,
  },
  grid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartCell: {
    alignItems: 'center',
  },
  heartSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartGlyphWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartHolderInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartSlotGlow: {
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255,255,255,0.35)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  pocketShallowHeart: {
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  pocket: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
  },
  pocketFilled: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  pocketEmpty: {
    backgroundColor: 'rgba(0, 35, 55, 0.28)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  pocketShallow: {
    width: '46%',
    height: '46%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pocketEmoji: {
    textAlign: 'center',
  },
  emptyFooter: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 20,
    maxWidth: 320,
  },
  diveInTouchable: {
    borderRadius: 22,
    overflow: 'hidden',
    minWidth: 220,
    ...shadows.card,
  },
  diveInGrad: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  diveInLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});

/**
 * Sea shell detail — rarity tag, depth line, where-to-find tag (ocean modes / zones), quote.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { getShellById, RARITY_CONFIG, getShellCollectionGroupMeta } from '../constants/seaShells';
import { getPearlById } from '../constants/oceanZoneCollectibles';
import { getOceanLevelById } from '../constants/oceanDepthLevels';
import { borderRadius, spacing, shadows, gradients } from '../theme';

/** Primary dismiss action — matches Session Complete (ocean) CTA */
const DONE_LABEL = '#01579B';

/** Same gradient as Session Complete for ocean (`SESSION_REWARDS_THEMES.ocean` + `gradients.gameSessionOcean`) */
const SESSION_COMPLETE_BG = [...gradients.gameSessionOcean];
const SESSION_COMPLETE_GRADIENT_START = { x: 0.35, y: 0 };
const SESSION_COMPLETE_GRADIENT_END = { x: 0.65, y: 1 };

/** Single line like “Found at 8 m depth” when narrow band; otherwise range. */
function depthLine(shell) {
  const [a, b] = shell.depthRange;
  const span = b - a;
  if (span <= 30) {
    const mid = Math.round((a + b) / 2);
    return `Found at ${mid} m depth`;
  }
  return `Found at ${a.toLocaleString()}–${b.toLocaleString()} m depth`;
}

export default function SeaShellDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const nav = useNavigation();
  const pearlId = route.params?.pearlId;
  const shellId = route.params?.shellId ?? 'moon-snail';

  const shell = getShellById(shellId);
  const pearl = pearlId ? getPearlById(pearlId) : null;
  if (pearlId && !pearl) {
    return (
      <LinearGradient
        colors={SESSION_COMPLETE_BG}
        style={styles.root}
        start={SESSION_COMPLETE_GRADIENT_START}
        end={SESSION_COMPLETE_GRADIENT_END}
      >
        <StatusBar style="light" />
        <View style={[styles.column, { paddingTop: insets.top + 40, paddingHorizontal: spacing.lg }]}>
          <Text style={styles.title}>Collectible not found</Text>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.doneBtn}>
            <Text style={styles.doneTxt}>Go back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }
  const rarityStyle = pearl
    ? { label: 'Pearl', pillBg: 'rgba(200, 220, 255, 0.22)', pillBorder: 'rgba(220, 235, 255, 0.55)' }
    : RARITY_CONFIG[shell.rarity] ?? RARITY_CONFIG.common;
  const whereMeta = useMemo(() => (pearl ? null : getShellCollectionGroupMeta(shell.id)), [pearl, shell.id]);
  const pearlZone = pearl ? getOceanLevelById(pearl.zoneId) : null;

  const displayName = pearl ? pearl.name : shell.name;
  const displayEmoji = pearl ? pearl.emoji : shell.emoji;
  const displaySub = pearl
    ? pearlZone
      ? `${pearlZone.zone} · ${pearlZone.depthRange}`
      : 'Ocean zone pearl'
    : depthLine(shell);
  const displayFact = pearl ? pearl.funFact : shell.funFact;

  return (
    <LinearGradient
      colors={SESSION_COMPLETE_BG}
      style={styles.root}
      start={SESSION_COMPLETE_GRADIENT_START}
      end={SESSION_COMPLETE_GRADIENT_END}
    >
      <StatusBar style="light" />

      <View style={[styles.topBar, { paddingTop: insets.top + 6, paddingHorizontal: spacing.lg }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => nav.goBack()}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} color="rgba(30, 40, 60, 0.82)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={[
          styles.scrollCenter,
          {
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.lg,
            paddingHorizontal: spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <View style={styles.heroGlow}>
            <Text style={styles.heroEmoji} allowFontScaling={false}>
              {displayEmoji}
            </Text>
          </View>

          <View
            style={[
              styles.categoryTag,
              {
                backgroundColor: rarityStyle.pillBg,
                borderColor: rarityStyle.pillBorder,
              },
            ]}
          >
            <Text style={[styles.categoryTagText, { color: rarityStyle.pillBorder }]}>
              {rarityStyle.label}
            </Text>
          </View>

          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.subtitle}>{displaySub}</Text>

          {whereMeta ? (
            <View
              style={styles.whereTag}
              accessibilityRole="text"
              accessibilityLabel={`Where to find: ${whereMeta.zoneSubtitle}`}
            >
              <Text style={styles.whereTagHint}>Where to find</Text>
              <Text style={styles.whereTagLine} numberOfLines={2}>
                {whereMeta.zoneSubtitle}
              </Text>
            </View>
          ) : pearl && pearlZone ? (
            <View style={styles.whereTag} accessibilityRole="text">
              <Text style={styles.whereTagHint}>Where to find</Text>
              <Text style={styles.whereTagLine} numberOfLines={2}>
                {pearlZone.zone}
              </Text>
            </View>
          ) : null}

          <View style={styles.quoteBox}>
            <Text style={styles.quote}>&ldquo;{displayFact}&rdquo;</Text>
          </View>

          <TouchableOpacity
            onPress={() => nav.goBack()}
            style={styles.doneBtn}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Got it!"
          >
            <Text style={styles.doneTxt}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollFill: { flex: 1 },
  scrollCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  heroGlow: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(100, 190, 240, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(180, 230, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: {
    fontSize: 52,
    lineHeight: 58,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: spacing.md,
    borderWidth: 1,
    alignSelf: 'center',
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(200, 220, 235, 0.75)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  whereTag: {
    alignSelf: 'stretch',
    maxWidth: 360,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 36, 64, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(100, 190, 240, 0.28)',
    marginBottom: spacing.lg,
  },
  whereTagHint: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(140, 200, 235, 0.55)',
    textAlign: 'center',
    marginBottom: 4,
  },
  whereTagLine: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(170, 220, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 17,
  },
  quoteBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 24, 48, 0.55)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  quote: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '400',
    color: 'rgba(230, 238, 245, 0.88)',
    textAlign: 'center',
    lineHeight: 22,
  },
  doneBtn: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  doneTxt: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: DONE_LABEL,
  },
});

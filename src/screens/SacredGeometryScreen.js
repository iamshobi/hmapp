/**
 * The Sacred Geometry — Play hub: difficulty, steps, coherence hints.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMysession } from '../context/mysessionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, borderRadius, gradients, shadows, typography } from '../theme';
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  LEVELS_BY_DIFFICULTY,
  getGlobalLevelIndex,
  isLevelUnlockedForProgress,
} from '../constants/mySessionLevels';
import { RECOVERY_BREATH_DURATION_SEC } from '../constants/criticalShift';

const { width: SCREEN_W } = Dimensions.get('window');
const COHERENCE_HINT = { low: 22, medium: 48, high: 30 };

export default function SacredGeometryScreen() {
  const insets = useSafeAreaInsets();
  const { maxUnlockedGlobalIndex, gentleMode } = useMysession();
  const nav = useNavigation();
  const route = useRoute();
  const themeId = route.params?.themeId ?? 'universe';
  const [difficulty, setDifficulty] = useState('basic');

  const levels = useMemo(() => LEVELS_BY_DIFFICULTY[difficulty] ?? [], [difficulty]);

  const openLevel = (level, index) => {
    if (!isLevelUnlockedForProgress(difficulty, index, maxUnlockedGlobalIndex)) return;
    const globalLevelIndex = getGlobalLevelIndex(difficulty, index);
    const durationSec = gentleMode
      ? Math.min(level.durationSec, RECOVERY_BREATH_DURATION_SEC)
      : level.durationSec;
    nav.navigate('BreathSession', {
      levelId: level.id,
      levelName: level.name,
      symbolName: level.name,
      durationSec,
      difficulty,
      globalLevelIndex,
      themeId,
      gentleMode,
    });
  };

  return (
    <LinearGradient colors={gradients.learn} style={styles.gradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.heroTitle, styles.heroTitle]}>The Sacred Geometry</Text>
        <Text style={styles.heroSubtitle}>Breath, coherence, calm</Text>
        <Text style={styles.heroBody}>
          Practice in order: each completed session unlocks the next step and adds a sacred geometry symbol to your collection.
        </Text>

        {gentleMode ? (
          <View style={styles.gentleBanner}>
            <Text style={styles.gentleBannerTitle}>Gentle mode</Text>
            <Text style={styles.gentleBannerBody}>
              Recovery Breath ({Math.round(RECOVERY_BREATH_DURATION_SEC / 60)} min). No goals—just presence.
            </Text>
          </View>
        ) : null}

        <View style={[styles.coherenceCard, shadows.card, styles.zenAccentBorder]}>
          <Text style={styles.coherenceCardTitle}>Coherence</Text>
          <View style={styles.coherenceRow}>
            <View style={[styles.pill, { backgroundColor: 'rgba(255, 193, 7, 0.35)' }]}>
              <Text style={styles.pillLabel}>Low</Text>
              <Text style={styles.pillPct}>{COHERENCE_HINT.low}%</Text>
            </View>
            <View style={[styles.pill, styles.pillMed]}>
              <Text style={styles.pillLabel}>Medium</Text>
              <Text style={styles.pillPct}>{COHERENCE_HINT.medium}%</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: 'rgba(102, 187, 106, 0.35)' }]}>
              <Text style={styles.pillLabel}>High</Text>
              <Text style={styles.pillPct}>{COHERENCE_HINT.high}%</Text>
            </View>
          </View>
          <Text style={styles.coherenceHint}>
            Sustain <Text style={styles.bold}>Medium</Text> or <Text style={styles.bold}>High</Text> to deepen your practice.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Difficulty</Text>
        <View style={styles.segment}>
          {DIFFICULTY_KEYS.map((key) => {
            const active = difficulty === key;
            return (
              <Pressable
                key={key}
                onPress={() => setDifficulty(key)}
                style={({ pressed }) => [styles.segmentItem, pressed && { opacity: 0.9 }]}
              >
                {active ? (
                  <LinearGradient
                    colors={[colors.teal, colors.purple]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.segmentGradient}
                  >
                    <Text style={styles.segmentTextActive}>{DIFFICULTY_LABELS[key]}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.segmentText}>{DIFFICULTY_LABELS[key]}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Practice steps</Text>

        <View style={styles.listRow}>
          <View style={styles.stepper}>
            {levels.map((_, i) => {
              const locked = !isLevelUnlockedForProgress(difficulty, i, maxUnlockedGlobalIndex);
              return (
                <View key={i} style={styles.stepperItem}>
                  <View
                    style={[
                      styles.stepperDot,
                      i === 0 && styles.stepperDotSolid,
                      locked && styles.stepperDotMuted,
                    ]}
                  />
                  {i < levels.length - 1 && <View style={styles.stepperVline} />}
                </View>
              );
            })}
          </View>

          <View style={styles.cardsCol}>
            {levels.map((level, index) => {
              const locked = !isLevelUnlockedForProgress(difficulty, index, maxUnlockedGlobalIndex);
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.levelCard, locked && styles.levelCardLocked, shadows.card]}
                  onPress={() => openLevel(level, index)}
                  activeOpacity={locked ? 1 : 0.85}
                  disabled={locked}
                >
                  <View style={styles.levelThumb}>
                    <Text style={styles.levelThumbGlyph}>✦</Text>
                  </View>
                  <View style={styles.levelTextCol}>
                    <Text style={[styles.levelSymbol, locked && styles.mutedText]}>{level.name}</Text>
                    <Text style={[styles.levelSub, locked && styles.mutedText]}>
                      Finish in {level.finishLabel}
                    </Text>
                  </View>
                  {!locked && <ChevronRight size={22} color={colors.purpleLight} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const CARD_W = SCREEN_W - spacing.xl * 2 - 28;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl },
  heroTitle: { color: colors.textWhite, marginBottom: spacing.sm },
  heroSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: spacing.md,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: spacing.xl,
  },
  zenAccentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: colors.sageAccent,
  },
  coherenceCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  coherenceCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  coherenceRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pillMed: { backgroundColor: 'rgba(33, 150, 243, 0.35)' },
  pillLabel: { fontSize: 11, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
  pillPct: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  coherenceHint: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '700', color: colors.textDark },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segmentItem: { flex: 1, borderRadius: borderRadius.sm, overflow: 'hidden' },
  segmentGradient: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  segmentText: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  segmentTextActive: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  listRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepper: { width: 20, marginRight: spacing.sm, alignItems: 'center', paddingTop: spacing.sm },
  stepperItem: { alignItems: 'center' },
  stepperVline: {
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginVertical: 2,
  },
  stepperDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'transparent',
  },
  stepperDotSolid: { backgroundColor: colors.textWhite, borderColor: colors.textWhite },
  stepperDotMuted: { borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'transparent' },
  cardsCol: { flex: 1, maxWidth: CARD_W },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  levelCardLocked: { opacity: 0.4 },
  levelThumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(124, 77, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelThumbGlyph: { fontSize: 22, color: colors.textWhite },
  levelTextCol: { flex: 1 },
  levelSymbol: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textWhite,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  levelSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  mutedText: { color: 'rgba(255,255,255,0.5)' },
  gentleBanner: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  gentleBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 4,
  },
  gentleBannerBody: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.88)',
  },
});

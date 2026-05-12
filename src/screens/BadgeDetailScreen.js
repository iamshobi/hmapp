import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Share2,
  LayoutGrid,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';
import { useMysession } from '../context/mysessionContext';
import HexBadgeRN from '../components/badges/HexBadgeRN';
import MiniCoherenceWave from '../components/badges/MiniCoherenceWave';
import {
  getHeartMathBadgeById,
  getBadgeUiState,
  getBadgeJourneyState,
  CATEGORY_TAG_STYLES,
  miniWaveCoherenceForBadge,
} from '../data/heartMathBadges';
import { spacing, borderRadius, badgesUi } from '../theme';

const FONT_BOLD = 'Sailec-Bold';
const FONT_REGULAR = 'Sailec-Medium';
const FONT_MEDIUM = 'Sailec-Medium';

function compactText(text, maxLen = 120) {
  const value = String(text || '').trim();
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen).trimEnd()}...`;
}

export default function BadgeDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { totalSessions, streak, coherencePoints, lastSurveyResult } = useMysession();
  const badgeId = route.params?.badgeId;

  const badge = useMemo(() => getHeartMathBadgeById(badgeId), [badgeId]);
  const { state, metrics, unlockedIds } = useMemo(
    () =>
      getBadgeUiState(totalSessions, streak, {
        previewType: route.params?.previewType ?? null,
        coherencePoints,
        lastSurveyResult,
      }),
    [totalSessions, streak, coherencePoints, lastSurveyResult, route.params?.previewType]
  );
  const unlocked = badge ? unlockedIds.has(badge.id) : false;

  const waveCoherence = badge ? miniWaveCoherenceForBadge(badge.id) : 2;
  const compactDescription = badge ? compactText(badge.description, 92) : '';
  const compactScience = badge ? compactText(badge.science, 120) : '';

  if (!badge) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top }]}>
        <Text style={styles.fallbackTxt}>Badge not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catStyle = CATEGORY_TAG_STYLES[badge.category] || CATEGORY_TAG_STYLES.Milestone;

  const onShare = async () => {
    try {
      await Share.share({
        message: `HeartMath — ${badge.name}\n${badge.subtitle}\n\n${badge.description}`,
        title: badge.name,
      });
    } catch {
      Alert.alert('Share', 'Unable to open share sheet.');
    }
  };

  const onReadMore = () => {
    Alert.alert(badge.scienceTitle, badge.science, [{ text: 'Close', style: 'default' }]);
  };

  return (
    <LinearGradient
      colors={['#C62B75', '#7B2A8B', '#3D1260']}
      locations={[0, 0.45, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.root}
    >
      <View style={[styles.navRow, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.84}
        >
          <ChevronLeft size={20} color={badgesUi.text.secondary} strokeWidth={2} />
          <Text style={styles.backTxt}>Badge Collection</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.copyBlock}>
          <View style={[styles.statusChip, unlocked ? styles.statusOn : styles.statusOff]}>
            {unlocked ? (
              <CheckCircle2 size={12} color="#86EFAC" strokeWidth={2} />
            ) : (
              <Lock size={12} color={badgesUi.text.muted} strokeWidth={2} />
            )}
            <Text style={[styles.statusTxt, unlocked ? styles.statusTxtOn : styles.statusTxtOff]}>
              {unlocked ? 'Unlocked' : 'Locked'}
            </Text>
          </View>

          <View style={styles.hero}>
            <HexBadgeRN badge={badge} size={96} unlocked={unlocked} />
          </View>

          <Text style={styles.title}>{badge.name}</Text>
          <View style={[styles.catPill, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.catPillTxt, { color: catStyle.text }]}>{badge.category}</Text>
          </View>
          <Text style={styles.desc}>{compactDescription}</Text>
          <Text style={styles.stateMeta}>
            {getBadgeJourneyState(metrics.sessions) === 'settle'
              ? 'Settle'
              : getBadgeJourneyState(metrics.sessions) === 'flow'
              ? 'Flow'
              : getBadgeJourneyState(metrics.sessions) === 'deep'
              ? 'Deep'
              : 'Still'}{' '}
            · Sessions {metrics.sessions} · Streak {metrics.streak} · Quality {metrics.quality} · CP {metrics.points}
          </Text>
        </View>

        {unlocked ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionPrimary,
                state === 'still' && metrics.sessions >= 127 && styles.actionPrimaryPro,
              ]}
              onPress={onShare}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[badge.gradient[0], badge.gradient[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionPrimaryGrad}
              >
                <Share2 size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.actionPrimaryTxt}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>
            {!(state === 'still' && metrics.sessions >= 127) ? (
              <TouchableOpacity
                style={styles.actionSecondary}
                onPress={() => navigation.goBack()}
                activeOpacity={0.88}
              >
                <LayoutGrid size={14} color={badgesUi.text.secondary} strokeWidth={2} />
                <Text style={styles.actionSecondaryTxt}>Gallery</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <TrendingUp size={14} color={badgesUi.text.muted} strokeWidth={2} />
            <Text style={styles.cardHeadTxt}>Milestone data</Text>
          </View>
          <Text style={styles.lbl}>Trigger</Text>
          <Text style={styles.val}>{badge.triggerEvent}</Text>
          <Text style={[styles.lbl, styles.lblSp]}>Key metric</Text>
          <Text style={styles.val}>{badge.keyMetric}</Text>
          <View style={styles.waveBox}>
            <MiniCoherenceWave coherence={waveCoherence} />
          </View>
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextHeadTxt}>Next level</Text>
          <Text style={styles.nextBody}>
            Next: <Text style={[styles.nextHighlight, { color: badge.gradient[0] }]}>{badge.nextLevelName}</Text>
          </Text>
          <View style={styles.nextProgHeader}>
            <Text style={styles.nextProgLbl}>Progress</Text>
            <Text style={[styles.nextProgPct, { color: badge.gradient[0] }]}>{badge.nextProgress}%</Text>
          </View>
          <View style={styles.nextTrack}>
            <LinearGradient
              colors={[badge.gradient[0], badge.gradient[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.nextFill, { width: `${Math.min(100, Math.max(0, badge.nextProgress))}%` }]}
            />
          </View>
          <Text style={styles.nextHint}>{compactText(badge.nextProgressLabel, 52)}</Text>
        </View>

        <View style={styles.scienceCard}>
          <View style={styles.scienceHead}>
            <View style={[styles.scienceIconBox, { backgroundColor: `${badge.gradient[0]}22` }]}>
              <BookOpen size={14} color={badge.gradient[0]} strokeWidth={2} />
            </View>
            <View style={styles.scienceHeadTxt}>
              <Text style={styles.scienceTitle}>{badge.scienceTitle}</Text>
              <Text style={styles.scienceSub}>HeartMath research</Text>
            </View>
          </View>
          <Text style={styles.scienceBody}>{compactScience}</Text>
        </View>

        <TouchableOpacity style={styles.readMore} onPress={onReadMore} activeOpacity={0.88}>
          <Text style={[styles.readMoreTxt, { color: badgesUi.text.secondary }]}>
            Read more
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3D1260' },
  fallbackTxt: { fontFamily: FONT_REGULAR, color: badgesUi.text.primary, marginBottom: spacing.sm },
  fallbackLink: { fontFamily: FONT_BOLD, color: '#F6A400' },
  navRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.labelSize,
    color: badgesUi.text.secondary,
  },
  scroll: {
    paddingHorizontal: spacing.md,
  },
  copyBlock: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  statusOn: {
    backgroundColor: 'rgba(134,239,172,0.12)',
    borderColor: 'rgba(134,239,172,0.28)',
  },
  statusOff: {
    backgroundColor: badgesUi.surface,
    borderColor: badgesUi.border,
  },
  statusTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.metaSize,
  },
  statusTxtOn: { color: '#A7F3D0' },
  statusTxtOff: { color: badgesUi.text.muted },
  hero: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: badgesUi.titleSize,
    letterSpacing: badgesUi.titleSpacing,
    color: badgesUi.text.primary,
    textAlign: 'left',
    marginBottom: spacing.xs + 2,
    width: '100%',
  },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm + 2,
  },
  catPillTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.captionSize,
    letterSpacing: 0.2,
  },
  desc: {
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.bodySize,
    lineHeight: 20,
    color: badgesUi.text.secondary,
    textAlign: 'left',
    width: '100%',
  },
  stateMeta: {
    marginTop: spacing.xs + 2,
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.captionSize,
    color: badgesUi.text.muted,
    textAlign: 'left',
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionPrimary: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionPrimaryPro: {
    flex: 1,
  },
  actionPrimaryGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
  },
  actionPrimaryTxt: {
    fontFamily: FONT_BOLD,
    fontSize: badgesUi.labelSize,
    color: '#FFFFFF',
  },
  actionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    backgroundColor: badgesUi.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: badgesUi.border,
  },
  actionSecondaryTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.labelSize,
    color: badgesUi.text.primary,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: badgesUi.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: badgesUi.border,
    marginBottom: spacing.sm + 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardHeadTxt: {
    fontFamily: FONT_BOLD,
    fontSize: badgesUi.metaSize,
    color: badgesUi.text.primary,
    letterSpacing: 0.15,
  },
  lbl: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.captionSize,
    color: badgesUi.text.muted,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  lblSp: { marginTop: spacing.sm + 2 },
  val: {
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.labelSize,
    lineHeight: badgesUi.labelLine,
    color: badgesUi.text.primary,
  },
  waveBox: {
    marginTop: spacing.md,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  nextCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: badgesUi.border,
    backgroundColor: badgesUi.surface,
    marginBottom: spacing.sm + 2,
  },
  nextHeadTxt: {
    fontFamily: FONT_BOLD,
    fontSize: badgesUi.metaSize,
    color: badgesUi.text.primary,
    letterSpacing: 0.15,
    marginBottom: spacing.sm,
  },
  nextBody: {
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.metaSize,
    lineHeight: 17,
    color: badgesUi.text.secondary,
    marginBottom: spacing.md,
  },
  nextHighlight: {
    fontFamily: FONT_BOLD,
  },
  nextProgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  nextProgLbl: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.captionSize,
    color: badgesUi.text.muted,
    letterSpacing: 0.2,
  },
  nextProgPct: {
    fontFamily: FONT_BOLD,
    fontSize: badgesUi.captionSize,
  },
  nextTrack: {
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: badgesUi.track,
    overflow: 'hidden',
  },
  nextFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  nextHint: {
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.captionSize,
    color: badgesUi.text.muted,
    marginTop: spacing.sm,
  },
  scienceCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: badgesUi.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: badgesUi.border,
    marginBottom: spacing.xs,
  },
  scienceHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  scienceHeadTxt: {
    flex: 1,
  },
  scienceIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scienceTitle: {
    fontFamily: FONT_BOLD,
    fontSize: badgesUi.labelSize,
    color: badgesUi.text.primary,
  },
  scienceSub: {
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.captionSize,
    color: badgesUi.text.muted,
    marginTop: 2,
  },
  scienceBody: {
    fontFamily: FONT_REGULAR,
    fontSize: badgesUi.metaSize,
    lineHeight: 17,
    color: badgesUi.text.secondary,
  },
  readMore: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  readMoreTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: badgesUi.metaSize,
  },
});

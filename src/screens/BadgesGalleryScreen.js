import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle2 } from 'lucide-react-native';
import { useMysession } from '../context/mysessionContext';
import HexBadgeRN from '../components/badges/HexBadgeRN';
import {
  ALL_HEARTMATH_BADGES,
  BADGE_CATEGORY_FILTERS,
  getBadgeUiState,
} from '../data/heartMathBadges';
import { spacing, borderRadius } from '../theme';

const FONT_BOLD = 'Sailec-Bold';
const FONT_REGULAR = 'Sailec-Medium';
const FONT_MEDIUM = 'Sailec-Medium';

export default function BadgesGalleryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { totalSessions, streak, coherencePoints, lastSurveyResult } = useMysession();
  const [filter, setFilter] = useState('All');

  const { state, metrics, unlockedIds } = useMemo(
    () =>
      getBadgeUiState(totalSessions, streak, {
        previewType: route.params?.previewType ?? null,
        coherencePoints,
        lastSurveyResult,
      }),
    [totalSessions, streak, coherencePoints, lastSurveyResult, route.params?.previewType]
  );
  const unlockedCount = ALL_HEARTMATH_BADGES.filter((b) => unlockedIds.has(b.id)).length;
  const progressPct = ALL_HEARTMATH_BADGES.length
    ? (unlockedCount / ALL_HEARTMATH_BADGES.length) * 100
    : 0;

  const filtered = useMemo(() => {
    if (filter === 'All') return ALL_HEARTMATH_BADGES;
    return ALL_HEARTMATH_BADGES.filter((b) => b.category === filter);
  }, [filter]);

  const colGap = spacing.md;
  const contentInner = width - spacing.lg * 2;
  const cellW = (contentInner - colGap) / 2;

  return (
    <LinearGradient
      colors={['#C62B75', '#7B2A8B', '#3D1260']}
      locations={[0, 0.45, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.root}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 2 }]}>
        <View style={styles.statusRow}>
          <Text style={styles.statusTime}>4:40</Text>
          <Text style={styles.statusIcons}>•••  ↔</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>My Badges</Text>
        <Text style={styles.levelMeta}>
          {state === 'foundation'
            ? 'Foundation'
            : state === 'seed'
            ? 'Seed'
            : state === 'habit'
            ? 'Habit'
            : 'Deep Practice'}
        </Text>
        <View style={styles.countRow}>
          <View style={styles.countPill}>
            <CheckCircle2 size={11} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.countPillTxt}>{unlockedCount} unlocked</Text>
          </View>
          <Text style={styles.countMeta}>of {ALL_HEARTMATH_BADGES.length} total</Text>
        </View>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#F97316', '#EC4899', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {BADGE_CATEGORY_FILTERS.map((tab) => {
            const count =
              tab === 'All'
                ? ALL_HEARTMATH_BADGES.length
                : ALL_HEARTMATH_BADGES.filter((b) => b.category === tab).length;
            const active = filter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
                onPress={() => setFilter(tab)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterChipTxt, active && styles.filterChipTxtActive]}>
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {filtered.map((badge) => {
            const unlocked = unlockedIds.has(badge.id);
            return (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCell,
                  { width: cellW },
                  unlocked ? styles.badgeCellOn : styles.badgeCellOff,
                ]}
                onPress={() =>
                  navigation.navigate('BadgeDetail', {
                    badgeId: badge.id,
                    previewType: route.params?.previewType ?? null,
                  })
                }
                activeOpacity={0.88}
              >
                <HexBadgeRN badge={badge} size={66} unlocked={unlocked} />
                <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]} numberOfLines={2}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeCat}>{badge.category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.metricFootnote}>
          Sessions {metrics.sessions} · Streak {metrics.streak} · Quality {metrics.quality} · CP {metrics.points}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
  },
  statusRow: {
    height: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTime: {
    fontFamily: FONT_REGULAR,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
  },
  statusIcons: {
    fontFamily: FONT_REGULAR,
    fontSize: 8,
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.42)',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  screenTitle: {
    fontFamily: FONT_BOLD,
    fontSize: 38,
    lineHeight: 40,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  levelMeta: {
    fontFamily: FONT_MEDIUM,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 16,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  countPillTxt: {
    fontFamily: FONT_BOLD,
    fontSize: 12,
    color: '#FFFFFF',
  },
  countMeta: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  progressTrack: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 22,
  },
  progressFill: {
    height: '100%',
    minWidth: 2,
    borderRadius: borderRadius.full,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 14,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.34)',
  },
  filterChipTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: 12,
    color: 'rgba(255,255,255,0.58)',
  },
  filterChipTxtActive: {
    fontFamily: FONT_BOLD,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: spacing.md,
    rowGap: spacing.md + 2,
  },
  badgeCell: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 22,
    marginBottom: 0,
    borderWidth: 1,
  },
  badgeCellOn: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  badgeCellOff: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeName: {
    fontFamily: FONT_BOLD,
    fontSize: 14,
    lineHeight: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 14,
  },
  badgeNameLocked: {
    color: 'rgba(255,255,255,0.45)',
  },
  badgeCat: {
    fontFamily: FONT_REGULAR,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 10,
    textAlign: 'center',
  },
  metricFootnote: {
    marginTop: 12,
    marginBottom: 14,
    fontFamily: FONT_REGULAR,
    fontSize: 10,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
  },
});

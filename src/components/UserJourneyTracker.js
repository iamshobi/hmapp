import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Heart } from 'lucide-react-native';
import { borderRadius, spacing } from '../theme';

const JOURNEY_COLORS = {
  cardBg: '#893376',
  rail: '#81236A',
  title: 'rgba(255,255,255,0.68)',
  label: 'rgba(255,255,255,0.62)',
  value: 'rgba(255,255,255,0.36)',
  subtitle: 'rgba(255,255,255,0.76)',
  doneFill: '#AB6596',
  pendingFill: '#A96596',
  currentFill: '#972B7A',
  currentRing: '#FFFFFF',
};

const EARLY_MILESTONES = [
  { label: 'First Step', threshold: 1 },
  { label: 'Habit Seed', threshold: 7 },
  { label: 'Habit Formed', threshold: 21 },
  { label: 'Transformation', threshold: 60 },
];

const ADVANCED_MILESTONES = [
  { label: 'Habit Formed', threshold: 21 },
  { label: 'Deep Practice', threshold: 50 },
  { label: 'Mastery', threshold: 100 },
  { label: "You're Here", threshold: 127 },
];

function getCurrentIndex(totalSessions, milestones) {
  let idx = 0;
  for (let i = 0; i < milestones.length; i += 1) {
    if (totalSessions >= milestones[i].threshold) idx = i;
  }
  return idx;
}

function getJourneySubtitle(totalSessions) {
  if (totalSessions < 21) {
    const away = Math.max(21 - totalSessions, 0);
    return `${away} sessions away from habit formation`;
  }
  if (totalSessions < 100) {
    return '3× more likely to sustain a daily practice at this stage';
  }
  return "Top 1% practitioner — you're in rare company";
}

function JourneyCard({ effectiveSessions }) {
  const milestones = effectiveSessions >= 100 ? ADVANCED_MILESTONES : EARLY_MILESTONES;
  const currentIndex = getCurrentIndex(effectiveSessions, milestones);
  const subtitle = getJourneySubtitle(effectiveSessions);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>YOUR JOURNEY</Text>
      <View style={styles.lineWrap}>
        <View style={styles.line} />
        <View style={styles.pointsRow}>
          {milestones.map((item, index) => {
            const isCurrent = index === currentIndex;
            const isDone = index < currentIndex;
            return (
              <View key={item.label} style={styles.pointCol}>
                <View
                  style={[
                    styles.pointOuter,
                    isDone && styles.pointDone,
                    isCurrent && styles.pointCurrent,
                  ]}
                >
                  <View style={styles.pointInner}>
                    {isDone ? (
                      <Check size={11} color="#FFFFFF" strokeWidth={2.8} />
                    ) : isCurrent ? (
                      <Heart size={10} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
                    ) : (
                      <Text style={styles.pendingDash}>-</Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.pointLabel, isCurrent && styles.pointLabelCurrent]}>{item.label}</Text>
                <Text style={[styles.pointSub, isCurrent && styles.pointSubCurrent]}>
                  {isCurrent && effectiveSessions > item.threshold ? effectiveSessions : item.threshold}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export default function UserJourneyTracker({ totalSessions = 0 }) {
  const pages = useMemo(
    () => [
      { key: 'firstTime', sessions: 1 },
      { key: 'firstWeek', sessions: 15 },
      { key: 'longTerm', sessions: 127 },
    ],
    []
  );

  const initialPageIndex = useMemo(() => {
    if (totalSessions >= 100) return 2;
    if (totalSessions >= 10) return 1;
    return 0;
  }, [totalSessions]);
  const [activeIndex, setActiveIndex] = useState(initialPageIndex);

  const cyclePage = () => {
    setActiveIndex((prev) => (prev + 1) % pages.length);
  };

  return (
    <TouchableOpacity
      style={styles.carousel}
      activeOpacity={0.92}
      onPress={cyclePage}
      accessibilityRole="button"
      accessibilityLabel="Cycle My Journey state"
    >
      <View style={styles.carouselContent}>
        <JourneyCard effectiveSessions={pages[activeIndex]?.sessions ?? pages[0].sessions} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  carousel: {
    marginBottom: spacing.xs,
  },
  carouselContent: {
    paddingHorizontal: spacing.lg,
  },
  wrap: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: JOURNEY_COLORS.cardBg,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 13,
  },
  title: {
    color: JOURNEY_COLORS.title,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  lineWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  line: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 17,
    height: 1,
    backgroundColor: JOURNEY_COLORS.rail,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointCol: {
    width: '24%',
    alignItems: 'center',
  },
  pointOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: JOURNEY_COLORS.pendingFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pointInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointDone: {
    backgroundColor: JOURNEY_COLORS.doneFill,
  },
  pointCurrent: {
    backgroundColor: JOURNEY_COLORS.currentFill,
    borderColor: JOURNEY_COLORS.currentRing,
    borderWidth: 2,
  },
  pendingDash: {
    color: 'rgba(255,255,255,0.52)',
    fontWeight: '700',
    fontSize: 13,
    marginTop: -2,
  },
  pointLabel: {
    color: JOURNEY_COLORS.label,
    fontSize: 11,
    lineHeight: 12,
    textAlign: 'center',
    minHeight: 23,
  },
  pointLabelCurrent: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pointSub: {
    color: JOURNEY_COLORS.value,
    fontSize: 9,
    marginTop: 1,
  },
  pointSubCurrent: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  subtitle: {
    color: JOURNEY_COLORS.subtitle,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});


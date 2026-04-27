import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useBreathGarden } from '../context/BreathGardenContext';
import {
  getMoodOptionById,
  resolveCalendarDayDisplay,
  dateKeyFromLocalDate,
  textColorForMoodFill,
} from '../constants/sessionMoodOptions';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function weekRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
}

export default function OverallMoodScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { moodEntries } = useBreathGarden();

  const { topItems, dateLabel } = useMemo(() => {
    const { start, end } = weekRange();
    const counts = {};
    let cursor = new Date(start);
    while (cursor <= end) {
      const key = dateKeyFromLocalDate(cursor);
      const disp = resolveCalendarDayDisplay(key, moodEntries);
      if (disp?.type === 'mood' && disp.moodId) {
        counts[disp.moodId] = (counts[disp.moodId] || 0) + 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    let ranked = Object.entries(counts)
      .map(([moodId, count]) => ({
        mood: getMoodOptionById(moodId),
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
    if (ranked.length === 0) {
      ranked = [
        { mood: getMoodOptionById('happy'), count: 0, pct: 32 },
        { mood: getMoodOptionById('peaceful'), count: 0, pct: 28 },
        { mood: getMoodOptionById('content'), count: 0, pct: 24 },
        { mood: getMoodOptionById('excited'), count: 0, pct: 16 },
      ];
    }
    return {
      topItems: ranked,
      dateLabel: `${fmtDate(start)} - ${fmtDate(end)}`,
    };
  }, [moodEntries]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeft size={26} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Overall Mood</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your emotional state this week</Text>
        <Text style={styles.sub}>{dateLabel}</Text>

        <View style={styles.bubbleWrap}>
          {topItems.map((item, idx) => {
            const size = idx === 0 ? 170 : idx === 1 ? 110 : idx === 2 ? 88 : 62;
            const pos = [
              { left: 8, top: 50 },
              { right: 38, top: 42 },
              { right: 70, top: 172 },
              { right: 18, top: 210 },
            ][idx];
            const bg = item.mood?.trackColor ?? '#B0BEC5';
            return (
              <View
                key={item.mood?.id ?? `m${idx}`}
                style={[
                  styles.bubble,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: bg,
                    ...pos,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bubblePct,
                    idx === 0 && styles.bubblePctBig,
                    { color: textColorForMoodFill(bg) },
                  ]}
                >
                  {item.pct}%
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.legend}>
          {topItems.map((item, idx) => (
            <View key={`lg-${item.mood?.id ?? idx}`} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.mood?.trackColor ?? '#B0BEC5' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legendName}>{item.mood?.label ?? 'No mood'}</Text>
                <Text style={styles.legendPct}>{item.pct}%</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F9FF' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  navTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  scroll: { paddingHorizontal: spacing.lg },
  title: {
    ...typography.modalTitle,
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'center',
    color: '#1A1A1A',
    marginTop: spacing.sm,
  },
  sub: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '600',
  },
  bubbleWrap: {
    height: 320,
    position: 'relative',
    marginBottom: spacing.lg,
  },
  bubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  bubblePct: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  bubblePctBig: { fontSize: 48, fontWeight: '200' },
  legend: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  legendName: { fontSize: 16, color: colors.textDark, fontWeight: '600' },
  legendPct: { fontSize: 18, color: '#7D2C78', fontWeight: '700', marginTop: 2 },
});

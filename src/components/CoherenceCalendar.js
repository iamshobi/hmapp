/**
 * Month grid: per-day mood-colored dots. Logged mood or skip wins; past days without a log use
 * illustrative fills (mostly positive wheel colors). Future dates use placeholder fill.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SESSION_MOOD_OPTIONS, textColorForMoodFill, resolveCalendarDayDisplay } from '../constants/sessionMoodOptions';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const PLACEHOLDER_DOT = '#E9EEF5';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function CoherenceCalendar({
  initialYear,
  initialMonthIndex,
  moodEntries,
  /** `'before'` | `'after'` — session start vs end only; default combines both */
  moodPhase,
  selectedDay,
  onSelectDay,
  summaryCard,
  compact = false,
  /** (year, monthIndex 0–11) when user changes month */
  onMonthYearChange,
}) {
  const boot = new Date();
  const [year, setYear] = useState(initialYear ?? boot.getFullYear());
  const [monthIndex, setMonthIndex] = useState(
    initialMonthIndex !== undefined ? initialMonthIndex : boot.getMonth()
  );

  useEffect(() => {
    onMonthYearChange?.(year, monthIndex);
  }, []);

  const { gridCells, todayKey } = useMemo(() => {
    const dim = daysInMonth(year, monthIndex);
    const firstDow = new Date(year, monthIndex, 1).getDay();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push({ type: 'empty', key: `e${i}` });
    const t = new Date();
    const tk =
      t.getFullYear() === year && t.getMonth() === monthIndex
        ? `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
        : null;
    for (let d = 1; d <= dim; d++) {
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(year, monthIndex, d);
      const isFutureDate = dateObj > new Date();
      const display = !isFutureDate ? resolveCalendarDayDisplay(key, moodEntries, moodPhase) : null;
      cells.push({ type: 'day', key, day: d, display });
    }
    return { gridCells: cells, todayKey: tk };
  }, [year, monthIndex, moodEntries, moodPhase]);

  const shiftMonth = (delta) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const d = new Date(year, monthIndex + delta, 1);
    const ny = d.getFullYear();
    const nm = d.getMonth();
    setYear(ny);
    setMonthIndex(nm);
    onMonthYearChange?.(ny, nm);
  };

  const monthLabel = new Date(year, monthIndex, 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const dot = compact ? 28 : 34;
  const fontDay = compact ? 11 : 12;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={12} accessibilityLabel="Previous month">
          <ChevronLeft size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, compact && styles.monthTitleCompact]}>{monthLabel}</Text>
        <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={12} accessibilityLabel="Next month">
          <ChevronRight size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {WEEKDAYS.map((w, i) => (
          <Text key={`${w}-${i}`} style={[styles.weekLetter, compact && styles.weekLetterCompact]}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {gridCells.map((cell) => {
          if (cell.type === 'empty') {
            return <View key={cell.key} style={[styles.cell, { width: `${100 / 7}%` }]} />;
          }
          const key = cell.key;
          const isToday = key === todayKey;
          const isSel = selectedDay === key;
          const disp = cell.display;
          const isEmpty = disp === null || disp === undefined;
          const isSkipped = disp?.type === 'skipped';
          const moodColor = disp?.type === 'mood' ? disp.color : null;
          const dayTxtColor = isEmpty
            ? 'rgba(28,28,28,0.45)'
            : isSkipped
            ? 'rgba(28,28,28,0.55)'
            : textColorForMoodFill(moodColor);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.cell, { width: `${100 / 7}%` }]}
              onPress={() => {
                if (!onSelectDay) return;
                if (isEmpty) return;
                onSelectDay(key, disp);
              }}
              activeOpacity={isEmpty ? 1 : 0.75}
            >
              <View
                style={[
                  styles.dotOuter,
                  {
                    width: dot + 8,
                    height: dot + 8,
                    borderRadius: (dot + 8) / 2,
                    borderWidth: isToday ? 2 : isSel ? 2 : 0,
                    borderColor: isToday ? '#43A047' : isSel ? colors.navActive : 'transparent',
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      width: dot,
                      height: dot,
                      borderRadius: dot / 2,
                      backgroundColor: isEmpty ? PLACEHOLDER_DOT : isSkipped ? '#D0D4DA' : moodColor,
                      borderWidth: 0,
                      borderColor: 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.dayNum, { fontSize: fontDay, color: dayTxtColor }]}>
                    {cell.day}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        {SESSION_MOOD_OPTIONS.map((L) => (
          <View key={L.id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: L.trackColor }]} />
            {!compact && <Text style={styles.legendText}>{L.label}</Text>}
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D0D4DA' }]} />
          {!compact && <Text style={styles.legendText}>Skipped</Text>}
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PLACEHOLDER_DOT }]} />
          {!compact && <Text style={styles.legendText}>Future</Text>}
        </View>
      </View>

      {summaryCard}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  wrapCompact: {
    padding: spacing.sm,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthTitle: {
    ...typography.sectionTitle,
    fontSize: 17,
    color: colors.textDark,
  },
  monthTitleCompact: { fontSize: 15 },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekLetter: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  weekLetterCompact: { fontSize: 11 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cell: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dotOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

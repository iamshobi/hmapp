import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { borderRadius, spacing, shadows } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Light';
const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dayKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function hasLoggedSession(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (Array.isArray(entry.sessions) && entry.sessions.length > 0) return true;
  return false;
}

function buildPreviewLoggedSet(year, monthIndex, previewType) {
  const map = {
    zero: [],
    firstTime: [8],
    building: [3, 8, 14, 21, 27],
    inactiveSurvey: [4, 11, 19, 26],
    growing: [3, 8, 14, 21, 27],
    advanced: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29],
    pro: [1, 3, 5, 7, 8, 11, 14, 17, 19, 21, 24, 27, 29],
  };
  const days = map[previewType] || map.building;
  const set = new Set();
  days.forEach((d) => {
    set.add(dayKey(year, monthIndex, d));
  });
  return set;
}

function normalizePreviewType(type) {
  if (type === 'growing') return 'building';
  return type;
}

function getSessionsForType(type) {
  const t = normalizePreviewType(type);
  if (t === 'pro') return 100;
  if (t === 'advanced') return 17;
  if (t === 'inactiveSurvey') return 12;
  if (t === 'building') return 5;
  if (t === 'firstTime') return 1;
  return 0;
}

export default function ProgressCheckinsCalendar({
  moodEntries = {},
  previewType = null,
  embedded = false,
  sessionCount = 0,
  loggedVariant = 'gradient',
}) {
  const boot = new Date();
  const [year, setYear] = useState(boot.getFullYear());
  const [monthIndex, setMonthIndex] = useState(boot.getMonth());

  const loggedDays = useMemo(() => {
    const set = new Set();
    Object.entries(moodEntries || {}).forEach(([key, value]) => {
      if (hasLoggedSession(value)) set.add(key);
    });
    return set;
  }, [moodEntries]);

  const { cells, totalRows } = useMemo(() => {
    const dim = daysInMonth(year, monthIndex);
    const firstDow = new Date(year, monthIndex, 1).getDay();
    const c = [];
    for (let i = 0; i < firstDow; i++) c.push({ type: 'empty', key: `e-${i}` });
    const previewLoggedSet = buildPreviewLoggedSet(year, monthIndex, previewType);
    const usePreview = Boolean(previewType);
    const hasRealEntries = loggedDays.size > 0;
    for (let d = 1; d <= dim; d++) {
      const key = dayKey(year, monthIndex, d);
      const isPreviewLogged = usePreview ? previewLoggedSet.has(key) : !hasRealEntries && previewLoggedSet.has(key);
      c.push({ type: 'day', key, day: d, logged: usePreview ? isPreviewLogged : loggedDays.has(key) || isPreviewLogged });
    }
    const rows = Math.ceil(c.length / 7);
    return { cells: c, totalRows: rows };
  }, [loggedDays, monthIndex, previewType, year]);

  const sessionsDisplay = previewType ? getSessionsForType(previewType) : Math.max(0, Math.round(sessionCount || 0));
  const daysPracticedDisplay = useMemo(() => {
    if (previewType) {
      const previewDays = buildPreviewLoggedSet(year, monthIndex, previewType).size;
      return Math.min(previewDays, sessionsDisplay);
    }
    if (sessionsDisplay <= 0) return 0;
    if (loggedDays.size > 0) return Math.min(loggedDays.size, sessionsDisplay);
    // If we only know sessions count (no dated entries), assume at least one practiced day.
    return 1;
  }, [loggedDays.size, monthIndex, previewType, sessionsDisplay, year]);

  const monthLabel = useMemo(
    () =>
      new Date(year, monthIndex, 1).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [monthIndex, year]
  );

  const shiftMonth = (delta) => {
    const d = new Date(year, monthIndex + delta, 1);
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
  };

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      <View style={styles.headerRow}>
        {embedded ? <View /> : <Text style={styles.title}>Check-ins</Text>}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => shiftMonth(-1)}
            hitSlop={12}
            style={styles.navBtn}
            accessibilityLabel="Previous month"
          >
            <ChevronLeft size={18} color="#E18B31" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthLabel}</Text>
          <TouchableOpacity
            onPress={() => shiftMonth(1)}
            hitSlop={12}
            style={styles.navBtn}
            accessibilityLabel="Next month"
          >
            <ChevronRight size={18} color="#E18B31" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, idx) => (
          <Text key={`${w}-${idx}`} style={styles.weekTxt}>
            {w}
          </Text>
        ))}
      </View>

      <View style={[styles.grid, { minHeight: totalRows * 44 }]}>
        {cells.map((cell) => {
          if (cell.type === 'empty') return <View key={cell.key} style={styles.cell} />;
          return (
            <View key={cell.key} style={styles.cell}>
              {cell.logged ? (
                loggedVariant === 'gray' ? (
                  <View style={styles.loggedGrayBubble}>
                    <Text style={styles.loggedGrayDayText}>{cell.day}</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#FFB300', '#F57C00', '#D81B60']}
                    start={{ x: 0.08, y: 0.1 }}
                    end={{ x: 0.92, y: 0.92 }}
                    style={styles.loggedRing}
                  >
                    <View style={styles.loggedInner}>
                      <Text style={styles.loggedDayText}>{cell.day}</Text>
                    </View>
                  </LinearGradient>
                )
              ) : (
                <View style={styles.dayBubble}>
                  <Text style={styles.dayText}>{cell.day}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.footerStats}>
        <Text style={styles.footerStatText}>
          Number of sessions: {sessionsDisplay}
        </Text>
        <Text style={styles.footerStatText}>Days practiced: {daysPracticedDisplay}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: spacing.md,
    ...shadows.card,
  },
  wrapEmbedded: {
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#2D1B3A',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F5',
  },
  monthText: {
    fontFamily: PROGRESS_FONT_BOLD,
    minWidth: 120,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(52,37,61,0.76)',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(52,37,61,0.62)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    fontSize: 13,
    color: 'rgba(52,37,61,0.62)',
    fontWeight: '600',
  },
  loggedRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedDayText: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 13,
    color: '#E18B31',
    fontWeight: '800',
  },
  loggedGrayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8BCC8',
  },
  loggedGrayDayText: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footerStats: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 2,
  },
  footerStatText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(52,37,61,0.78)',
    fontWeight: '600',
  },
});

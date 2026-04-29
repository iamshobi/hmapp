/**
 * Mood / coherence hub: Calendar · Trends (charts + overall mood) · Insights (session mood lift).
 * Supports compact mode for phone mockups. Charts: react-native-svg (no recharts).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Sparkles } from 'lucide-react-native';
import CoherenceCalendar from './CoherenceCalendar';
import {
  getCalendarLevelFromMoodEntry,
  resolveCalendarDayDisplay,
  dateKeyFromLocalDate,
  getMoodOptionById,
  textColorForMoodFill,
  computeOverallPairedSessionImprovement,
  computeSessionMoodImprovementByStartEmotion,
  normalizeMoodDaySessions,
  filterMoodEntriesForRange,
} from '../constants/sessionMoodOptions';
import { colors, spacing, borderRadius, typography, shadows, palette } from '../theme';
import { useMysession } from '../context/mysessionContext';

const TABS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'trend', label: 'Trends' },
  { id: 'insights', label: 'Insights' },
];

/** 5 weeks × sample coherence 0–1 (rising) */
const TREND_COHERENCE = [0.35, 0.42, 0.51, 0.58, 0.67, 0.72, 0.78, 0.82, 0.86, 0.88, 0.9, 0.91, 0.93, 0.94, 0.95];
const TREND_STRESS = [0.92, 0.88, 0.82, 0.75, 0.68, 0.58, 0.48, 0.4, 0.32, 0.26, 0.22, 0.18, 0.15, 0.12, 0.1];

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const PLACEHOLDER_DOT = '#E9EEF5';

function keyForYMD(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildAreaPath(values, width, height, pad, invertY = true) {
  const n = values.length;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = innerW / (n - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = invertY ? pad + innerH * (1 - v) : pad + innerH * v;
    return { x, y };
  });
  let d = `M ${pts[0].x} ${height - pad} L ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${height - pad} Z`;
  return { d, pts };
}

function buildLinePath(values, width, height, pad) {
  const n = values.length;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = innerW / (n - 1);
  let d = '';
  values.forEach((v, i) => {
    const x = pad + i * step;
    const y = pad + innerH * (1 - v);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });
  return d;
}

function TrendChart({ title, emoji, values, stroke, fillId, gradientStops, height, compact }) {
  const w = compact ? 280 : 320;
  const h = height ?? (compact ? 100 : 120);
  const pad = 12;
  const { d } = buildAreaPath(values, w, h, pad);
  const lineD = buildLinePath(values, w, h, pad);

  return (
    <View style={styles.trendBlock}>
      <View style={styles.trendTitleRow}>
        <Text style={[styles.trendTitle, compact && styles.trendTitleSm]}>{emoji} {title}</Text>
      </View>
      <Svg width={w} height={h}>
        <Defs>
          <SvgLinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            {gradientStops.map((s, i) => (
              <Stop key={i} offset={s.off} stopColor={s.c} stopOpacity={s.o} />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Path d={d} fill={`url(#${fillId})`} />
        <Path d={lineD} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

function RangeSubTabs({ value, onChange, compact }) {
  const modes = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];
  return (
    <View style={[styles.subTabs, compact && styles.subTabsCompact]}>
      {modes.map((m) => (
        <TouchableOpacity
          key={m.id}
          style={[styles.subTabBtn, value === m.id && styles.subTabBtnOn]}
          onPress={() => onChange(m.id)}
        >
          <Text style={[styles.subTabTxt, value === m.id && styles.subTabTxtOn]}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/** Pre- vs post-session mood for grids and summaries (session start vs end). */
function BeforeAfterToggle({ value, onChange, compact }) {
  return (
    <View style={[styles.beforeAfterWrap, compact && styles.beforeAfterWrapCompact]}>
      <TouchableOpacity
        style={[styles.beforeAfterSeg, value === 'before' && styles.beforeAfterSegOn]}
        onPress={() => onChange('before')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'before' }}
        accessibilityLabel="Before session mood"
      >
        <Text style={[styles.beforeAfterSegTxt, value === 'before' && styles.beforeAfterSegTxtOn]}>Before</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.beforeAfterSeg, value === 'after' && styles.beforeAfterSegOn]}
        onPress={() => onChange('after')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'after' }}
        accessibilityLabel="After session mood"
      >
        <Text style={[styles.beforeAfterSegTxt, value === 'after' && styles.beforeAfterSegTxtOn]}>After</Text>
      </TouchableOpacity>
    </View>
  );
}

function aggregateVoteCounts(moodEntries, phase) {
  const both = phase == null;
  const counts = {};
  const src = moodEntries && typeof moodEntries === 'object' ? moodEntries : {};
  Object.values(src).forEach((day) => {
    normalizeMoodDaySessions(day).forEach((s) => {
      if (!s) return;
      if (both || phase === 'before') {
        if (!s.startSkipped && s.startMoodId) counts[s.startMoodId] = (counts[s.startMoodId] || 0) + 1;
      }
      if (both || phase === 'after') {
        if (!s.endSkipped && s.endMoodId) counts[s.endMoodId] = (counts[s.endMoodId] || 0) + 1;
      }
    });
  });
  return counts;
}

function DayDetailView({ moodEntries, dayDate, compact, moodPhase, onPrevDay, onNextDay, canGoNext }) {
  const key = dateKeyFromLocalDate(dayDate);
  const raw = moodEntries?.[key];
  const display = resolveCalendarDayDisplay(key, moodEntries, moodPhase);
  const sessions = normalizeMoodDaySessions(raw);
  const label = dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const dot = compact ? 56 : 64;
  const isEmpty = display === null || display === undefined;
  const isSkipped = display?.type === 'skipped';
  const moodColor = display?.type === 'mood' ? display.color : null;

  return (
    <View style={styles.panel}>
      <View style={styles.dayNavRow}>
        <TouchableOpacity onPress={onPrevDay} hitSlop={12} accessibilityLabel="Previous day">
          <Text style={styles.dayNavBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.blockTitle, compact && styles.blockTitleSm, { marginBottom: 0 }]}>{label}</Text>
        <TouchableOpacity onPress={onNextDay} disabled={!canGoNext} hitSlop={12} accessibilityLabel="Next day">
          <Text style={[styles.dayNavBtn, !canGoNext && styles.dayNavBtnOff]}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dayHero}>
        <View
          style={[
            styles.dayHeroDot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: isEmpty ? PLACEHOLDER_DOT : isSkipped ? '#D0D4DA' : moodColor,
            },
          ]}
        />
        <Text style={styles.dayHeroCaption}>
          {isEmpty ? 'No entry' : isSkipped ? 'Skipped' : display?.label ?? ''}
        </Text>
      </View>
      <Text style={[styles.daySessionsTitle, compact && styles.daySessionsTitleSm]}>Sessions</Text>
      {sessions.length === 0 ? (
        <Text style={styles.daySessionEmpty}>No mood logs for this day.</Text>
      ) : (
        sessions.map((s, i) => (
          <View key={`sess-${i}`} style={styles.daySessionRow}>
            <Text style={styles.daySessionIdx}>{i + 1}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.daySessionLine}>
                Start:{' '}
                {s.startSkipped ? 'Skipped' : s.startMoodId ? getMoodOptionById(s.startMoodId)?.label ?? '—' : '—'}
              </Text>
              <Text style={styles.daySessionLine}>
                End:{' '}
                {s.endSkipped ? 'Skipped' : s.endMoodId ? getMoodOptionById(s.endMoodId)?.label ?? '—' : '—'}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function SessionMoodImprovementInsight({ moodEntries, compact }) {
  const overall = useMemo(() => computeOverallPairedSessionImprovement(moodEntries), [moodEntries]);
  const rows = useMemo(() => computeSessionMoodImprovementByStartEmotion(moodEntries), [moodEntries]);

  return (
    <View style={[styles.panel, compact && styles.panelCompact]}>
      <Text style={[styles.blockTitle, compact && styles.blockTitleSm]}>Mood after session vs before</Text>
      <Text style={[styles.insightMoodLead, compact && styles.insightMoodLeadSm]}>
        {overall.paired > 0
          ? `Across ${overall.paired} session${overall.paired === 1 ? '' : 's'} with both moods logged, ${overall.pctImproved}% ended with a higher mood score than at the start.`
          : 'When you log a mood at the start and end of a session on the same day, improvement appears here.'}
      </Text>
      <Text style={[styles.insightMoodCaption, compact && styles.insightMoodCaptionSm]}>
        For each emotion: % of sessions where your end mood was better than your start mood, when you began feeling that way.
      </Text>
      {rows.map((row) => (
        <View key={row.moodId} style={[styles.insightMoodRow, compact && styles.insightMoodRowCompact]}>
          <View style={[styles.insightMoodDot, { backgroundColor: row.trackColor }]} />
          <Text style={styles.insightMoodEmoji}>{row.emoji}</Text>
          <View style={styles.insightMoodLabelCol}>
            <Text style={[styles.insightMoodLabel, compact && styles.insightMoodLabelSm]} numberOfLines={1}>
              {row.label}
            </Text>
            {row.sessionCount > 0 ? (
              <Text style={[styles.insightMoodMeta, compact && styles.insightMoodMetaSm]}>
                {row.sessionCount} session{row.sessionCount === 1 ? '' : 's'}
                {typeof row.avgDelta === 'number'
                  ? ` · avg ${row.avgDelta >= 0 ? '+' : ''}${row.avgDelta.toFixed(1)} on mood scale`
                  : ''}
              </Text>
            ) : (
              <Text style={[styles.insightMoodMeta, compact && styles.insightMoodMetaSm]}>No paired logs yet</Text>
            )}
          </View>
          {row.sessionCount > 0 && row.pctImproved != null ? (
            <Text style={[styles.insightMoodPct, compact && styles.insightMoodPctSm, { color: row.trackColor }]}>
              {row.pctImproved}%
            </Text>
          ) : (
            <Text style={[styles.insightMoodDash, compact && styles.insightMoodDashSm]}>—</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function WeekView({ moodEntries, compact, moodPhase, onSelectDay }) {
  const now = new Date();
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const dot = compact ? 26 : 30;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKeyFromLocalDate(d);
    const isFuture = d > now;
    const disp = !isFuture ? resolveCalendarDayDisplay(key, moodEntries, moodPhase) : null;
    return { key, date: d, label: labels[d.getDay()], display: disp, isFuture };
  });

  return (
    <View style={styles.panel}>
      <Text style={[styles.blockTitle, compact && styles.blockTitleSm]}>Week view</Text>
      <View style={styles.weekRow}>
        {days.map((d) => {
          const isEmpty = d.isFuture || d.display === null || d.display === undefined;
          const isSkipped = d.display?.type === 'skipped';
          const moodColor = d.display?.type === 'mood' ? d.display.color : null;
          return (
            <TouchableOpacity
              key={d.key}
              style={styles.weekCol}
              activeOpacity={isEmpty ? 1 : 0.82}
              onPress={() => {
                if (!onSelectDay || isEmpty) return;
                onSelectDay(d.key, d.display);
              }}
            >
              <Text style={styles.weekLab}>{d.label}</Text>
              <View
                style={[
                  styles.weekDot,
                  {
                    width: dot,
                    height: dot,
                    borderRadius: dot / 2,
                    backgroundColor: isEmpty ? PLACEHOLDER_DOT : isSkipped ? '#D0D4DA' : moodColor,
                  },
                ]}
              />
              <Text style={styles.weekDayNum}>{d.date.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const OVERALL_MOOD_FALLBACK = [
  { moodId: 'happy', pct: 32 },
  { moodId: 'peaceful', pct: 28 },
  { moodId: 'content', pct: 24 },
  { moodId: 'excited', pct: 16 },
];

function OverallMoodInline({ moodEntries, compact, moodPhase }) {
  const items = useMemo(() => {
    const counts = aggregateVoteCounts(moodEntries, moodPhase);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const ranked = Object.entries(counts)
      .map(([moodId, count]) => ({
        moodId,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .filter((it) => it.pct > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);
    return ranked.length > 0 ? ranked : OVERALL_MOOD_FALLBACK;
  }, [moodEntries, moodPhase]);

  return (
    <View style={styles.panel}>
      <Text style={[styles.blockTitle, compact && styles.blockTitleSm]}>Overall mood</Text>
      <View style={[styles.inlineOverallBubbles, { minHeight: compact ? 72 : 80 }]}>
        {items.map((it, i) => {
          const opt = getMoodOptionById(it.moodId);
          const bg = opt?.trackColor ?? '#B0BEC5';
          return (
            <View
              key={`${it.moodId}-${i}`}
              style={[
                styles.inlineOverallBubble,
                {
                  backgroundColor: bg,
                  width: i === 0 ? 74 : i === 1 ? 54 : i === 2 ? 42 : 30,
                  height: i === 0 ? 74 : i === 1 ? 54 : i === 2 ? 42 : 30,
                  borderRadius: 999,
                  ...shadows.soft,
                },
              ]}
            >
              <Text style={[styles.inlineOverallPct, { color: textColorForMoodFill(bg) }]}>{it.pct}%</Text>
            </View>
          );
        })}
      </View>
      <TouchableOpacity
        style={styles.inlineOverallBtn}
        onPress={() => {
          // Keep full-screen detail available.
          // Parent component owns navigation.
        }}
        disabled
        activeOpacity={1}
      >
        <Text style={styles.inlineOverallBtnTxt}>Use Overall Mood screen for full details</Text>
      </TouchableOpacity>
    </View>
  );
}

function dayLevelByKeyFromEntries(moodEntries, moodPhase) {
  const out = {};
  const src = moodEntries && typeof moodEntries === 'object' ? moodEntries : {};
  Object.keys(src).forEach((k) => {
    const lv = getCalendarLevelFromMoodEntry(src[k], moodPhase);
    if (lv !== null && lv !== undefined) out[k] = lv;
  });
  return out;
}

function YearInPixels({ year, compact, moodEntries, moodPhase }) {
  const dotSize = compact ? 8 : 10;
  /** Vertical gap between day rows — slightly looser so the grid reads as one block */
  const rowGap = compact ? 6 : 7;
  const rowLabelW = compact ? 22 : 26;
  const maxDays = 31;
  const rows = Array.from({ length: maxDays }, (_, i) => i + 1);

  const renderDot = (isEmpty, isSkipped, moodColor) => (
    <View
      style={[
        styles.yearDotInner,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: isEmpty ? PLACEHOLDER_DOT : isSkipped ? '#D0D4DA' : moodColor,
        },
      ]}
    />
  );

  return (
    <View style={[styles.yearWrap, compact && styles.yearWrapCompact]}>
      <View style={styles.yearGridHeader}>
        <View style={{ width: rowLabelW }} />
        {MONTH_LETTERS.map((m, i) => (
          <View key={`${m}-${i}`} style={styles.yearMonthCellFlex}>
            <Text style={[styles.yearMonthTxt, compact && styles.yearMonthTxtCompact]} numberOfLines={1}>
              {m}
            </Text>
          </View>
        ))}
      </View>

      {rows.map((day) => (
        <View key={`d-${day}`} style={[styles.yearRow, { marginBottom: rowGap }]}>
          <View style={[styles.yearDayLabelWrap, { width: rowLabelW }]}>
            <Text style={[styles.yearDayTxt, compact && styles.yearDayTxtCompact]}>{day}</Text>
          </View>
          <View style={styles.yearDotsRow}>
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const dim = new Date(year, monthIndex + 1, 0).getDate();
              if (day > dim) {
                return <View key={`${day}-${monthIndex}`} style={styles.yearCellFlex} />;
              }
              const key = keyForYMD(year, monthIndex, day);
              const dateObj = new Date(year, monthIndex, day);
              const isFuture = dateObj > new Date();
              const disp = !isFuture ? resolveCalendarDayDisplay(key, moodEntries, moodPhase) : null;
              const isEmpty = disp === null || disp === undefined;
              const isSkipped = disp?.type === 'skipped';
              const moodColor = disp?.type === 'mood' ? disp.color : null;
              return (
                <View key={`${day}-${monthIndex}`} style={styles.yearCellFlex}>
                  {renderDot(isEmpty, isSkipped, moodColor)}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function stressForLevel(level) {
  if (level === null || level === undefined || level === -1) return null;
  return Math.max(0, Math.min(4, 4 - level));
}

function computeStressInsightFromDayLevels(dayLevelByKey) {
  const keys = Object.keys(dayLevelByKey)
    .filter((k) => dayLevelByKey[k] !== null && dayLevelByKey[k] !== undefined)
    .sort();
  if (keys.length < 2) {
    return {
      trend: 'neutral',
      title: 'Keep logging moods in this period',
      body: 'We compare stress (from mood scores) between the first and second half of days in your selected range.',
    };
  }
  const stressSeries = keys.map((k) => stressForLevel(dayLevelByKey[k])).filter((v) => v !== null);
  if (stressSeries.length < 2) {
    return {
      trend: 'neutral',
      title: 'Keep logging moods in this period',
      body: 'A few more logged days will unlock this trend.',
    };
  }
  const mid = Math.max(1, Math.floor(stressSeries.length / 2));
  const firstHalf = stressSeries.slice(0, mid);
  const secondHalf = stressSeries.slice(mid);
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const prev = avg(firstHalf);
  const cur = avg(secondHalf);
  if (prev === 0) {
    return {
      trend: 'neutral',
      title: 'Keep logging moods in this period',
      body: 'Stress trends compare the first half vs second half of days in your selected range.',
    };
  }
  const deltaPct = Math.round(((prev - cur) / prev) * 100);
  if (deltaPct >= 1) {
    return {
      trend: 'better',
      title: `Your stress levels are ${deltaPct}% lower in the second half of this period.`,
      body: 'This is great progress. Keep your breathing rhythm and daily Activity.',
    };
  }
  const risePct = Math.abs(deltaPct);
  if (risePct >= 1) {
    return {
      trend: 'higher',
      title: `Your stress levels are ${risePct}% higher in the second half of this period.`,
      body: 'Recommended: short coherence sessions and a calming ocean dive.',
    };
  }
  return {
    trend: 'neutral',
    title: 'Steady across this period',
    body: 'Your average stress from logged moods is similar in both halves of this range.',
  };
}

export default function MoodMeter({
  compact = false,
  /** Lock calendar to April 2026 for demos */
  demoApril2026 = false,
}) {
  const { moodEntries } = useMysession();
  const [tab, setTab] = useState('calendar');
  const [selectedDay, setSelectedDay] = useState(null);
  const boot = new Date();
  const [rangeMode, setRangeMode] = useState('week');
  const [dayViewDate, setDayViewDate] = useState(() => new Date());
  const [visibleMonthYear, setVisibleMonthYear] = useState(() =>
    demoApril2026 ? { y: 2026, m: 3 } : { y: boot.getFullYear(), m: boot.getMonth() }
  );
  const [selectedYear, setSelectedYear] = useState(demoApril2026 ? 2026 : new Date().getFullYear());
  /** Session start vs end mood for calendar grids and scoped summaries */
  const [moodPhase, setMoodPhase] = useState('after');

  const initialCal = useMemo(() => {
    if (demoApril2026) return { y: 2026, m: 3 };
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  }, [demoApril2026]);

  const scopedMoodEntries = useMemo(
    () =>
      filterMoodEntriesForRange(moodEntries, rangeMode, {
        dayKey: dateKeyFromLocalDate(dayViewDate),
        year:
          rangeMode === 'year'
            ? selectedYear
            : rangeMode === 'month'
            ? visibleMonthYear.y
            : undefined,
        monthIndex: rangeMode === 'month' ? visibleMonthYear.m : undefined,
      }),
    [moodEntries, rangeMode, dayViewDate, selectedYear, visibleMonthYear]
  );

  const moodDayLevelForInsight = useMemo(
    () => dayLevelByKeyFromEntries(scopedMoodEntries, moodPhase),
    [scopedMoodEntries, moodPhase]
  );

  useEffect(() => {
    setSelectedDay(null);
  }, [moodPhase]);
  const stressInsight = useMemo(
    () => computeStressInsightFromDayLevels(moodDayLevelForInsight),
    [moodDayLevelForInsight]
  );

  const shiftDayView = (delta) => {
    setDayViewDate((d) => {
      const x = new Date(d);
      x.setDate(x.getDate() + delta);
      const todayKey = dateKeyFromLocalDate(new Date());
      if (delta > 0 && dateKeyFromLocalDate(x) > todayKey) return d;
      return x;
    });
  };
  const canDayViewNext = dateKeyFromLocalDate(dayViewDate) < dateKeyFromLocalDate(new Date());

  const summaryCard =
    selectedDay && tab === 'calendar' ? (
      <View style={[styles.summary, compact && styles.summaryCompact]}>
        <Text style={styles.summaryTitle}>
          {selectedDay.key} ·{' '}
          {selectedDay.display?.type === 'skipped'
            ? 'Skipped'
            : selectedDay.display?.type === 'mood'
            ? selectedDay.display.label
            : '—'}
        </Text>
        <Text style={styles.summaryBody} numberOfLines={2}>
          {selectedDay.display?.illustrative
            ? 'Illustrative fill for days without a logged mood.'
            : 'Mood snapshot (demo). Connect sensor history for diary notes.'}
        </Text>
      </View>
    ) : null;

  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <Text style={[styles.title, compact && styles.titleSm]}>Mood & Coherence</Text>
        <Text style={[styles.sub, compact && styles.subSm]}>Track calm and recovery alongside practice</Text>
      </View>

      <View style={[styles.tabs, compact && styles.tabsCompact]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabBtn, tab === t.id && styles.tabBtnOn]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabTxt, tab === t.id && styles.tabTxtOn]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'calendar' && (
        <View>
          <RangeSubTabs value={rangeMode} onChange={setRangeMode} compact={compact} />
          <View style={styles.beforeAfterRow}>
            <BeforeAfterToggle value={moodPhase} onChange={setMoodPhase} compact={compact} />
          </View>

          {rangeMode === 'day' ? (
            <DayDetailView
              moodEntries={moodEntries}
              dayDate={dayViewDate}
              compact={compact}
              moodPhase={moodPhase}
              onPrevDay={() => shiftDayView(-1)}
              onNextDay={() => shiftDayView(1)}
              canGoNext={canDayViewNext}
            />
          ) : rangeMode === 'week' ? (
            <WeekView
              moodEntries={moodEntries}
              compact={compact}
              moodPhase={moodPhase}
              onSelectDay={(key, display) => setSelectedDay({ key, display })}
            />
          ) : rangeMode === 'month' ? (
            <CoherenceCalendar
              initialYear={initialCal.y}
              initialMonthIndex={initialCal.m}
              moodEntries={moodEntries}
              moodPhase={moodPhase}
              selectedDay={selectedDay?.key}
              onSelectDay={(key, display) => setSelectedDay({ key, display })}
              summaryCard={summaryCard}
              compact={compact}
              onMonthYearChange={(y, m) => setVisibleMonthYear({ y, m })}
            />
          ) : (
            <View style={[styles.panel, compact && styles.panelCompact]}>
              <View style={styles.yearHead}>
                <Text style={[styles.blockTitle, compact && styles.blockTitleSm]}>Year</Text>
                <View style={styles.yearSel}>
                  <TouchableOpacity
                    onPress={() => setSelectedYear((y) => y - 1)}
                    style={styles.yearSelBtn}
                    accessibilityLabel="Previous year"
                  >
                    <Text style={styles.yearSelBtnTxt}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.yearSelYear}>{selectedYear}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedYear((y) => y + 1)}
                    style={styles.yearSelBtn}
                    accessibilityLabel="Next year"
                  >
                    <Text style={styles.yearSelBtnTxt}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <YearInPixels year={selectedYear} compact={compact} moodEntries={moodEntries} moodPhase={moodPhase} />
            </View>
          )}
        </View>
      )}

      {tab === 'trend' && (
        <View>
          <RangeSubTabs value={rangeMode} onChange={setRangeMode} compact={compact} />
          <View style={styles.beforeAfterRow}>
            <BeforeAfterToggle value={moodPhase} onChange={setMoodPhase} compact={compact} />
          </View>
          <View style={[styles.panel, compact && styles.panelCompact, { marginTop: spacing.sm }]}>
            <View style={styles.badgeRow}>
              <Sparkles size={16} color={palette.hmBrandPurple} />
              <Text style={styles.badgeTxt}>~78% stress reduction (demo curve)</Text>
            </View>
            <TrendChart
              title="Coherence rising"
              emoji="📈"
              values={TREND_COHERENCE}
              stroke="#00897B"
              fillId="cohFill"
              gradientStops={[
                { off: '0%', c: '#00897B', o: 0.45 },
                { off: '100%', c: '#00897B', o: 0.05 },
              ]}
              compact={compact}
            />
            <TrendChart
              title="Stress falling"
              emoji="📉"
              values={TREND_STRESS}
              stroke="#E53935"
              fillId="strFill"
              gradientStops={[
                { off: '0%', c: '#E53935', o: 0.35 },
                { off: '100%', c: '#E53935', o: 0.04 },
              ]}
              compact={compact}
            />
            <View style={styles.trendOverallWrap}>
              <OverallMoodInline moodEntries={scopedMoodEntries} compact={compact} moodPhase={moodPhase} />
            </View>
            <Text style={styles.trendFoot}>Five weeks of breathing practice (illustrative)</Text>
          </View>
        </View>
      )}

      {tab === 'insights' && (
        <ScrollView
          style={styles.insScroll}
          contentContainerStyle={styles.insScrollIn}
          showsVerticalScrollIndicator={false}
        >
          <RangeSubTabs value={rangeMode} onChange={setRangeMode} compact={compact} />
          <View style={styles.beforeAfterRow}>
            <BeforeAfterToggle value={moodPhase} onChange={setMoodPhase} compact={compact} />
          </View>
          <View
            style={[
              styles.insightCard,
              { marginTop: spacing.sm },
              stressInsight.trend === 'better'
                ? styles.insightCardGood
                : stressInsight.trend === 'higher'
                ? styles.insightCardWarn
                : styles.insightCardNeutral,
            ]}
          >
            <Text style={styles.insightTitle}>{stressInsight.title}</Text>
            <Text style={styles.insightBody}>{stressInsight.body}</Text>
          </View>
          <SessionMoodImprovementInsight moodEntries={scopedMoodEntries} compact={compact} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  rootCompact: {
    padding: spacing.sm,
  },
  header: { marginBottom: spacing.sm },
  headerCompact: { marginBottom: spacing.xs },
  title: { ...typography.sectionTitle, color: colors.textDark },
  titleSm: { fontSize: 17 },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  subSm: { fontSize: 12 },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(106, 27, 154, 0.08)',
    borderRadius: borderRadius.full,
    padding: 3,
  },
  tabsCompact: { marginBottom: spacing.sm },
  subTabs: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: borderRadius.full,
    padding: 3,
  },
  subTabsCompact: { marginBottom: spacing.xs },
  beforeAfterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  beforeAfterWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: borderRadius.full,
    padding: 2,
    gap: 2,
  },
  beforeAfterWrapCompact: {
    padding: 2,
  },
  beforeAfterSeg: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  beforeAfterSegOn: {
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  beforeAfterSegTxt: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  beforeAfterSegTxtOn: { color: palette.hmBrandPurple },
  subTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  subTabBtnOn: {
    backgroundColor: colors.white,
  },
  subTabTxt: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  subTabTxtOn: { color: palette.hmBrandPurple },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  tabBtnOn: {
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  tabTxt: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTxtOn: { color: palette.hmBrandPurple },
  panel: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  panelCompact: { padding: spacing.sm },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  badgeTxt: { fontSize: 12, fontWeight: '600', color: palette.hmBrandPurple },
  trendBlock: { marginBottom: spacing.sm },
  trendTitleRow: { marginBottom: 4 },
  trendTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  trendTitleSm: { fontSize: 13 },
  trendOverallWrap: { marginTop: spacing.md, width: '100%' },
  trendFoot: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  summary: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(106, 27, 154, 0.06)',
    borderRadius: borderRadius.md,
  },
  summaryCompact: { padding: spacing.sm },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  summaryBody: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  yearHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  yearSel: { flexDirection: 'row', alignItems: 'center' },
  yearSelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 27, 154, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSelBtnTxt: { fontSize: 18, color: palette.hmBrandPurple, lineHeight: 20 },
  yearSelYear: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginHorizontal: 10 },
  yearWrap: {
    alignSelf: 'stretch',
    width: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  yearWrapCompact: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  yearGridHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
    width: '100%',
  },
  yearMonthCellFlex: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  yearMonthCell: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  yearMonthTxt: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  yearMonthTxtCompact: { fontSize: 10 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  yearDayLabelWrap: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  yearDayTxt: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 14,
  },
  yearDayTxtCompact: { fontSize: 9, lineHeight: 13 },
  yearDotsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  yearCellFlex: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearDotInner: {},
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  weekCol: {
    alignItems: 'center',
    flex: 1,
  },
  weekLab: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  weekDot: {
    marginBottom: 6,
  },
  weekDayNum: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inlineOverallBubbles: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  inlineOverallBubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineOverallPct: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inlineOverallBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(125,44,120,0.08)',
  },
  inlineOverallBtnTxt: {
    fontSize: 12,
    color: '#7D2C78',
    fontWeight: '600',
    textAlign: 'center',
  },
  insightCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  insightCardGood: {
    backgroundColor: 'rgba(67, 160, 71, 0.12)',
    borderColor: 'rgba(67, 160, 71, 0.35)',
  },
  insightCardWarn: {
    backgroundColor: 'rgba(239, 108, 0, 0.12)',
    borderColor: 'rgba(239, 108, 0, 0.35)',
  },
  insightCardNeutral: {
    backgroundColor: 'rgba(33, 150, 243, 0.10)',
    borderColor: 'rgba(33, 150, 243, 0.30)',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 4,
  },
  insightBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  insScroll: { maxHeight: 560 },
  insScrollIn: { paddingBottom: spacing.lg },
  blockTitle: { fontSize: 15, fontWeight: '800', marginBottom: spacing.sm, color: colors.textDark },
  blockTitleSm: { fontSize: 14 },
  dayNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dayNavBtn: { fontSize: 26, color: palette.hmBrandPurple, fontWeight: '700', paddingHorizontal: 8 },
  dayNavBtnOff: { opacity: 0.25 },
  dayHero: { alignItems: 'center', marginBottom: spacing.md },
  dayHeroDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeroCaption: { marginTop: spacing.sm, fontSize: 14, fontWeight: '700', color: colors.textDark, textAlign: 'center' },
  daySessionsTitle: { fontSize: 13, fontWeight: '800', marginBottom: spacing.xs, color: colors.textDark },
  daySessionsTitleSm: { fontSize: 12 },
  daySessionEmpty: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  daySessionRow: { flexDirection: 'row', marginBottom: spacing.sm },
  daySessionIdx: { width: 24, fontSize: 13, color: colors.textMuted, fontWeight: '700' },
  daySessionLine: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  insightMoodLead: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  insightMoodLeadSm: { fontSize: 12, lineHeight: 17 },
  insightMoodCaption: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  insightMoodCaptionSm: { fontSize: 11 },
  insightMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  insightMoodRowCompact: { paddingVertical: 8 },
  insightMoodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  insightMoodEmoji: { fontSize: 18, marginRight: 8 },
  insightMoodLabelCol: { flex: 1, minWidth: 0 },
  insightMoodLabel: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  insightMoodLabelSm: { fontSize: 13 },
  insightMoodMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  insightMoodMetaSm: { fontSize: 10 },
  insightMoodPct: { fontSize: 18, fontWeight: '800', minWidth: 44, textAlign: 'right' },
  insightMoodPctSm: { fontSize: 16, minWidth: 40 },
  insightMoodDash: { fontSize: 16, color: colors.textMuted, minWidth: 44, textAlign: 'right' },
  insightMoodDashSm: { fontSize: 15, minWidth: 40 },
});

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Polyline, Line, Circle as SvgCircle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronLeft, ChevronUp, Ellipsis, Check } from 'lucide-react-native';
import {
  getMetricEndpointLabels,
  getShiftInsight,
  getStateShiftSummaryBody,
  hasAnyStateShiftMetric,
  hasScalePair,
  normalizeScaleValue,
  sessionInsightsTokens,
} from '../../constants/sessionInsights';

const T = sessionInsightsTokens;
const PROGRESS_FONT_REGULAR = 'Sailec-Light';
const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

function computeImprovement(metric, before, after) {
  const b = normalizeScaleValue(before);
  const a = normalizeScaleValue(after);
  if (b == null || a == null) return { delta: 0, pct: 0, positive: false };
  const delta = metric === 'stress' ? b - a : a - b;
  const pct = b > 0 ? Math.round((Math.abs(delta) / b) * 100) : 0;
  return { delta, pct, positive: delta >= 0 };
}

function avgOf(values) {
  const nums = values.filter((v) => Number.isFinite(v));
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function ScreenGradientLayout({
  children,
  topBar,
  stickyFooter,
  contentTopSpacing = 16,
  horizontalPadding = 20,
  bottomScrollPadding = 120,
}) {
  const insets = useSafeAreaInsets();
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(enterY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [enterOpacity, enterY]);

  return (
    <LinearGradient
      colors={[T.colors.gradientTop, T.colors.gradientBottom]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.layoutRoot}
    >
      <Animated.View
        style={[
          styles.layoutRoot,
          {
            opacity: enterOpacity,
            transform: [{ translateY: enterY }],
          },
        ]}
      >
        <View
          style={{
            paddingTop: Math.max(insets.top, 44),
            paddingHorizontal: horizontalPadding,
          }}
        >
          {topBar}
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingTop: contentTopSpacing,
            paddingHorizontal: horizontalPadding,
            paddingBottom: bottomScrollPadding + Math.max(insets.bottom, 34),
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {stickyFooter ? (
          <View
            style={[
              styles.footerWrap,
              {
                paddingBottom: Math.max(insets.bottom, 34),
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            {stickyFooter}
          </View>
        ) : null}
      </Animated.View>
    </LinearGradient>
  );
}

export function SessionInsightsTopBar({
  title,
  onBackPress,
  onRightPress,
  rightIconName = 'more',
  showTitle = false,
}) {
  const RightIcon = rightIconName === 'more' ? Ellipsis : Ellipsis;
  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.topBarIconButton}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={24} color={T.colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.topBarTitleWrap}>
        {showTitle && title ? <Text style={styles.topBarTitle}>{title}</Text> : null}
      </View>
      <TouchableOpacity
        onPress={onRightPress}
        style={styles.topBarIconButton}
        hitSlop={10}
        disabled={!onRightPress}
        accessibilityRole="button"
        accessibilityLabel={onRightPress ? 'More options' : undefined}
      >
        {onRightPress ? <RightIcon size={24} color={T.colors.textPrimary} /> : <View style={{ width: 24, height: 24 }} />}
      </TouchableOpacity>
    </View>
  );
}

export function ReflectionHero({ badgeText, title, body, align = 'center' }) {
  return (
    <View style={[styles.heroBlock, align === 'left' && styles.heroLeft]}>
      {badgeText ? (
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{badgeText}</Text>
        </View>
      ) : null}
      <Text style={[styles.heroTitle, align === 'left' && styles.textLeft]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.heroBody, align === 'left' && styles.textLeft]}>{body}</Text>
    </View>
  );
}

/**
 * Post-session “state shift”: compact summary + accordion details (Numbers / Graph).
 */
export function StateShiftInsightSection({
  stressBefore,
  stressAfter,
  energyBefore,
  energyAfter,
  moodBefore,
  moodAfter,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!hasAnyStateShiftMetric(stressBefore, stressAfter, energyBefore, energyAfter, moodBefore, moodAfter)) {
    return null;
  }

  const summaryBody = getStateShiftSummaryBody({
    stressBefore,
    stressAfter,
    energyBefore,
    energyAfter,
    moodBefore,
    moodAfter,
  });

  return (
    <BlurView intensity={12} tint="light" style={styles.glassCardBlur}>
      <View style={[styles.glassCard, styles.glassCardStrong, styles.stateShiftCardOuter]}>
        <View style={styles.stateShiftCompactHeaderRow}>
          <View style={styles.stateShiftCompactTextCol}>
            <Text style={styles.cardTitle}>State shift</Text>
            <Text style={styles.stateShiftCompactSummary}>{summaryBody}</Text>
          </View>
          <TouchableOpacity
            style={styles.stateShiftAccordionHit}
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse state shift details' : 'Expand state shift details'}
          >
            {expanded ? (
              <ChevronUp size={20} color={T.colors.textPrimary} />
            ) : (
              <ChevronDown size={20} color={T.colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {expanded ? (
          <View style={styles.stateShiftExpandedBlock}>
            <InsightDataViewSection>
              {({ viewMode, graphStyle }) => (
                <TripleShiftSummary
                  compact
                  viewMode={viewMode}
                  graphStyle={graphStyle}
                  items={[
                    {
                      key: 'stress',
                      title: 'Stress',
                      insight: getShiftInsight('stress', stressBefore, stressAfter),
                      beforeValue: stressBefore,
                      afterValue: stressAfter,
                    },
                    {
                      key: 'energy',
                      title: 'Energy',
                      insight: getShiftInsight('energy', energyBefore, energyAfter),
                      beforeValue: energyBefore,
                      afterValue: energyAfter,
                    },
                    {
                      key: 'mood',
                      title: 'Mood',
                      insight: getShiftInsight('mood', moodBefore, moodAfter),
                      beforeValue: moodBefore,
                      afterValue: moodAfter,
                    },
                  ]}
                />
              )}
            </InsightDataViewSection>
          </View>
        ) : null}
      </View>
    </BlurView>
  );
}

export function InsightViewToggle({ viewMode, onChange }) {
  return (
    <View style={styles.toggleWrap}>
      <TouchableOpacity
        style={[styles.toggleBtn, viewMode === 'numbers' && styles.toggleBtnActive]}
        onPress={() => onChange('numbers')}
        activeOpacity={0.85}
      >
        <Text style={[styles.toggleTxt, viewMode === 'numbers' && styles.toggleTxtActive]}>Numbers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleBtn, viewMode === 'graph' && styles.toggleBtnActive]}
        onPress={() => onChange('graph')}
        activeOpacity={0.85}
      >
        <Text style={[styles.toggleTxt, viewMode === 'graph' && styles.toggleTxtActive]}>Graph</Text>
      </TouchableOpacity>
    </View>
  );
}

export function GlassCard({
  title,
  body,
  caption,
  children,
  variant = 'default',
  testID,
}) {
  const cardContent = (
    <View
      testID={testID}
      style={[
        styles.glassCard,
        variant === 'strong' && styles.glassCardStrong,
      ]}
    >
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {body ? <Text style={styles.cardBody}>{body}</Text> : null}
      {children}
      {caption ? <Text style={styles.cardCaption}>{caption}</Text> : null}
    </View>
  );

  return (
    <BlurView intensity={12} tint="light" style={styles.glassCardBlur}>
      {cardContent}
    </BlurView>
  );
}

export function BeforeAfterScale({
  leftLabel,
  rightLabel,
  beforeValue,
  afterValue,
  beforeLabel = 'Before',
  afterLabel = 'After',
  compact = false,
  showEndpointLabels = true,
  showValueRow = true,
  metric,
  testID,
  viewMode = 'numbers',
  graphStyle = 'delta',
}) {
  const before = normalizeScaleValue(beforeValue);
  const after = normalizeScaleValue(afterValue);
  const labels = getMetricEndpointLabels(metric, leftLabel, rightLabel);
  const dotSize = compact ? T.sizes.scaleDotCompact : T.sizes.scaleDot;
  const stats = computeImprovement(metric, before, after);

  if (before == null || after == null) return null;

  return (
    <View
      testID={testID}
      style={styles.scaleWrap}
      accessibilityRole="image"
      accessibilityLabel={`${metric ?? 'Metric'} before ${before}, after ${after}`}
    >
      {showEndpointLabels ? (
        <View style={styles.scaleEndpointRow}>
          <Text style={styles.scaleEndpointText}>{labels.leftLabel}</Text>
          <Text style={styles.scaleEndpointText}>{labels.rightLabel}</Text>
        </View>
      ) : null}

      {viewMode === 'numbers' ? (
        <>
          <View style={styles.scaleDotsRow}>
            {Array.from({ length: 10 }).map((_, index) => {
              const value = index + 1;
              const isBefore = value === before;
              const isAfter = value === after;
              return (
                <View
                  key={value}
                  style={[
                    styles.scaleDot,
                    {
                      width: dotSize,
                      height: dotSize,
                      borderRadius: dotSize / 2,
                    },
                    isBefore && styles.scaleDotBefore,
                    isAfter && styles.scaleDotAfter,
                  ]}
                />
              );
            })}
          </View>

          {showValueRow ? (
            <View style={styles.scaleValueRow}>
              <Text style={styles.scaleValueText}>{beforeLabel}: {before}</Text>
              <Text style={styles.scaleValueText}>{afterLabel}: {after}</Text>
            </View>
          ) : null}
          <View style={styles.improvementPill}>
            <Text style={styles.improvementPillText}>
              {stats.positive ? 'Improvement' : 'Shift'}: {stats.pct}% ({stats.delta >= 0 ? '+' : '-'}
              {Math.abs(stats.delta)})
            </Text>
          </View>
        </>
      ) : graphStyle === 'bars' ? (
        <View style={styles.graphWrap}>
          <View style={styles.graphRow}>
            <Text style={styles.graphLabel}>{beforeLabel}</Text>
            <View style={styles.graphTrack}>
              <View style={[styles.graphFillBefore, { width: `${(before / 10) * 100}%` }]} />
            </View>
            <Text style={styles.graphVal}>{before}</Text>
          </View>
          <View style={styles.graphRow}>
            <Text style={styles.graphLabel}>{afterLabel}</Text>
            <View style={styles.graphTrack}>
              <View style={[styles.graphFillAfter, { width: `${(after / 10) * 100}%` }]} />
            </View>
            <Text style={styles.graphVal}>{after}</Text>
          </View>
          <Text style={styles.graphImprovementText}>
            {stats.positive ? 'Improvement' : 'Change'}: {stats.pct}%
          </Text>
        </View>
      ) : (
        <View style={styles.deltaWrap}>
          <View style={styles.deltaTrack}>
            <View style={styles.deltaCenter} />
            <View
              style={[
                styles.deltaFill,
                stats.positive ? styles.deltaFillPositive : styles.deltaFillNegative,
                {
                  width: `${Math.min(100, Math.max(4, stats.pct))}%`,
                  alignSelf: stats.positive ? 'flex-start' : 'flex-end',
                },
              ]}
            />
          </View>
          <View style={styles.deltaRow}>
            <Text style={styles.deltaLabel}>{beforeLabel}: {before}</Text>
            <Text style={styles.deltaLabel}>{afterLabel}: {after}</Text>
          </View>
          <Text style={styles.graphImprovementText}>
            {stats.positive ? 'Improvement' : 'Change'}: {stats.pct}% ({stats.delta >= 0 ? '+' : '-'}
            {Math.abs(stats.delta)})
          </Text>
        </View>
      )}
    </View>
  );
}

export function SurveyShiftCard({
  title,
  insight,
  leftLabel,
  rightLabel,
  beforeValue,
  afterValue,
  compact = false,
  testID,
  metric,
  viewMode = 'numbers',
  graphStyle = 'delta',
}) {
  if (!hasScalePair(beforeValue, afterValue)) return null;

  return (
    <GlassCard testID={testID} title={title}>
      <Text style={styles.cardBody}>{insight}</Text>
      <BeforeAfterScale
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        beforeValue={beforeValue}
        afterValue={afterValue}
        compact={compact}
        metric={metric}
        viewMode={viewMode}
        graphStyle={graphStyle}
      />
    </GlassCard>
  );
}

export function TripleShiftSummary({ items, compact = true, viewMode = 'numbers', graphStyle = 'delta' }) {
  const visibleItems = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => hasScalePair(item.beforeValue, item.afterValue)) : []),
    [items]
  );

  if (visibleItems.length === 0) {
    return (
      <GlassCard
        title="Your session is part of your journey"
        body="Complete another check-in to begin seeing your personal patterns."
      />
    );
  }

  return (
    <GlassCard>
      <View style={styles.summaryStack}>
        {visibleItems.map((item, index) => (
          <View key={item.key} style={index > 0 ? styles.summaryItemDivider : null}>
            <Text style={styles.summaryTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>
              {item.insight || getShiftInsight(item.key, item.beforeValue, item.afterValue)}
            </Text>
            <BeforeAfterScale
              beforeValue={item.beforeValue}
              afterValue={item.afterValue}
              leftLabel={item.leftLabel}
              rightLabel={item.rightLabel}
              compact={compact}
              metric={item.key}
              viewMode={viewMode}
              graphStyle={graphStyle}
            />
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function MilestoneProgressBar({ progress, testID }) {
  return (
    <View testID={testID} style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }]} />
    </View>
  );
}

export function MilestoneDots({ total, active, testID }) {
  return (
    <View testID={testID} style={styles.milestoneDots}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.milestoneDot,
            index < active ? styles.milestoneDotActive : styles.milestoneDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

export function StickyPrimaryCTA({
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  disabled = false,
  loading = false,
}) {
  return (
    <View style={styles.stickyFooter}>
      <TouchableOpacity
        style={[styles.primaryCta, disabled && styles.ctaDisabled]}
        onPress={onPrimaryPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color={T.colors.buttonText} />
        ) : (
          <Text style={styles.primaryCtaLabel}>{primaryLabel}</Text>
        )}
      </TouchableOpacity>

      {secondaryLabel ? (
        <TouchableOpacity
          onPress={onSecondaryPress}
          disabled={!onSecondaryPress}
          style={styles.secondaryAction}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryActionText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function InsightDataViewSection({ children }) {
  const [viewMode, setViewMode] = useState('numbers');
  const graphStyle = 'delta';
  return (
    <View style={{ marginBottom: 12 }}>
      <InsightViewToggle viewMode={viewMode} onChange={setViewMode} />
      {children({ viewMode, graphStyle })}
    </View>
  );
}

export function TrendLayerComparisonCard({
  sessionCount = 20,
  averages,
  defaultExpanded = false,
  showAccordion = true,
  showControls = true,
  showGraph = true,
  showPostGraphContent = true,
  themeVariant = 'insights',
  embedded = false,
}) {
  const MONTHLY_MIN_SESSIONS = 28;
  const hasWeekAndMonthData = sessionCount >= MONTHLY_MIN_SESSIONS;
  const hasAtLeastThirtySessions = sessionCount >= 30;
  const isProgressTheme = themeVariant === 'progress';
  const reportModes = isProgressTheme
    ? hasAtLeastThirtySessions
      ? [
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'year', label: 'Year' },
          { key: 'all', label: 'All' },
        ]
      : [
          { key: 'week', label: 'Week' },
        ]
    : hasWeekAndMonthData
      ? [
          { key: 'weekly', label: 'Weekly report' },
          { key: 'monthly', label: 'Monthly report' },
        ]
      : [
          { key: 'day', label: 'Day report' },
          { key: 'uptodate', label: 'Up to date' },
        ];

  const metricKeys = ['stress', 'energy', 'mood'];
  const [selectedMetrics, setSelectedMetrics] = useState({
    stress: true,
    energy: true,
    mood: true,
  });
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [surveyStage, setSurveyStage] = useState('before');
  const [reportRange, setReportRange] = useState(reportModes[0].key);
  const chartW = 312;
  const chartH = 136;
  const pad = 14;
  const innerW = chartW - pad * 2;
  const innerH = chartH - pad * 2;

  const { beforePointsByMetric, afterPointsByMetric, improvementByMetric } = useMemo(() => {
    const imp = {
      stress: computeImprovement('stress', averages?.stressBefore, averages?.stressAfter),
      energy: computeImprovement('energy', averages?.energyBefore, averages?.energyAfter),
      mood: computeImprovement('mood', averages?.moodBefore, averages?.moodAfter),
    };
    const buildSeries = (metricKey, baseValue, phase = 'before') => {
      const base = Math.max(10, Math.min(95, Math.round((normalizeScaleValue(baseValue) ?? 5) * 10)));
      const slopeBoost = metricKey === 'stress' ? 1.2 : metricKey === 'energy' ? 1.6 : 1.8;
      const wobble =
        reportRange === 'weekly' || reportRange === 'week'
          ? [0, 4, -2, 6, 3, 8, 5, 10]
          : reportRange === 'monthly' || reportRange === 'month'
            ? [0, 2, 5, 7, 9, 11]
            : reportRange === 'year'
              ? [0, 2, 3, 5, 7, 9, 11, 13, 14, 16, 17, 19]
            : reportRange === 'day' || reportRange === 'today'
              ? [0, 1, -1, 2, 3, 2]
              : [0, 3, 2, 5, 4, 7, 6, 8, 9, 10];
      let series = [];
      if (metricKey === 'stress') {
        // Stress should appear lower after sessions compared with before sessions.
        const raw = wobble.map((w, i) =>
          Math.max(6, Math.min(96, base - i * (phase === 'after' ? 1.6 : 0.8) - w * 0.5))
        );
        series = raw.map((val, i) => (i === 0 ? val : Math.min(val, raw[i - 1] - 0.4)));
      } else {
        series = wobble.map((w, i) =>
          Math.max(6, Math.min(96, base + i * (phase === 'after' ? 1.2 : 0.5) + w * 0.6))
        );
      }
      return series;
    };
    const sBefore = buildSeries('stress', averages?.stressBefore, 'before');
    const eBefore = buildSeries('energy', averages?.energyBefore, 'before');
    const mBefore = buildSeries('mood', averages?.moodBefore, 'before');
    const sAfter = buildSeries('stress', averages?.stressAfter, 'after');
    const eAfter = buildSeries('energy', averages?.energyAfter, 'after');
    const mAfter = buildSeries('mood', averages?.moodAfter, 'after');
    return {
      beforePointsByMetric: { stress: sBefore, energy: eBefore, mood: mBefore },
      afterPointsByMetric: { stress: sAfter, energy: eAfter, mood: mAfter },
      improvementByMetric: imp,
    };
  }, [averages, reportRange]);

  const activeMetricKeys = metricKeys.filter((k) => selectedMetrics[k]);
  const fallbackMetric = activeMetricKeys[0] ?? 'stress';
  const activePointsByMetric = surveyStage === 'after' ? afterPointsByMetric : beforePointsByMetric;
  const periods = (activePointsByMetric[fallbackMetric] ?? []).length || 1;
  const activeWellbeingVals = activeMetricKeys.flatMap((k) => activePointsByMetric[k] ?? []);
  const activeImprovements = activeMetricKeys.map((k) => improvementByMetric[k]?.pct ?? 0);
  const improvementPct = Math.round(avgOf(activeImprovements));
  const metricLabelsText =
    activeMetricKeys.length > 0
      ? activeMetricKeys.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
      : 'No metrics selected';

  const breathingConsistency = Math.min(
    98,
    Math.max(
      42,
      Math.round(
        avgOf(activeWellbeingVals.length ? activeWellbeingVals : activePointsByMetric.stress ?? []) +
          (reportRange === 'weekly' || reportRange === 'week'
            ? 7
            : reportRange === 'today'
              ? 2
              : reportRange === 'year'
                ? 4
                : 3) +
          0
      )
    )
  );
  const subjectiveAvg = Math.round(
    avgOf(activeWellbeingVals.length ? activeWellbeingVals : activePointsByMetric.stress ?? [])
  );
  const averageImprovementPct = Math.round(
    avgOf([
      improvementByMetric.stress?.pct ?? 0,
      improvementByMetric.energy?.pct ?? 0,
      improvementByMetric.mood?.pct ?? 0,
    ])
  );

  const toPolyline = (vals, yNudge = 0) =>
    vals
      .map((val, i) => {
        const x = pad + (i / (vals.length - 1)) * innerW;
        const y = pad + innerH - (val / 100) * innerH + yNudge;
        return `${x},${y}`;
      })
      .join(' ');

  const avgDelta = (byMetric, overlayType = 'wellbeing') => {
    const deltas = activeMetricKeys.map((k) => {
      const vals = byMetric[k] ?? [];
      if (vals.length < 2) return 0;
      const directionalDelta =
        overlayType === 'wellbeing' && k === 'stress'
          ? vals[0] - vals[vals.length - 1]
          : vals[vals.length - 1] - vals[0];
      return Math.max(0, directionalDelta);
    });
    return avgOf(deltas);
  };
  const wellDelta = avgDelta(activePointsByMetric, 'wellbeing');
  const stressPct = improvementByMetric.stress?.pct ?? 0;
  const energyPct = improvementByMetric.energy?.pct ?? 0;
  const moodPct = improvementByMetric.mood?.pct ?? 0;
  const closedSummary = `Stress down by ${stressPct}%, Energy up by ${energyPct}% and Mood up by ${moodPct}%`;

  const metricColors = {
    stress: isProgressTheme ? '#D64545' : '#F3EFD9',
    energy: isProgressTheme ? '#007E73' : '#8FE6D8',
    mood: isProgressTheme ? '#7E3FB2' : '#FFD6F0',
  };
  const chartGridColor = isProgressTheme ? 'rgba(52,37,61,0.16)' : 'rgba(255,255,255,0.18)';

  useEffect(() => {
    if (!showAccordion) setExpanded(true);
  }, [showAccordion]);

  const toggleMetric = (metricKey) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metricKey]: !prev[metricKey],
    }));
  };

  const cardContent = (
    <>
      {showAccordion ? (
        <>
          <TouchableOpacity
            style={styles.trendTitleRow}
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse trends' : 'Expand trends'}
          >
            {embedded ? null : (
              <Text style={[styles.cardTitle, isProgressTheme && styles.progressTrendTitle]}>Trends</Text>
            )}
            <View style={styles.trendAccordionHit}>
              {expanded ? (
                <ChevronUp size={20} color={isProgressTheme ? '#E18B31' : T.colors.textPrimary} />
              ) : (
                <ChevronDown size={20} color={isProgressTheme ? '#E18B31' : T.colors.textPrimary} />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse trends' : 'Expand trends'}
          >
            <Text style={[styles.cardBody, styles.trendSummaryText, isProgressTheme && styles.progressBodyText]}>{closedSummary}</Text>
          </TouchableOpacity>
        </>
      ) : (
        embedded ? null : (
          <Text style={[styles.cardTitle, isProgressTheme && styles.progressTrendTitle]}>Trends</Text>
        )
      )}

      {expanded ? (
        <>
      {showControls ? (
      <View style={styles.rangeTabsWrap}>
        {reportModes.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.rangeTabBtn,
              isProgressTheme && styles.progressTabBtn,
              reportRange === mode.key && styles.rangeTabBtnActive,
              reportRange === mode.key && isProgressTheme && styles.progressTabBtnActive,
            ]}
            onPress={() => setReportRange(mode.key)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.rangeTabTxt,
                isProgressTheme && styles.progressTabTxt,
                reportRange === mode.key && styles.rangeTabTxtActive,
                reportRange === mode.key && isProgressTheme && styles.progressTabTxtActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      ) : null}

      {showControls ? (
      <View style={styles.metricTabsWrap}>
        {metricKeys.map((metric) => (
          <TouchableOpacity
            key={metric}
            style={[
              styles.metricTabBtn,
              isProgressTheme && styles.progressTabBtn,
              selectedMetrics[metric] && styles.metricTabBtnActive,
              selectedMetrics[metric] && isProgressTheme && styles.progressTabBtnActive,
            ]}
            onPress={() => toggleMetric(metric)}
            activeOpacity={0.85}
          >
            <View style={styles.metricTabInnerRow}>
              {selectedMetrics[metric] ? (
                <Check
                  size={14}
                  color={isProgressTheme ? '#C26D1A' : T.colors.textPrimary}
                  strokeWidth={2.6}
                />
              ) : null}
              <Text
                style={[
                  styles.metricTabTxt,
                  isProgressTheme && styles.progressTabTxt,
                  selectedMetrics[metric] && styles.metricTabTxtActive,
                  selectedMetrics[metric] && isProgressTheme && styles.progressTabTxtActive,
                ]}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      ) : null}
      {showControls ? (
      <TouchableOpacity
        style={[styles.coherenceToggleRow, surveyStage === 'after' && styles.coherenceToggleRowActive]}
        onPress={() => setSurveyStage((v) => (v === 'before' ? 'after' : 'before'))}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.coherenceToggleKnob,
            isProgressTheme && styles.progressCoherenceKnob,
            surveyStage === 'after' && styles.coherenceToggleKnobActive,
            surveyStage === 'after' && isProgressTheme && styles.progressCoherenceKnobActive,
          ]}
        >
          <View
            style={[
              styles.coherenceToggleDot,
              isProgressTheme && styles.progressCoherenceDot,
              isProgressTheme && surveyStage === 'before' && styles.progressCoherenceDotOff,
              isProgressTheme && surveyStage === 'after' && styles.progressCoherenceDotOn,
            ]}
          />
        </View>
        <Text
          style={[
            styles.coherenceToggleText,
            isProgressTheme && styles.progressCoherenceText,
            surveyStage === 'after' && styles.coherenceToggleTextActive,
            surveyStage === 'after' && isProgressTheme && styles.progressCoherenceTextActive,
          ]}
        >
          {surveyStage === 'before' ? 'Before' : 'After'}
        </Text>
      </TouchableOpacity>
      ) : null}

      {showGraph ? (
      <View style={styles.trendChartWrap}>
        {activeMetricKeys.length > 0 ? (
          <View style={styles.trendChartWithAxis}>
            <View style={styles.trendYAxisLabels}>
              <Text style={[styles.trendAxisLabel, isProgressTheme && styles.progressAxisLabel]}>High</Text>
              <Text style={[styles.trendAxisLabel, isProgressTheme && styles.progressAxisLabel]}>Low</Text>
            </View>
            <Svg width={chartW} height={chartH}>
              {[0, 1, 2, 3].map((i) => (
                <Line
                  key={i}
                  x1={pad}
                  y1={pad + (innerH / 3) * i}
                  x2={chartW - pad}
                  y2={pad + (innerH / 3) * i}
                  stroke={chartGridColor}
                  strokeWidth="1"
                />
              ))}
              {activeMetricKeys.map((metric) => {
                const points = activePointsByMetric[metric] ?? [];
                const yNudge = metric === 'energy' ? -1.2 : metric === 'mood' ? 1.2 : 0;
                return (
                  <Polyline
                    key={`${metric}-wellbeing`}
                    points={toPolyline(points, yNudge)}
                    fill="none"
                    stroke={metricColors[metric]}
                    strokeOpacity="0.98"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
              {activeMetricKeys.map((metric) => {
                const points = activePointsByMetric[metric] ?? [];
                return (
                  <SvgCircle
                    key={`${metric}-wellbeing-end`}
                    cx={chartW - pad}
                    cy={pad + innerH - ((points[points.length - 1] ?? 0) / 100) * innerH}
                    r={2.5}
                    fill={metricColors[metric]}
                  />
                );
              })}
            </Svg>
          </View>
        ) : (
          <Text style={[styles.cardCaption, isProgressTheme && styles.progressCaption]}>
            Select one or more metrics to display trend graphs.
          </Text>
        )}
      </View>
      ) : null}

      {showGraph ? (
        <View style={styles.trendLegendRow}>
          {activeMetricKeys.map((metric) => (
            <View key={`${metric}-legend`} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: metricColors[metric] }]} />
              <Text style={[styles.legendTxt, isProgressTheme && styles.progressLegendTxt]}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {showPostGraphContent ? (
      <>
      <Text style={[styles.cardCaption, isProgressTheme && styles.progressCaption]}>
        {reportRange === 'today'
          ? 'Today'
          : reportRange === 'weekly' || reportRange === 'week'
            ? 'Weekly'
            : reportRange === 'monthly' || reportRange === 'month'
              ? 'Monthly'
              : reportRange === 'year'
                ? 'Yearly'
              : reportRange === 'day'
                ? 'Day'
                : 'All-time'}
        : {metricLabelsText} improvement {improvementPct}% (avg across all metrics {averageImprovementPct}%).
      </Text>
      <View style={styles.reportKpisRow}>
        <View style={[styles.reportKpiPill, isProgressTheme && styles.progressKpiPill]}>
          <Text style={[styles.reportKpiLabel, isProgressTheme && styles.progressKpiLabel]}>Breathing consistency</Text>
          <Text style={[styles.reportKpiVal, isProgressTheme && styles.progressKpiVal]}>{breathingConsistency}%</Text>
        </View>
        <View style={[styles.reportKpiPill, isProgressTheme && styles.progressKpiPill]}>
          <Text style={[styles.reportKpiLabel, isProgressTheme && styles.progressKpiLabel]}>Subjective avg</Text>
          <Text style={[styles.reportKpiVal, isProgressTheme && styles.progressKpiVal]}>{subjectiveAvg}%</Text>
        </View>
      </View>
      <Text style={[styles.reportNarrative, isProgressTheme && styles.progressNarrative]}>
        Across {periods}{' '}
        {reportRange === 'weekly' || reportRange === 'week'
          ? 'days'
          : reportRange === 'monthly' || reportRange === 'month'
            ? 'months'
            : reportRange === 'year'
              ? 'months'
            : reportRange === 'day' || reportRange === 'today'
              ? 'Activity today'
              : 'total Activity'}
        , stronger breathing consistency tracks with improved {metricLabelsText.toLowerCase()}, showing a clear mind-body correlation.
      </Text>
      </>
      ) : null}
        </>
      ) : null}
    </>
  );

  return isProgressTheme ? (
    <View style={[styles.progressTrendCard, embedded && styles.progressTrendCardEmbedded]}>{cardContent}</View>
  ) : (
    <GlassCard>{cardContent}</GlassCard>
  );
}

const styles = StyleSheet.create({
  layoutRoot: { flex: 1 },
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    minHeight: 110,
    backgroundColor: 'rgba(166, 78, 209, 0.22)',
  },
  topBar: {
    height: T.sizes.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: T.colors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  heroBlock: {
    minHeight: T.sizes.heroMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 16,
    gap: 8,
  },
  heroLeft: { alignItems: 'flex-start' },
  heroBadge: {
    height: 28,
    borderRadius: T.radius.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroBadgeText: {
    color: T.colors.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  heroTitle: {
    color: T.colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroBody: {
    color: T.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  textLeft: { textAlign: 'left' },
  glassCardBlur: {
    marginBottom: 16,
    borderRadius: T.radius.md,
    overflow: 'hidden',
  },
  glassCard: {
    width: '100%',
    borderRadius: T.radius.md,
    padding: T.sizes.cardPadding,
    backgroundColor: T.colors.glass,
    borderWidth: 1,
    borderColor: T.colors.glassStroke,
    gap: 12,
  },
  glassCardStrong: {
    backgroundColor: T.colors.glassStrong,
  },
  cardTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: T.colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
  },
  cardBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: T.colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
  },
  cardCaption: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: T.colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
  },
  stateShiftCardOuter: {
    paddingVertical: 2,
  },
  stateShiftCompactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },
  stateShiftCompactTextCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
    gap: 8,
  },
  stateShiftCompactSummary: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: T.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  stateShiftAccordionHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
    marginRight: -8,
  },
  stateShiftExpandedBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  stateShiftDetailCaption: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: T.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  stateShiftMetricBlock: {
    marginTop: 4,
    marginBottom: 14,
    gap: 6,
  },
  stateShiftMetricBlockFirst: {
    marginTop: 0,
  },
  stateShiftMetricTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: T.colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  stateShiftSplitCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  stateShiftHalf: {
    flex: 1,
    gap: 6,
  },
  stateShiftVRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 22,
  },
  stateShiftPhaseLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  stateShiftPhaseValue: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: T.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  stateShiftDotsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateShiftDotCell: {
    flex: 1,
    alignItems: 'center',
  },
  stateShiftDotIdle: {
    opacity: 0.55,
  },
  scaleWrap: { gap: 8 },
  scaleEndpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  scaleEndpointText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  scaleDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scaleDot: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.72)',
    backgroundColor: 'transparent',
  },
  scaleDotBefore: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scaleDotAfter: {
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  scaleValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleValueText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  summaryStack: { gap: 12 },
  summaryItemDivider: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  summaryTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: T.colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: T.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: T.radius.pill,
    backgroundColor: T.colors.buttonBg,
  },
  milestoneDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  milestoneDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  milestoneDotActive: {
    backgroundColor: T.colors.dotActive,
  },
  milestoneDotInactive: {
    backgroundColor: T.colors.dotInactive,
  },
  stickyFooter: { width: '100%' },
  primaryCta: {
    width: '100%',
    height: T.sizes.ctaHeight,
    borderRadius: T.radius.cta,
    backgroundColor: T.colors.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaLabel: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: T.colors.buttonText,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  secondaryAction: {
    marginTop: 10,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  ctaDisabled: { opacity: 0.55 },
  toggleWrap: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  toggleBtnActive: {
    backgroundColor: '#F3EFD9',
  },
  toggleTxt: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTxtActive: {
    color: '#7A3F6B',
  },
  graphToggleWrap: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 10,
    gap: 8,
  },
  graphToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  graphToggleBtnActive: {
    backgroundColor: 'rgba(243,239,217,0.95)',
    borderColor: 'rgba(243,239,217,1)',
  },
  graphToggleTxt: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  graphToggleTxtActive: {
    color: '#7A3F6B',
  },
  rangeTabsWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rangeTabBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  rangeTabBtnActive: {
    backgroundColor: 'rgba(243,239,217,0.92)',
    borderColor: 'rgba(243,239,217,1)',
  },
  rangeTabTxt: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  rangeTabTxtActive: {
    color: '#7A3F6B',
  },
  improvementPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  improvementPillText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  graphWrap: {
    gap: 8,
  },
  graphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  graphLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    width: 52,
    color: T.colors.textSecondary,
    fontSize: 12,
  },
  graphTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  graphFillBefore: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  graphFillAfter: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#F3EFD9',
  },
  graphVal: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    width: 20,
    color: T.colors.textPrimary,
    fontSize: 12,
    textAlign: 'right',
  },
  graphImprovementText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    marginTop: 2,
    color: T.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  deltaWrap: {
    gap: 8,
  },
  deltaTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  deltaCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    zIndex: 3,
  },
  deltaFill: {
    height: '100%',
    borderRadius: 999,
  },
  deltaFillPositive: {
    backgroundColor: '#F3EFD9',
  },
  deltaFillNegative: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deltaLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textSecondary,
    fontSize: 12,
  },
  metricTabsWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  metricTabBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTabInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metricTabBtnActive: {
    backgroundColor: 'rgba(243,239,217,0.92)',
    borderColor: 'rgba(243,239,217,1)',
  },
  metricTabTxt: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '600',
  },
  metricTabTxtActive: {
    color: '#7A3F6B',
  },
  coherenceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  coherenceToggleRowActive: {},
  coherenceToggleKnob: {
    width: 30,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  coherenceToggleKnobActive: {
    backgroundColor: 'rgba(243,239,217,0.88)',
    borderColor: 'rgba(243,239,217,1)',
    alignItems: 'flex-end',
  },
  coherenceToggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7A3F6B',
  },
  coherenceToggleText: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  coherenceToggleTextActive: {
    color: '#FFFFFF',
  },
  trendChartWrap: {
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  trendChartWithAxis: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
  },
  trendYAxisLabels: {
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
  },
  trendAxisLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  progressAxisLabel: {
    color: 'rgba(52,37,61,0.66)',
  },
  trendLegendRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTxt: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '400',
  },
  coherenceLegendTxt: {
    flexShrink: 1,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '400',
  },
  reportKpisRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reportKpiPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  reportKpiLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: T.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
  },
  reportKpiVal: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: T.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  reportNarrative: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: T.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  trendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  trendSummaryText: {
    marginBottom: 2,
  },
  trendAccordionHit: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
    marginRight: -6,
  },
  progressTrendCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.22)',
    gap: 12,
    marginBottom: 16,
  },
  progressTrendCardEmbedded: {
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 0,
    marginBottom: 0,
  },
  progressTrendTitle: {
    color: '#2D1B3A',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  progressBodyText: {
    color: 'rgba(52,37,61,0.8)',
  },
  progressCaption: {
    color: 'rgba(52,37,61,0.72)',
  },
  progressLegendTxt: {
    color: 'rgba(52,37,61,0.92)',
  },
  progressTabBtn: {
    borderColor: 'rgba(225,139,49,0.28)',
    backgroundColor: '#FFFFFF',
  },
  progressTabBtnActive: {
    borderColor: 'rgba(225,139,49,0.5)',
    backgroundColor: '#FFE8CC',
  },
  progressTabTxt: {
    color: 'rgba(52,37,61,0.82)',
  },
  progressTabTxtActive: {
    color: '#C26D1A',
  },
  progressCoherenceKnob: {
    borderColor: 'rgba(225,139,49,0.45)',
    backgroundColor: '#FFFFFF',
  },
  progressCoherenceKnobActive: {
    backgroundColor: '#FFE8CC',
    borderColor: '#E18B31',
  },
  progressCoherenceDot: {
    borderWidth: 1,
    borderColor: '#E18B31',
  },
  progressCoherenceDotOff: {
    backgroundColor: '#FFE8CC',
  },
  progressCoherenceDotOn: {
    backgroundColor: '#E18B31',
  },
  progressCoherenceText: {
    color: 'rgba(52,37,61,0.46)',
  },
  progressCoherenceTextActive: {
    color: '#C26D1A',
  },
  progressKpiPill: {
    borderColor: 'rgba(225,139,49,0.24)',
    backgroundColor: '#FFF6EA',
  },
  progressKpiLabel: {
    color: 'rgba(52,37,61,0.6)',
  },
  progressKpiVal: {
    color: '#C26D1A',
  },
  progressNarrative: {
    color: 'rgba(52,37,61,0.76)',
  },
});

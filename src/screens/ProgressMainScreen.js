import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  PanResponder,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MessageCircle, Pencil, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import ProgressSnapshotBar from '../components/ProgressSnapshotBar';
import ProgressSurveyDeltaCard from '../components/ProgressSurveyDeltaCard';
import ProgressViewTabs from '../components/ProgressViewTabs';
import ProgressCheckinsCalendar from '../components/ProgressCheckinsCalendar';
import HelpInfoIcon from '../components/icons/HelpInfoIcon';
import { JourneyPhaseIcon } from '../components/icons/JourneyPhaseIcons';
import { TrendLayerComparisonCard } from '../components/sessionInsights/SessionInsightsUI';
import {
  PREVIEW_SNAPSHOT_BY_TYPE,
  PREVIEW_AVERAGES_BY_TYPE,
  PREVIEW_PRACTICE_DAYS_BY_TYPE,
} from '../constants/progressPreviewConfig';
import { useMysession } from '../context/mysessionContext';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getJourneyPhaseDetail, getEditorialQuotePoolKey } from '../utils/journeyPhase';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_REGULAR_ITALIC = 'Sailec-RegularItalic';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function getScienceTypeFromSessions(totalSessions) {
  const n = Math.max(0, Math.floor(Number(totalSessions) || 0));
  if (n >= 100) return 'pro';
  if (n >= 31) return 'still';
  if (n >= 11) return 'deep';
  if (n >= 6) return 'flow';
  if (n >= 2) return 'building';
  if (n >= 1) return 'firstTime';
  return 'zero';
}

function getSnapshotForPreviewType(type) {
  const t = normalizePreviewType(type);
  return PREVIEW_SNAPSHOT_BY_TYPE[t] || PREVIEW_SNAPSHOT_BY_TYPE.zero;
}

function getCoherenceFromSessions(totalSessions) {
  const n = Math.max(0, Number(totalSessions) || 0);
  if (n >= 100) return 4.8;
  if (n >= 31) return 3.35;
  if (n >= 11) return 3.1;
  if (n >= 6) return 2.45;
  if (n >= 1) return 1.85;
  return 0.0;
}

function normalizePreviewType(type) {
  if (type === 'growing') return 'building';
  if (type === 'foundation') return 'settle';
  if (type === 'seed') return 'flow';
  if (type === 'habit') return 'deep';
  if (type === 'deepPractice') return 'still';
  return type;
}

function getPreviewAveragesByType(type) {
  const t = normalizePreviewType(type);
  return PREVIEW_AVERAGES_BY_TYPE[t] || {
    stressBefore: 6,
    stressAfter: 5,
    energyBefore: 4,
    energyAfter: 5,
    moodBefore: 4,
    moodAfter: 5,
  };
}

function getProgressPhaseIndex(practiceDayCount) {
  const n = Math.max(0, Math.floor(Number(practiceDayCount) || 0));
  if (n >= 20) return 3;
  if (n >= 13) return 2;
  if (n >= 6) return 1;
  return 0;
}

const EDITORIAL_QUOTES = {
  early: [
    'The longest journey begins with a single breath.',
    'A journey of a thousand miles begins with a single step.',
    'No matter how long your journey appears to be, there is never more than this: one step, one breath, one moment... Now.',
  ],
  building: [
    'Great things are not done by impulse, but by a series of small things brought together.',
    'Success is the sum of small efforts, repeated day in and day out.',
    'The man who removes a mountain begins by carrying away small stones.',
  ],
  deep: [
    'You have become the calm within the storm.',
    'You have become the lighthouse that does not seek out boats but stays steady to guide them.',
    'The deeper the roots, the less the branches shake.',
  ],
  inactive: [
    'Slow progress is still progress.',
    'Be not afraid of growing slowly, be afraid only of standing still.',
    'It does not matter how slowly you go as long as you do not stop.',
  ],
};
const EDITORIAL_QUOTE_AUTHORS = {
  'The longest journey begins with a single breath.': 'Lao Tzu',
  'A journey of a thousand miles begins with a single step.': 'Lao Tzu',
  'No matter how long your journey appears to be, there is never more than this: one step, one breath, one moment... Now.': 'Eckhart Tolle',
  'Great things are not done by impulse, but by a series of small things brought together.': 'Vincent van Gogh',
  'Success is the sum of small efforts, repeated day in and day out.': 'Robert Collier',
  'The man who removes a mountain begins by carrying away small stones.': 'Confucius',
  'You have become the calm within the storm.': 'Unknown',
  'You have become the lighthouse that does not seek out boats but stays steady to guide them.': 'Unknown',
  'The deeper the roots, the less the branches shake.': 'Confucius',
  'Slow progress is still progress.': 'Unknown',
  'Be not afraid of growing slowly, be afraid only of standing still.': 'Chinese Proverb',
  'It does not matter how slowly you go as long as you do not stop.': 'Confucius',
};
const JOURNEY_NEXT_STEPS_SURVEY_SETTINGS_COPY =
  'Turn on the "Enable Survey Settings" in banner above—after that, new session\'s insights will be updated here.';

function NoteViewIcon({ size = 26, color = '#E18B31' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.9375 13C8.9375 10.7563 10.7563 8.9375 13 8.9375C15.2437 8.9375 17.0625 10.7563 17.0625 13C17.0625 15.2437 15.2437 17.0625 13 17.0625C10.7563 17.0625 8.9375 15.2437 8.9375 13ZM13 10.5625C11.6538 10.5625 10.5625 11.6538 10.5625 13C10.5625 14.3462 11.6538 15.4375 13 15.4375C14.3462 15.4375 15.4375 14.3462 15.4375 13C15.4375 11.6538 14.3462 10.5625 13 10.5625Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.68371 11.5336C4.22967 12.1878 4.0625 12.6996 4.0625 13C4.0625 13.3004 4.22967 13.8122 4.68371 14.4664C5.12262 15.0989 5.77501 15.7845 6.60039 16.418C8.25477 17.6877 10.5229 18.6875 13 18.6875C15.4771 18.6875 17.7452 17.6877 19.3996 16.418C20.225 15.7845 20.8774 15.0989 21.3163 14.4664C21.7703 13.8122 21.9375 13.3004 21.9375 13C21.9375 12.6996 21.7703 12.1878 21.3163 11.5336C20.8774 10.9011 20.225 10.2155 19.3996 9.58205C17.7452 8.31233 15.4771 7.3125 13 7.3125C10.5229 7.3125 8.25477 8.31233 6.60039 9.58205C5.77501 10.2155 5.12262 10.9011 4.68371 11.5336ZM5.61102 8.29295C7.48546 6.85434 10.0923 5.6875 13 5.6875C15.9077 5.6875 18.5145 6.85434 20.389 8.29295C21.328 9.01364 22.1035 9.81765 22.6513 10.6071C23.184 11.3747 23.5625 12.2171 23.5625 13C23.5625 13.7829 23.184 14.6253 22.6513 15.3929C22.1035 16.1824 21.328 16.9864 20.389 17.707C18.5145 19.1457 15.9077 20.3125 13 20.3125C10.0923 20.3125 7.48546 19.1457 5.61102 17.707C4.67201 16.9864 3.89654 16.1824 3.3487 15.3929C2.81599 14.6253 2.4375 13.7829 2.4375 13C2.4375 12.2171 2.81599 11.3747 3.3487 10.6071C3.89654 9.81765 4.67201 9.01364 5.61102 8.29295Z"
        fill={color}
      />
    </Svg>
  );
}

function TopBarSettingsIcon({ size = 24, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.75012 12C8.75012 10.2051 10.2052 8.75 12.0001 8.75C13.795 8.75 15.2501 10.2051 15.2501 12C15.2501 13.7949 13.795 15.25 12.0001 15.25C10.2052 15.25 8.75012 13.7949 8.75012 12Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4608 1.83851C11.7557 1.53347 12.2446 1.53347 12.5394 1.83851L15.1117 4.5H18.7501C19.1643 4.5 19.5001 4.83579 19.5001 5.25V8.8884L22.1616 11.4607C22.4667 11.7555 22.4667 12.2445 22.1616 12.5393L19.5001 15.1116V18.75C19.5001 19.1642 19.1643 19.5 18.7501 19.5H15.1117L12.5394 22.1615C12.2446 22.4665 11.7557 22.4665 11.4608 22.1615L8.88852 19.5H5.25013C4.83592 19.5 4.50013 19.1642 4.50013 18.75V15.1116L1.83864 12.5393C1.5336 12.2445 1.5336 11.7555 1.83864 11.4607L4.50013 8.88839V5.25C4.50013 4.83579 4.83592 4.5 5.25013 4.5H8.88852L11.4608 1.83851ZM12.0001 7.25C9.37677 7.25 7.25012 9.37665 7.25012 12C7.25012 14.6234 9.37677 16.75 12.0001 16.75C14.6235 16.75 16.7501 14.6234 16.7501 12C16.7501 9.37665 14.6235 7.25 12.0001 7.25Z"
        fill={color}
      />
    </Svg>
  );
}

function TopBarAddHeartIcon({ width = 26, height = 14, color = '#FFFFFF' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 26 14" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.4117 12.9781L18.3744 12.9999L18.337 12.9781C17.6048 12.547 11.7361 8.96392 11.6975 4.86151C11.6588 0.752021 16.598 -0.185209 18.3744 2.57018C20.1508 -0.185209 25.0899 0.752021 25.0513 4.86151C25.0126 8.96392 19.1439 12.547 18.4117 12.9781Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3739 6.4491H6.37955V2.43665H4.99434V6.4491H1V7.8406H4.99434V11.8531H6.37955V7.8406H10.3739V6.4491Z"
        fill={color}
      />
    </Svg>
  );
}

function TrendSpike({ width = 36, height = 84, style }) {
  const d = `M0 ${height} C${(width * 0.08).toFixed(2)} ${(height * 0.62).toFixed(2)}, ${(width * 0.24).toFixed(2)} ${(height * 0.2).toFixed(2)}, ${(width / 2).toFixed(2)} 0 C${(width * 0.76).toFixed(2)} ${(height * 0.2).toFixed(2)}, ${(width * 0.92).toFixed(2)} ${(height * 0.62).toFixed(2)}, ${width} ${height} Z`;
  return (
    <View style={[style, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="progress-trend-spike" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#6B2D8B" />
            <Stop offset="100%" stopColor="#C31F64" />
          </SvgLinearGradient>
        </Defs>
        <Path d={d} fill="url(#progress-trend-spike)" />
      </Svg>
    </View>
  );
}

function toLocalDateKey(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function runCountAnimation(fromValue, toValue, onUpdate, duration = 520) {
  const start = Number.isFinite(fromValue) ? fromValue : 0;
  const end = Number.isFinite(toValue) ? toValue : 0;
  const startedAt = Date.now();
  let rafId = null;
  const tick = () => {
    const elapsed = Date.now() - startedAt;
    const t = Math.max(0, Math.min(1, elapsed / duration));
    const eased = 1 - Math.pow(1 - t, 3);
    onUpdate(start + (end - start) * eased);
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    }
  };
  rafId = requestAnimationFrame(tick);
  return () => {
    if (rafId != null) cancelAnimationFrame(rafId);
  };
}

function makeSampleNote(id, body, now, ageMs) {
  const ts = new Date(now - ageMs).toISOString();
  return { id, body, createdAt: ts, updatedAt: ts, isSample: true };
}

function getSampleNotesForType(effectiveScienceType, now) {
  if (effectiveScienceType === 'zero') return [];
  if (effectiveScienceType === 'firstTime') {
    return [
      makeSampleNote(
        'sample-note-1',
        'I felt calmer after the session and my breathing felt steadier.',
        now,
        1000 * 60 * 90
      ),
    ];
  }

  const sampleBuildingPair = [
    makeSampleNote(
      'sample-note-1',
      'Felt less chest tightness after 5 minutes. Breath felt smoother by the end.',
      now,
      1000 * 60 * 90
    ),
    makeSampleNote(
      'sample-note-2',
      'Started distracted, finished calmer. Energy lifted from low to steady.',
      now,
      1000 * 60 * 60 * 24
    ),
  ];

  const sampleHabitExtra = [
    makeSampleNote(
      'sample-note-3',
      'Noticed less reactivity today. Recovery after stress felt faster than last week.',
      now,
      1000 * 60 * 60 * 24 * 4
    ),
    makeSampleNote(
      'sample-note-4',
      'More focused after session. I want to keep this as part of my morning routine.',
      now,
      1000 * 60 * 60 * 24 * 9
    ),
  ];

  if (
    effectiveScienceType === 'settle' ||
    effectiveScienceType === 'flow' ||
    effectiveScienceType === 'building'
  ) {
    return sampleBuildingPair;
  }

  if (effectiveScienceType === 'deep' || effectiveScienceType === 'advanced') {
    return [...sampleBuildingPair, ...sampleHabitExtra];
  }

  return [
    ...sampleBuildingPair,
    makeSampleNote(
      'sample-note-3',
      'Mood improved after session. Should repeat this before afternoon meetings.',
      now,
      1000 * 60 * 60 * 24 * 20
    ),
    makeSampleNote(
      'sample-note-4',
      'Handled a difficult conversation with less emotional overload than before.',
      now,
      1000 * 60 * 60 * 24 * 30
    ),
    makeSampleNote(
      'sample-note-5',
      'Consistent breathing practice is helping me reset faster during high-pressure days.',
      now,
      1000 * 60 * 60 * 24 * 42
    ),
  ];
}

function getTrendSessionCount(sciencePreviewType, totalSessions) {
  if (!sciencePreviewType) return totalSessions;
  return getSnapshotForPreviewType(sciencePreviewType).sessions;
}

function computeTrendAveragesFromSession(sciencePreviewType, surveyResults, totalSessions) {
  if (sciencePreviewType) {
    if (sciencePreviewType === 'inactiveSurvey') {
      return getPreviewAveragesByType('building');
    }
    return getPreviewAveragesByType(sciencePreviewType);
  }
  const list = Array.isArray(surveyResults) ? surveyResults : [];
  const averageField = (key) => {
    const nums = list.map((item) => item?.[key]).filter((v) => Number.isFinite(v));
    if (!nums.length) return null;
    return nums.reduce((sum, v) => sum + v, 0) / nums.length;
  };
  const fromResults = {
    stressBefore: averageField('stressBefore'),
    stressAfter: averageField('stressAfter'),
    energyBefore: averageField('energyBefore'),
    energyAfter: averageField('energyAfter'),
    moodBefore: averageField('moodBefore'),
    moodAfter: averageField('moodAfter'),
  };
  const hasAnySurveyMetric =
    Number.isFinite(fromResults.stressBefore) ||
    Number.isFinite(fromResults.stressAfter) ||
    Number.isFinite(fromResults.energyBefore) ||
    Number.isFinite(fromResults.energyAfter) ||
    Number.isFinite(fromResults.moodBefore) ||
    Number.isFinite(fromResults.moodAfter);
  if (hasAnySurveyMetric) return fromResults;
  return getPreviewAveragesByType(getScienceTypeFromSessions(totalSessions));
}

function countDistinctPracticeDays({ previewPracticeDays, moodEntries, surveyResults, totalSessions }) {
  if (previewPracticeDays != null) return previewPracticeDays;
  const days = new Set();

  if (moodEntries && typeof moodEntries === 'object') {
    Object.entries(moodEntries).forEach(([dateKey, dayValue]) => {
      const sessions = Array.isArray(dayValue?.sessions) ? dayValue.sessions : [];
      if (sessions.length > 0) days.add(dateKey);
    });
  }

  if (Array.isArray(surveyResults)) {
    surveyResults.forEach((entry) => {
      const key = toLocalDateKey(entry?.at);
      if (key) days.add(key);
    });
  }

  if (days.size === 0 && totalSessions > 0) {
    return 1;
  }

  return days.size;
}

const WEEKLY_TREND_COHERENCE_BOOST_BY_LEVEL = {
  pro: 0.7,
  still: 0.5,
  deep: 0.32,
  flow: 0.18,
};

const WEEKLY_TREND_BAR_SHAPE_BY_LEVEL = {
  pro: [0.9, 0.96, 0.94, 0.98, 1.0, 1.02, 1.04],
  still: [0.8, 0.86, 0.9, 0.94, 0.97, 1.0, 1.02],
  deep: [0.68, 0.74, 0.8, 0.86, 0.9, 0.94, 0.98],
  flow: [0.52, 0.58, 0.64, 0.7, 0.76, 0.84, 0.9],
};

const WEEKLY_TREND_BAR_SHAPE_DEFAULT = [0.38, 0.42, 0.48, 0.54, 0.6, 0.68, 0.76];

function computeWeeklyTrendsPreview(trendSessionCount, journeyLevelKey) {
  const sessions = Math.max(0, Math.floor(Number(trendSessionCount) || 0));
  const coherenceBoost =
    WEEKLY_TREND_COHERENCE_BOOST_BY_LEVEL[journeyLevelKey] ?? 0.05;
  const baseAvg = sessions > 0 ? getCoherenceFromSessions(sessions) : 0;
  const avgValue = Math.min(6.1, Math.max(0, baseAvg + coherenceBoost));
  const levelShape =
    WEEKLY_TREND_BAR_SHAPE_BY_LEVEL[journeyLevelKey] ?? WEEKLY_TREND_BAR_SHAPE_DEFAULT;
  const activeDays = sessions <= 0 ? 0 : Math.min(7, Math.max(1, Math.round(sessions / 2)));
  const activeStartIdx = Math.max(0, 7 - activeDays);
  const bars = levelShape.map((shape, idx) => {
    if (idx < activeStartIdx) return 0;
    const normalized = Math.max(0, Math.min(1, (avgValue * shape) / 6.1));
    return Math.max(16, Math.round(normalized * 100));
  });
  const highestValue =
    sessions <= 0 ? 0 : Math.min(6.1, avgValue * levelShape[levelShape.length - 1]);
  const spikeHeightPct = Math.max(
    30,
    Math.min(88, Math.round((Math.max(0.1, highestValue) / 12) * 100)),
  );

  return {
    highest: highestValue.toFixed(1),
    avg: avgValue.toFixed(1),
    yTicks: ['2'],
    xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    bars,
    spikeHeightPct,
  };
}

function buildSurveySettingsBannerAnimatedStyle(exitAnim, measuredBannerHeight) {
  const fadeAndSlide = {
    opacity: exitAnim,
    transform: [
      {
        translateY: exitAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-24, 0],
        }),
      },
    ],
  };
  if (measuredBannerHeight <= 0) {
    return fadeAndSlide;
  }
  return {
    ...fadeAndSlide,
    maxHeight: exitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, measuredBannerHeight],
    }),
    overflow: 'hidden',
  };
}

function filterSessionNotesByRange(notesForDisplay, notesRange) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfToday.getDate() - 29);

  return notesForDisplay.filter((note) => {
    const stamp = new Date(note.updatedAt || note.createdAt);
    if (Number.isNaN(stamp.getTime())) return false;
    if (notesRange === 'today') return stamp >= startOfToday;
    if (notesRange === 'week') return stamp >= startOfWeek;
    if (notesRange === 'month') return stamp >= startOfMonth;
    return stamp >= startOfMonth;
  });
}

function NoteSwipeRow({ children, onView, onEdit, onDelete, onOpenChange }) {
  const ACTION_WIDTH = 174;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const currentX = React.useRef(0);

  const animateTo = (toValue) => {
    currentX.current = toValue;
    onOpenChange?.(toValue !== 0);
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
      speed: 18,
    }).start();
  };

  const toggleActions = () => {
    animateTo(currentX.current === 0 ? -ACTION_WIDTH : 0);
  };

  return (
    <View style={styles.swipeRowWrap}>
      <View style={styles.swipeActions}>
        <TouchableOpacity style={[styles.swipeActionBtn, styles.swipeViewBtn]} onPress={onView} activeOpacity={0.86}>
          <NoteViewIcon size={18} color="#E18B31" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.swipeActionBtn, styles.swipeEditBtn]} onPress={onEdit} activeOpacity={0.86}>
          <Pencil size={16} color="#E18B31" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.swipeActionBtn, styles.swipeDeleteBtn]} onPress={onDelete} activeOpacity={0.86}>
          <Trash2 size={16} color="#C92262" />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.swipeContent, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity activeOpacity={1} onPress={toggleActions}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function JourneySection({
  isZeroSnapshotState,
  setIsJourneyHelpVisible,
  journeyProgressPct,
  activePhaseIdx,
  phaseNodeAnimRefs,
  activeHeartScaleAnim,
  activeNodeGlowAnim,
  showPhaseCompletionBurst,
  phaseCompletionAnim,
  journeySummaryMessage,
  showSurveyBannerNextStepsCopy,
  journeyCtaLabel,
  onPressJourneyCta,
}) {
  return (
    <>
      <View style={styles.phaseTimelineCard}>
        <View style={styles.phaseTimelineHeaderRow}>
          <View style={styles.phaseTimelineTitleWrap}>
            <Text style={styles.phaseTimelineTitle}>My Journey</Text>
            <TouchableOpacity
              style={styles.journeyHelpBtn}
              onPress={() => setIsJourneyHelpVisible(true)}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="About My Journey progress"
            >
              <HelpInfoIcon size={32} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.phaseLineWrap}>
          <View style={styles.phaseBaseLine} />
          <View style={[styles.phaseProgressLine, { width: `${Math.max(0, Math.min(100, journeyProgressPct * 100))}%` }]} />
          <View style={styles.phaseTimelineTrackRow}>
            {['Settle', 'Flow', 'Deep', 'Still'].map((label, idx) => {
              const isCompleted = idx < activePhaseIdx;
              const isActive = idx === activePhaseIdx && !isZeroSnapshotState;
              const isFuture = idx > activePhaseIdx;
              const isZeroStart = isZeroSnapshotState && idx === 0;
              return (
                <View key={label} style={styles.phaseItemWrap}>
                  <Animated.View
                    style={[
                      styles.phaseNode,
                      isCompleted && styles.phaseNodeCompleted,
                      isActive && styles.phaseNodeActive,
                      isFuture && styles.phaseNodeFuture,
                      isZeroStart && styles.phaseNodeZeroStart,
                      {
                        opacity: phaseNodeAnimRefs[idx],
                        transform: [
                          {
                            scale: isActive
                              ? Animated.multiply(activeHeartScaleAnim, phaseNodeAnimRefs[idx])
                              : phaseNodeAnimRefs[idx],
                          },
                        ],
                      },
                    ]}
                  >
                    {isActive ? (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.phaseNodeGlow,
                          {
                            opacity: activeNodeGlowAnim,
                            transform: [{ scale: activeHeartScaleAnim }],
                          },
                        ]}
                      />
                    ) : null}
                    {isActive && showPhaseCompletionBurst ? (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.phaseCompletionBurst,
                          {
                            opacity: phaseCompletionAnim.interpolate({
                              inputRange: [0, 0.2, 1],
                              outputRange: [0, 0.95, 0],
                            }),
                            transform: [
                              {
                                scale: phaseCompletionAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.7, 1.22],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        <View style={[styles.phaseCompletionDot, styles.phaseCompletionDotTop]} />
                        <View style={[styles.phaseCompletionDot, styles.phaseCompletionDotTopRight]} />
                        <View style={[styles.phaseCompletionDot, styles.phaseCompletionDotRight]} />
                        <View style={[styles.phaseCompletionDot, styles.phaseCompletionDotBottom]} />
                        <View style={[styles.phaseCompletionDot, styles.phaseCompletionDotLeft]} />
                        <View style={[styles.phaseCompletionDot, styles.phaseCompletionDotTopLeft]} />
                      </Animated.View>
                    ) : null}
                    <JourneyPhaseIcon
                      phase={label}
                      variant={
                        isCompleted ? 'completed' : isZeroStart ? 'zero' : isActive ? 'active' : 'future'
                      }
                      size={18}
                    />
                  </Animated.View>
                  <Text
                    numberOfLines={2}
                    maxFontSizeMultiplier={1.2}
                    style={[
                      styles.phaseNodeLabel,
                      Platform.OS === 'android' && styles.phaseNodeLabelAndroid,
                      isCompleted && styles.phaseNodeLabelCompleted,
                      isActive && styles.phaseNodeLabelActive,
                      isFuture && styles.phaseNodeLabelFuture,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.journeyNextStepsCard}>
        <Text style={styles.journeyNextStepsTitle}>Next Steps</Text>
        {showSurveyBannerNextStepsCopy ? (
          <View style={styles.journeySummaryRow}>
            <Text style={styles.journeySummaryText}>{JOURNEY_NEXT_STEPS_SURVEY_SETTINGS_COPY}</Text>
          </View>
        ) : (
          <View style={styles.journeySummaryRow}>
            <Text style={styles.journeySummaryText}>{journeySummaryMessage}</Text>
          </View>
        )}
        {!showSurveyBannerNextStepsCopy && journeyCtaLabel ? (
          <TouchableOpacity style={styles.journeyNextStepsCtaBtn} onPress={onPressJourneyCta} activeOpacity={0.88}>
            <Text style={styles.journeyLevelOneCtaTxt}>{journeyCtaLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}

function InsightsSection({
  isZeroSnapshotState,
  isSnapshotExpanded,
  setIsSnapshotExpanded,
  totalSessions,
  streak,
  totalMinutes,
  coherencePoints,
  sciencePreviewType,
  snapshotCount,
  shouldHideTrendsCard,
  isTrendsExpanded,
  setIsTrendsExpanded,
  trendsPreview,
  navigation,
  shouldPrioritizeInsightsCard,
  tabsSection,
  trendSessionCount,
  hasSurveyInsightsOptOutState,
  trendAverages,
}) {
  return (
    <>
      <TouchableOpacity
        style={styles.collapsibleCard}
        onPress={isZeroSnapshotState ? undefined : () => setIsSnapshotExpanded((prev) => !prev)}
        activeOpacity={isZeroSnapshotState ? 1 : 0.92}
      >
        <TouchableOpacity
          style={styles.collapsibleHeaderRow}
          onPress={isZeroSnapshotState ? undefined : () => setIsSnapshotExpanded((prev) => !prev)}
          activeOpacity={isZeroSnapshotState ? 1 : 0.84}
        >
          <Text style={styles.collapsibleHeaderTitle}>Progress Snapshot</Text>
          {!isZeroSnapshotState ? (
            isSnapshotExpanded ? (
              <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
            )
          ) : null}
        </TouchableOpacity>
        {!isZeroSnapshotState && isSnapshotExpanded ? (
          <View style={styles.snapshotExpandedWrap}>
            <ProgressSnapshotBar
              totalSessions={totalSessions}
              streak={streak}
              totalMinutes={totalMinutes}
              coherencePoints={coherencePoints}
              previewType={sciencePreviewType}
            />
          </View>
        ) : (
          <LinearGradient
            colors={['#F6A400', '#F18A1F', '#EB6A33']}
            start={{ x: 0.05, y: 0.1 }}
            end={{ x: 0.95, y: 0.95 }}
            style={styles.snapshotCompactRow}
          >
            <View style={styles.snapshotCompactItem}>
              <Text style={styles.snapshotCompactValue}>
                {isZeroSnapshotState ? '-' : snapshotCount.coherence.toFixed(1)}
              </Text>
              <Text style={styles.snapshotCompactLabel}>Coherence</Text>
            </View>
            <View style={styles.snapshotCompactDivider} />
            <View style={styles.snapshotCompactItem}>
              <Text style={styles.snapshotCompactValue}>
                {isZeroSnapshotState ? '-' : Math.round(snapshotCount.points)}
              </Text>
              <Text style={styles.snapshotCompactLabel}>Points</Text>
            </View>
            <View style={styles.snapshotCompactDivider} />
            <View style={styles.snapshotCompactItem}>
              <Text style={styles.snapshotCompactValue}>
                {isZeroSnapshotState ? '-' : `${Math.round(snapshotCount.streak)}d`}
              </Text>
              <Text style={styles.snapshotCompactLabel}>Streak</Text>
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {!shouldHideTrendsCard ? (
        <TouchableOpacity
          style={styles.trendsCard}
          onPress={() => setIsTrendsExpanded((prev) => !prev)}
          activeOpacity={0.92}
        >
          <TouchableOpacity
            style={styles.collapsibleHeaderRow}
            onPress={() => setIsTrendsExpanded((prev) => !prev)}
            activeOpacity={0.84}
          >
            <Text style={styles.trendsSectionTitle}>Weekly Trends</Text>
            {isTrendsExpanded ? (
              <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
          <View style={styles.trendsMetaRow}>
            <View style={styles.trendsMetaLeftWrap}>
              <Text style={styles.trendsMetaLeft}>Highest Day: {trendsPreview.highest}</Text>
            </View>
            <Text style={styles.trendsMetaRight}>Avg: {trendsPreview.avg}</Text>
          </View>
          {isTrendsExpanded ? (
            <>
              <View style={styles.trendsChartWrap}>
                <View style={styles.trendsGrid}>
                  {trendsPreview.yTicks.map((tick, idx) => (
                    <View key={`trend-grid-${idx}`} style={styles.trendsGridRow}>
                      <Text style={styles.trendsYTick}>{tick}</Text>
                      <View style={styles.trendsGridLine} />
                    </View>
                  ))}
                </View>
                <View style={styles.trendsSpikeTrack} />
                <TrendSpike style={styles.trendsSpikeFill} />
                <LinearGradient
                  colors={['#FCD303', '#ED8B00', '#D50056']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={[
                    styles.trendsPeakDot,
                    {
                      bottom: 98,
                    },
                  ]}
                />
                <View style={styles.trendsAvgBubble}>
                  <Text style={styles.trendsAvgBubbleTxt}>Avg: {trendsPreview.avg}</Text>
                  <LinearGradient
                    colors={['#FCD303', '#ED8B00', '#D50056']}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={styles.trendsAvgBubbleStar}
                  />
                </View>
                <View style={styles.trendsXAxisRow}>
                  {trendsPreview.xLabels.map((label, idx) => {
                    return (
                      <React.Fragment key={`trend-day-${label}`}>
                        <Text style={styles.trendsXTick}>{label}</Text>
                        {idx < trendsPreview.xLabels.length - 1 ? <Text style={styles.trendsXBullet}>●</Text> : null}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={styles.trendsCtaBtn}
                onPress={(event) => {
                  event.stopPropagation?.();
                  navigation.navigate('SessionHistory', {
                    initialView: 'graph',
                    previewType: sciencePreviewType ?? null,
                  });
                }}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="View detailed trends"
              >
                <Text style={styles.trendsCtaTxt}>Detailed Trends</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </TouchableOpacity>
      ) : null}

      {shouldPrioritizeInsightsCard ? tabsSection : null}
      {trendSessionCount > 1 && !hasSurveyInsightsOptOutState ? (
        <ProgressSurveyDeltaCard averages={trendAverages} />
      ) : null}
      {!shouldPrioritizeInsightsCard ? tabsSection : null}
    </>
  );
}

function NotesSection({
  isCommunityExpanded,
  setIsCommunityExpanded,
  setIsCommunityHelpVisible,
  isZeroSnapshotState,
  communityCount,
  quoteEntryAnim,
  editorialQuoteAuthor,
  editorialQuote,
  navigation,
  sciencePreviewType,
}) {
  return (
    <>
      <TouchableOpacity
        style={styles.communityCardFrame}
        onPress={() => setIsCommunityExpanded((prev) => !prev)}
        activeOpacity={0.92}
      >
        <View
          style={styles.communityHeaderRow}
        >
          <View style={styles.communityTitleWrap}>
            <Text style={styles.communityTitle}>Community Coherence Points</Text>
            <TouchableOpacity
              style={styles.communityHelpBtn}
              onPress={(event) => {
                event.stopPropagation?.();
                setIsCommunityHelpVisible(true);
              }}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="How community points are calculated"
            >
              <HelpInfoIcon size={32} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.communityToggleBtn}
            onPress={() => setIsCommunityExpanded((prev) => !prev)}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel={isCommunityExpanded ? 'Collapse community card' : 'Expand community card'}
          >
            {isCommunityExpanded ? (
              <ChevronUp size={14} color="#E18B31" strokeWidth={2.6} />
            ) : (
              <ChevronDown size={14} color="#E18B31" strokeWidth={2.6} />
            )}
          </TouchableOpacity>
        </View>
          {isCommunityExpanded ? (
            <LinearGradient
              colors={['#F6A400', '#F18A1F', '#EB6A33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.communityStatsRect}
            >
              {!isZeroSnapshotState ? (
                <Text style={styles.communityToday}>Today, you have contributed</Text>
              ) : null}
              {!isZeroSnapshotState ? (
                <Text style={styles.communityBig}>{communityCount.today} Points</Text>
              ) : null}
              {!isZeroSnapshotState ? <View style={styles.commRule} /> : null}
              <Text style={styles.communitySub}>Our community has reached</Text>
              <Text style={styles.communityBig}>{`${(communityCount.total / 1000000).toFixed(1)}M`} Points</Text>
            </LinearGradient>
          ) : null}
      </TouchableOpacity>

      <Animated.View
        style={{
          opacity: quoteEntryAnim,
          transform: [{ scale: quoteEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }],
        }}
      >
        <View style={styles.editorialQuoteCardWrap}>
          <LinearGradient
            colors={['#FFFDF9', '#FFF3E6', '#FFE8D4', '#FFD9BC']}
            locations={[0, 0.32, 0.72, 1]}
            start={{ x: 0.06, y: 0 }}
            end={{ x: 0.94, y: 1 }}
            style={styles.editorialQuoteGradient}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.18)', 'rgba(255,246,235,0)']}
              locations={[0, 0.22, 1]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 0.55 }}
              style={styles.editorialQuoteGloss}
              pointerEvents="none"
            />
            <Text style={styles.editorialQuoteBlock}>
              <Text style={styles.editorialQuoteText}>"{editorialQuote}"</Text>
              <Text style={styles.editorialQuoteSource}>{`  ${editorialQuoteAuthor}`}</Text>
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>
      {!isZeroSnapshotState ? (
        <TouchableOpacity
          style={styles.sessionHistoryBtn}
          activeOpacity={0.88}
          onPress={() => {
            try {
              navigation.navigate('SessionHistory', { previewType: sciencePreviewType ?? null });
            } catch {
              Alert.alert('Coming soon', 'Session history will be available here soon.');
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="View History"
        >
          <Text style={styles.sessionHistoryBtnTxt}>View History</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );
}

export default function ProgressMainScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const helpSheetMaxHeight = Math.round(windowHeight * 0.91);
  const helpSheetChromePx =
    50 + 30 + 22 + 12 + 48;
  const helpSheetBottomPadding = Math.max(insets.bottom, 16) + 18;
  const helpScrollMaxHeight = Math.max(
    120,
    helpSheetMaxHeight - helpSheetChromePx - helpSheetBottomPadding,
  );
  const navigation = useNavigation();
  const route = useRoute();
  const {
    streak,
    totalSessions,
    totalMinutes,
    coherencePoints,
    moodEntries,
    surveyResults,
    sessionNotes,
    updateSessionNote,
    deleteSessionNote,
  } = useMysession();
  const [sciencePreviewType, setSciencePreviewType] = useState(() =>
    normalizePreviewType(route?.params?.previewType ?? null)
  );
  const [activeProgressTab, setActiveProgressTab] = useState('trend');
  const [notesRange, setNotesRange] = useState('today');
  const [editingNote, setEditingNote] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [progressOptInChoice, setProgressOptInChoice] = useState('yes');
  const [inactiveSurveyOptInChoice, setInactiveSurveyOptInChoice] = useState('no');
  const [hasOpenNoteSwipeActions, setHasOpenNoteSwipeActions] = useState(false);
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(false);
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const [isTrendsExpanded, setIsTrendsExpanded] = useState(true);
  const [isJourneyHelpVisible, setIsJourneyHelpVisible] = useState(false);
  const [isCommunityHelpVisible, setIsCommunityHelpVisible] = useState(false);
  const [isSessionInsightsExpanded, setIsSessionInsightsExpanded] = useState(true);
  const [surveyPreferenceUpdatedVisible, setSurveyPreferenceUpdatedVisible] = useState(false);
  const [surveySettingsDismissed, setSurveySettingsDismissed] = useState(false);
  const [surveySettingsCardHeight, setSurveySettingsCardHeight] = useState(0);
  const surveyPreferenceFadeAnim = useRef(new Animated.Value(0)).current;
  const surveySettingsExitAnim = useRef(new Animated.Value(1)).current;
  const showSurveySettingsCardRef = useRef(false);
  const surveySettingsExitDelayTimerRef = useRef(null);
  const quoteEntryAnim = useRef(new Animated.Value(0)).current;
  const activeHeartScaleAnim = useRef(new Animated.Value(1)).current;
  const activeNodeGlowAnim = useRef(new Animated.Value(0.42)).current;
  const phaseCompletionAnim = useRef(new Animated.Value(0)).current;
  const [showPhaseCompletionBurst, setShowPhaseCompletionBurst] = useState(false);
  const lastCompletedStageRef = useRef(null);
  const phaseNodeAnimRefs = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;
  const progressScrollRef = useRef(null);
  const currentScrollYRef = useRef(0);
  const [journeyProgressPct, setJourneyProgressPct] = useState(0);
  const [snapshotCount, setSnapshotCount] = useState({ coherence: 0, points: 0, streak: 0 });
  const [communityCount, setCommunityCount] = useState({ today: 0, total: 0 });
  const isInactiveSurveyPreview = sciencePreviewType === 'inactiveSurvey';
  const isPartialSurveyOptOutPreview = sciencePreviewType === 'partialSurveyOptOut';
  const progressTabOrder = React.useMemo(() => ['trend', 'checkins', 'insights'], []);

  const trendSessionCount = React.useMemo(
    () => getTrendSessionCount(sciencePreviewType, totalSessions),
    [sciencePreviewType, totalSessions],
  );

  useEffect(() => {
    const nextPreviewType = normalizePreviewType(route?.params?.previewType ?? null);
    setSciencePreviewType(nextPreviewType);
  }, [route?.params?.previewType]);

  useEffect(() => {
    if (surveySettingsExitDelayTimerRef.current) {
      clearTimeout(surveySettingsExitDelayTimerRef.current);
      surveySettingsExitDelayTimerRef.current = null;
    }
    surveySettingsExitAnim.stopAnimation();
    surveySettingsExitAnim.setValue(1);
    surveyPreferenceFadeAnim.stopAnimation();
    surveyPreferenceFadeAnim.setValue(0);
    setSurveyPreferenceUpdatedVisible(false);
    setSurveySettingsDismissed(false);
    setSurveySettingsCardHeight(0);
  }, [sciencePreviewType, surveyPreferenceFadeAnim, surveySettingsExitAnim]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeProgressTab]);
  useEffect(() => {
    setActiveProgressTab('trend');
  }, [sciencePreviewType, trendSessionCount]);

  const tabsSwipeResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 16 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 36) return;
          const currentIdx = progressTabOrder.indexOf(activeProgressTab);
          if (currentIdx < 0) return;
          if (gesture.dx < 0 && currentIdx < progressTabOrder.length - 1) {
            setActiveProgressTab(progressTabOrder[currentIdx + 1]);
            return;
          }
          if (gesture.dx > 0 && currentIdx > 0) {
            setActiveProgressTab(progressTabOrder[currentIdx - 1]);
          }
        },
      }),
    [activeProgressTab, progressTabOrder]
  );
  const notesToCheckinsSwipeResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          activeProgressTab === 'insights' &&
          !hasOpenNoteSwipeActions &&
          gesture.dx > 16 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderRelease: (_, gesture) => {
          if (activeProgressTab === 'insights' && !hasOpenNoteSwipeActions && gesture.dx > 36) {
            setActiveProgressTab('checkins');
          }
        },
      }),
    [activeProgressTab, hasOpenNoteSwipeActions]
  );
  useEffect(() => {
    if (activeProgressTab !== 'insights') setHasOpenNoteSwipeActions(false);
  }, [activeProgressTab]);

  const trendAverages = React.useMemo(
    () => computeTrendAveragesFromSession(sciencePreviewType, surveyResults, totalSessions),
    [sciencePreviewType, surveyResults, totalSessions],
  );

  const previewPracticeDays = React.useMemo(() => {
    const t = normalizePreviewType(sciencePreviewType);
    if (!t) return null;
    return PREVIEW_PRACTICE_DAYS_BY_TYPE[t] ?? null;
  }, [sciencePreviewType]);
  const uniquePracticeDays = React.useMemo(
    () =>
      countDistinctPracticeDays({
        previewPracticeDays,
        moodEntries,
        surveyResults,
        totalSessions,
      }),
    [previewPracticeDays, moodEntries, surveyResults, totalSessions],
  );
  const hasAtLeastThirtySessions = trendSessionCount >= 30;
  const activePhaseIdx = getProgressPhaseIndex(uniquePracticeDays);
  const journeyPhaseDetail = React.useMemo(() => getJourneyPhaseDetail(uniquePracticeDays), [uniquePracticeDays]);
  const journeySummaryMessage = React.useMemo(() => {
    const d = journeyPhaseDetail;
    if (d.levelKey === 'settle') {
      if (d.phaseState === 'start') {
        return 'Small moments of calm begin to shift the nervous system out of stress mode.';
      }
      if (d.phaseState === 'end') {
        return 'Great work. You have completed Settle with consistent practice across unique days.';
      }
      return 'Each session helps your body remember safety, balance, and recovery.';
    }
    if (d.levelKey === 'flow') {
      if (d.phaseState === 'start') {
        return 'Your practice is helping create more coherent heart rhythm patterns.';
      }
      if (d.phaseState === 'end') {
        return "Great work. You've completed Flow! Keep going to unlock Deep.";
      }
      return 'Consistency supports emotional balance, resilience, and clearer thinking.';
    }
    if (d.levelKey === 'deep') {
      if (d.phaseState === 'start') {
        return 'Positive emotions can strengthen physiological coherence over time.';
      }
      if (d.phaseState === 'end') {
        return "Excellent progress. You've completed Deep! Keep going to step into Still.";
      }
      return 'Every session reinforces calm, flexibility, and inner steadiness.';
    }
    if (d.levelKey === 'still') {
      if (d.phaseState === 'start') {
        return 'Your system is learning to access calm naturally and consistently.';
      }
      return 'Long-term coherence practice supports emotional stability and wellbeing.';
    }
    return 'Long-term coherence practice supports emotional stability and wellbeing.';
  }, [journeyPhaseDetail]);
  const journeyCtaLabel = React.useMemo(() => {
    const d = journeyPhaseDetail;
    if (d.levelKey === 'settle' || d.levelKey === 'flow' || d.levelKey === 'deep') {
      return d.phaseState === 'end' ? 'Set Reminder' : 'Start Session';
    }
    if (d.levelKey === 'still') {
      return d.phaseState === 'start' ? 'Start Session' : 'Set Reminder';
    }
    return null;
  }, [journeyPhaseDetail]);
  const journeyHelpStageCopy = React.useMemo(() => {
    if (journeyPhaseDetail.levelKey === 'still') {
      return 'You have reached Still stage now. Here, presence becomes more natural. What started as a practice begins to feel like a way of being.';
    }
    if (journeyPhaseDetail.levelKey === 'deep') {
      return 'You have reached Deep stage now. At this stage, the patterns you’re building begin to stick, supporting more stable focus and emotional balance.';
    }
    if (journeyPhaseDetail.levelKey === 'flow') {
      return 'You have reached Flow stage now. With repetition, your system starts to find a rhythm—making it easier to shift into a calm, coherent state.';
    }
    return 'You have reached Settle stage now. This is where your nervous system begins to learn what it feels like to slow down and come into balance.';
  }, [journeyPhaseDetail.levelKey]);
  const onPressJourneyCta = () => {
    if (journeyCtaLabel === 'Set Reminder') {
      Alert.alert('Reminder setup', 'Reminder setup will be available here soon.');
    }
  };
  const surveyResultsCount = Array.isArray(surveyResults) ? surveyResults.length : 0;
  const hasIncompleteOrInactiveSurveyData =
    isInactiveSurveyPreview || (!sciencePreviewType && totalSessions > 0 && surveyResultsCount === 0);
  const hasPartialSurveyOptOutData =
    isPartialSurveyOptOutPreview ||
    (!sciencePreviewType && totalSessions > 0 && surveyResultsCount > 0 && surveyResultsCount < totalSessions);
  const hasSurveyInsightsOptOutState = hasIncompleteOrInactiveSurveyData || hasPartialSurveyOptOutData;
  const showSurveySettingsCard =
    (hasIncompleteOrInactiveSurveyData || hasPartialSurveyOptOutData) && !surveySettingsDismissed;

  const showInactiveSurveyNextStepsCopy =
    hasIncompleteOrInactiveSurveyData && inactiveSurveyOptInChoice !== 'yes';
  const showPartialSurveyNextStepsCopy =
    hasPartialSurveyOptOutData && progressOptInChoice !== 'yes';
  const showSurveyBannerNextStepsCopy =
    showInactiveSurveyNextStepsCopy || showPartialSurveyNextStepsCopy;

  useEffect(() => {
    showSurveySettingsCardRef.current = showSurveySettingsCard;
  }, [showSurveySettingsCard]);

  const onSurveySettingsBannerLayout = React.useCallback((e) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    if (h > 0) {
      setSurveySettingsCardHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
    }
  }, []);

  const surveySettingsBannerAnimatedStyle = React.useMemo(
    () => buildSurveySettingsBannerAnimatedStyle(surveySettingsExitAnim, surveySettingsCardHeight),
    [surveySettingsExitAnim, surveySettingsCardHeight],
  );

  const shouldHideTrendsCard =
    !hasSurveyInsightsOptOutState &&
    Math.max(0, Math.floor(Number(trendSessionCount) || 0)) < 5;
  const isSurveyFullyPaused = hasIncompleteOrInactiveSurveyData;
  const isSurveyHistoricalOnly = hasPartialSurveyOptOutData;
  const sessionInsightsStateBadgeText = isSurveyFullyPaused
    ? 'Fully paused'
    : isSurveyHistoricalOnly
      ? 'Historical only'
      : 'Live insights';
  const sessionInsightsPanelTitle = isSurveyFullyPaused
    ? 'Survey insights are fully paused'
    : 'Historical insights only';
  const sessionInsightsPanelBody = isSurveyFullyPaused
    ? 'Trends and Notes are unavailable until surveys are turned on.'
    : 'Earlier survey entries remain visible. New Trends and Notes are paused until surveys are turned on.';
  const shouldFullyLockInsights = hasIncompleteOrInactiveSurveyData;
  const cancelSurveyPreferenceSavedSequence = React.useCallback(() => {
    if (surveySettingsExitDelayTimerRef.current) {
      clearTimeout(surveySettingsExitDelayTimerRef.current);
      surveySettingsExitDelayTimerRef.current = null;
    }
    surveySettingsExitAnim.stopAnimation();
    surveySettingsExitAnim.setValue(1);
    surveyPreferenceFadeAnim.stopAnimation();
    surveyPreferenceFadeAnim.setValue(0);
    setSurveyPreferenceUpdatedVisible(false);
  }, [surveyPreferenceFadeAnim, surveySettingsExitAnim]);

  const finishSurveySettingsHide = React.useCallback(() => {
    setSurveySettingsDismissed(true);
    surveySettingsExitAnim.setValue(1);
    setSurveyPreferenceUpdatedVisible(false);
    surveyPreferenceFadeAnim.setValue(0);
  }, [surveyPreferenceFadeAnim, surveySettingsExitAnim]);

  const runSurveySettingsExitAnimation = React.useCallback(() => {
    surveyPreferenceFadeAnim.stopAnimation();
    surveySettingsExitAnim.stopAnimation();
    Animated.timing(surveySettingsExitAnim, {
      toValue: 0,
      duration: Platform.OS === 'android' ? 420 : 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        finishSurveySettingsHide();
      }
    });
  }, [finishSurveySettingsHide, surveyPreferenceFadeAnim, surveySettingsExitAnim]);

  const onDismissSurveySettingsBanner = React.useCallback(() => {
    if (surveySettingsExitDelayTimerRef.current) {
      clearTimeout(surveySettingsExitDelayTimerRef.current);
      surveySettingsExitDelayTimerRef.current = null;
    }
    runSurveySettingsExitAnimation();
  }, [runSurveySettingsExitAnimation]);

  const beginSurveyPreferenceSavedSequence = React.useCallback(() => {
    cancelSurveyPreferenceSavedSequence();
    setSurveyPreferenceUpdatedVisible(true);
    surveyPreferenceFadeAnim.setValue(0);
    Animated.timing(surveyPreferenceFadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    surveySettingsExitDelayTimerRef.current = setTimeout(() => {
      surveySettingsExitDelayTimerRef.current = null;
      if (showSurveySettingsCardRef.current) {
        runSurveySettingsExitAnimation();
        return;
      }
      Animated.timing(surveyPreferenceFadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setSurveyPreferenceUpdatedVisible(false);
        }
      });
    }, 3000);
  }, [
    cancelSurveyPreferenceSavedSequence,
    runSurveySettingsExitAnimation,
    surveyPreferenceFadeAnim,
  ]);
  const onPressCommunityHelpReadMore = React.useCallback(async () => {
    const url = 'https://www.heartmath.com/';
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Unable to open link', 'This device cannot open the requested link.');
        return;
      }
      await Linking.openURL(url);
    } catch (_err) {
      Alert.alert('Unable to open link', 'Please try again later.');
    }
  }, []);
  useEffect(
    () => () => {
      cancelSurveyPreferenceSavedSequence();
    },
    [cancelSurveyPreferenceSavedSequence]
  );
  useEffect(() => {
    if (shouldFullyLockInsights && activeProgressTab !== 'checkins') {
      setActiveProgressTab('checkins');
    }
  }, [shouldFullyLockInsights, activeProgressTab]);
  const editorialQuotePoolKey = getEditorialQuotePoolKey(journeyPhaseDetail, hasSurveyInsightsOptOutState);
  const editorialQuotePool = EDITORIAL_QUOTES[editorialQuotePoolKey];
  const editorialQuote = editorialQuotePool[Math.max(0, trendSessionCount) % editorialQuotePool.length];
  const editorialQuoteAuthor = EDITORIAL_QUOTE_AUTHORS[editorialQuote] || 'Unknown';

  const effectiveScienceType = sciencePreviewType || getScienceTypeFromSessions(totalSessions);
  const hasNoProgressData = totalSessions <= 0;
  const shouldShowEmptyState = hasNoProgressData && !sciencePreviewType;
  const renderSurveyPreferenceToggle = (enabled, onToggle) => (
    <View>
      <TouchableOpacity
        style={styles.tabsLockedToggleSwitchRow}
        onPress={onToggle}
        activeOpacity={0.88}
      >
        <View
          style={[
            styles.tabsLockedToggleSwitchKnob,
            enabled && styles.tabsLockedToggleSwitchKnobActive,
          ]}
        >
          <View
            style={[
              styles.tabsLockedToggleSwitchDot,
              enabled && styles.tabsLockedToggleSwitchDotActive,
            ]}
          />
        </View>
        <Text
          style={[
            styles.tabsLockedToggleSwitchText,
            enabled && styles.tabsLockedToggleSwitchTextActive,
          ]}
        >
          Enable Survey Settings
        </Text>
      </TouchableOpacity>
      <Text style={styles.toggleMicrocopy}>
        Update your survey preferences for daily feedback. Change at any time in settings.
      </Text>
      {surveyPreferenceUpdatedVisible ? (
        <Animated.Text style={[styles.toggleConfirmationText, { opacity: surveyPreferenceFadeAnim }]}>
          Your survey preference saved
        </Animated.Text>
      ) : null}
    </View>
  );
  const renderInactiveSurveyToggle = () =>
    renderSurveyPreferenceToggle(inactiveSurveyOptInChoice === 'yes', () => {
      const nextChoice = inactiveSurveyOptInChoice === 'yes' ? 'no' : 'yes';
      setInactiveSurveyOptInChoice(nextChoice);
      if (nextChoice === 'yes') {
        beginSurveyPreferenceSavedSequence();
      } else {
        cancelSurveyPreferenceSavedSequence();
        setSurveySettingsDismissed(false);
      }
    });
  const renderPartialSurveyToggle = () =>
    renderSurveyPreferenceToggle(progressOptInChoice === 'yes', () => {
      const nextChoice = progressOptInChoice === 'yes' ? 'no' : 'yes';
      setProgressOptInChoice(nextChoice);
      if (nextChoice === 'yes') {
        beginSurveyPreferenceSavedSequence();
      } else {
        cancelSurveyPreferenceSavedSequence();
        setSurveySettingsDismissed(false);
      }
    });
  const notesList = React.useMemo(
    () => (Array.isArray(sessionNotes) ? sessionNotes : []),
    [sessionNotes]
  );
  const notesForDisplay = React.useMemo(() => {
    if (notesList.length > 0) return notesList;
    if (shouldShowEmptyState) return [];
    const now = Date.now();
    return getSampleNotesForType(effectiveScienceType, now);
  }, [effectiveScienceType, notesList, shouldShowEmptyState]);
  const filteredNotes = React.useMemo(
    () => filterSessionNotesByRange(notesForDisplay, notesRange),
    [notesForDisplay, notesRange],
  );

  useEffect(() => {
    if (!hasAtLeastThirtySessions && notesRange === 'month') {
      setNotesRange('week');
    }
  }, [hasAtLeastThirtySessions, notesRange]);

  const saveEdit = () => {
    if (!editingNote?.id) return;
    const ok = updateSessionNote(editingNote.id, editDraft);
    if (!ok) return;
    setEditingNote(null);
    setEditDraft('');
  };

  const shouldPrioritizeInsightsCard =
    hasAtLeastThirtySessions &&
    trendSessionCount > 0 &&
    !shouldFullyLockInsights &&
    !hasSurveyInsightsOptOutState;
  const snapshotCompact = React.useMemo(() => {
    if (sciencePreviewType) {
      const preview = getSnapshotForPreviewType(sciencePreviewType);
      const isZero = normalizePreviewType(sciencePreviewType) === 'zero';
      return {
        coherence: isZero ? '-' : preview.coherence.toFixed(1),
        points: isZero ? '-' : preview.points,
        streak: isZero ? '-' : `${preview.streak}d`,
      };
    }
    const isZero = totalSessions <= 0;
    return {
      coherence: isZero ? '-' : getCoherenceFromSessions(totalSessions).toFixed(1),
      points: isZero ? '-' : Math.max(0, Math.round(Number(coherencePoints) || 0)),
      streak: isZero ? '-' : `${Math.max(0, Math.round(Number(streak) || 0))}d`,
    };
  }, [sciencePreviewType, totalSessions, coherencePoints, streak]);
  const trendsPreview = React.useMemo(
    () => computeWeeklyTrendsPreview(trendSessionCount, journeyPhaseDetail.levelKey),
    [trendSessionCount, journeyPhaseDetail.levelKey],
  );
  const isZeroSnapshotState =
    normalizePreviewType(sciencePreviewType) === 'zero' || (!sciencePreviewType && totalSessions <= 0);
  useEffect(() => {
    quoteEntryAnim.setValue(0);
    Animated.timing(quoteEntryAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [quoteEntryAnim]);
  useEffect(() => {
    activeHeartScaleAnim.setValue(0.9);
    Animated.spring(activeHeartScaleAnim, {
      toValue: 1,
      speed: 18,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
    phaseNodeAnimRefs.forEach((anim, idx) => {
      anim.setValue(idx <= activePhaseIdx ? 0.82 : 1);
    });
    Animated.stagger(
      70,
      phaseNodeAnimRefs.map((anim, idx) =>
        Animated.timing(anim, {
          toValue: idx <= activePhaseIdx ? 1 : 1,
          duration: 220,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [activePhaseIdx, activeHeartScaleAnim, phaseNodeAnimRefs]);
  useEffect(() => {
    const targetByIdx = [0.125, 0.42, 0.715, 1];
    if (isZeroSnapshotState) {
      setJourneyProgressPct(0);
      return undefined;
    }
    setJourneyProgressPct(0);
    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setJourneyProgressPct(targetByIdx[activePhaseIdx] ?? 0);
    }, 40);
    return () => clearTimeout(timer);
  }, [activePhaseIdx, isZeroSnapshotState]);
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(activeNodeGlowAnim, {
          toValue: 0.74,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(activeNodeGlowAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [activeNodeGlowAnim]);
  useEffect(() => {
    if (isZeroSnapshotState) {
      setShowPhaseCompletionBurst(false);
      return;
    }
    const isCompletedStage =
      (journeyPhaseDetail.levelKey === 'settle' ||
        journeyPhaseDetail.levelKey === 'flow' ||
        journeyPhaseDetail.levelKey === 'deep') &&
      journeyPhaseDetail.phaseState === 'end';
    if (!isCompletedStage) return;

    const completedKey = `${journeyPhaseDetail.levelKey}-end`;
    if (lastCompletedStageRef.current === completedKey) return;
    lastCompletedStageRef.current = completedKey;

    setShowPhaseCompletionBurst(true);
    phaseCompletionAnim.setValue(0);
    Animated.timing(phaseCompletionAnim, {
      toValue: 1,
      duration: 820,
      useNativeDriver: true,
    }).start(() => {
      setShowPhaseCompletionBurst(false);
    });
  }, [journeyPhaseDetail.levelKey, journeyPhaseDetail.phaseState, phaseCompletionAnim, isZeroSnapshotState]);
  useEffect(() => {
    if (isZeroSnapshotState) {
      setSnapshotCount({ coherence: 0, points: 0, streak: 0 });
      return undefined;
    }
    const nextCoherence = Number.parseFloat(String(snapshotCompact.coherence)) || 0;
    const nextPoints = Number.parseInt(String(snapshotCompact.points), 10) || 0;
    const nextStreak = Number.parseInt(String(snapshotCompact.streak), 10) || 0;
    setSnapshotCount({ coherence: 0, points: 0, streak: 0 });
    const cleanups = [
      runCountAnimation(0, nextCoherence, (v) =>
        setSnapshotCount((prev) => ({ ...prev, coherence: v }))
      ),
      runCountAnimation(0, nextPoints, (v) =>
        setSnapshotCount((prev) => ({ ...prev, points: v }))
      ),
      runCountAnimation(0, nextStreak, (v) =>
        setSnapshotCount((prev) => ({ ...prev, streak: v }))
      ),
    ];
    return () => {
      cleanups.forEach((fn) => fn?.());
    };
  }, [isZeroSnapshotState, snapshotCompact]);
  useEffect(() => {
    const cleanToday = runCountAnimation(0, 120, (v) =>
      setCommunityCount((prev) => ({ ...prev, today: Math.round(v) }))
    );
    const cleanTotal = runCountAnimation(0, 3400000, (v) =>
      setCommunityCount((prev) => ({ ...prev, total: Math.round(v) }))
    );
    return () => {
      cleanToday?.();
      cleanTotal?.();
    };
  }, []);
  const disabledTabs = shouldFullyLockInsights ? ['trend', 'insights'] : [];
  const handleDisabledInsightsTabPress = (tabKey) => {
    const tabLabel = tabKey === 'trend' ? 'Trends' : tabKey === 'insights' ? 'Notes' : 'This tab';
    Alert.alert(
      `${tabLabel} is paused`,
      'Surveys are currently paused. Turn surveys on to unlock Trends and Notes.'
    );
  };
  const focusJourneyToggle = () => {
    progressScrollRef.current?.scrollTo({ y: 0, animated: true });
  };
  const tabsSection = hasAtLeastThirtySessions ? (
    <View style={styles.tabsSharedCard}>
      <TouchableOpacity
        style={[
          styles.collapsibleHeaderRow,
          !isSessionInsightsExpanded && styles.sessionInsightsHeaderCollapsed,
        ]}
        onPress={() => setIsSessionInsightsExpanded((prev) => !prev)}
        activeOpacity={0.84}
      >
        <View style={styles.sessionInsightsHeaderLeft}>
          <Text style={styles.collapsibleHeaderTitle}>Session Insights</Text>
          <View
            style={[
              styles.sessionInsightsStateBadgePill,
              isSurveyFullyPaused
                ? styles.sessionInsightsStateBadgePillPaused
                : isSurveyHistoricalOnly
                  ? styles.sessionInsightsStateBadgePillHistorical
                  : styles.sessionInsightsStateBadgePillLive,
            ]}
          >
            <Text style={styles.sessionInsightsStateBadgeText}>{sessionInsightsStateBadgeText}</Text>
          </View>
        </View>
        {isSessionInsightsExpanded ? (
          <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
        ) : (
          <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
        )}
      </TouchableOpacity>
      {isSessionInsightsExpanded ? (
        <>
          <View style={styles.sessionInsightsTabsWrap}>
            <ProgressViewTabs
              activeTab={activeProgressTab}
              onChange={setActiveProgressTab}
              disabledTabs={disabledTabs}
              onDisabledTabPress={handleDisabledInsightsTabPress}
              embedded
            />
          </View>
          {shouldFullyLockInsights ? (
            <TouchableOpacity style={styles.disabledTabsHintCard} onPress={focusJourneyToggle} activeOpacity={0.88}>
              <Text style={styles.disabledTabsHintText}>
                Surveys are paused. Turn surveys on to unlock Trends and Notes.
              </Text>
            </TouchableOpacity>
          ) : null}
          <View
            style={styles.tabsSharedContent}
            {...(activeProgressTab === 'insights'
              ? notesToCheckinsSwipeResponder.panHandlers
              : tabsSwipeResponder.panHandlers)}
          >
        {hasSurveyInsightsOptOutState && activeProgressTab !== 'checkins' ? (
          <View style={styles.inactiveSurveyCard}>
            <Text style={styles.inactiveSurveyTitle}>{sessionInsightsPanelTitle}</Text>
            <Text style={styles.inactiveSurveyBody}>
              {sessionInsightsPanelBody}
            </Text>
            {!hasPartialSurveyOptOutData ? renderInactiveSurveyToggle() : null}
          </View>
        ) : null}
        {activeProgressTab === 'checkins' ? (
          effectiveScienceType === 'zero' ? (
            <View style={styles.emptyStateCardEmbedded}>
              <Text style={styles.tabIntroSub}>Check what has changed over time in your journey with us.</Text>
              <Text style={styles.emptyStateTitle}>No activity yet</Text>
              <Text style={styles.emptyStateBody}>
                Complete your first session, respond to the pre- and post-session survey, and your Activity calendar will start populating here.
              </Text>
            </View>
          ) : (
            <>
              {!hasSurveyInsightsOptOutState ? (
                <Text style={styles.tabIntroSub}>Check what has changed over time in your journey with us.</Text>
              ) : null}
              <ProgressCheckinsCalendar
                moodEntries={moodEntries}
                previewType={hasSurveyInsightsOptOutState ? (hasPartialSurveyOptOutData ? 'partialSurveyOptOut' : 'inactiveSurvey') : sciencePreviewType}
                sessionCount={trendSessionCount}
                loggedVariant={hasPartialSurveyOptOutData ? 'mixed' : hasIncompleteOrInactiveSurveyData ? 'gray' : undefined}
                showLegend={hasPartialSurveyOptOutData}
                embedded
              />
            </>
          )
        ) : null}
        {activeProgressTab === 'trend' ? (
          shouldFullyLockInsights ? (
            null
          ) : shouldShowEmptyState || trendSessionCount <= 0 ? (
            <View style={styles.emptyStateCardEmbedded}>
              <Text style={styles.tabIntroSub}>Check what has changed over time in your journey with us.</Text>
              <Text style={styles.emptyStateTitle}>No trends yet</Text>
              <Text style={styles.emptyStateBody}>
                Finish at least one Coherence Session and submit your survey response to unlock stress, energy, mood, and Coherence trends.
              </Text>
            </View>
          ) : (
            <>
              {!hasSurveyInsightsOptOutState ? (
                <Text style={styles.tabIntroSub}>Check what has changed over time in your journey with us.</Text>
              ) : null}
              <TrendLayerComparisonCard
                sessionCount={trendSessionCount}
                averages={trendAverages}
                defaultExpanded
                showAccordion={false}
                showPostGraphContent={false}
                themeVariant="progress"
                embedded
              />
              {hasPartialSurveyOptOutData ? (
                <Text style={styles.historicalDataHint}>Historical survey insights are shown for your earlier sessions.</Text>
              ) : null}
            </>
          )
        ) : null}
        {activeProgressTab === 'insights' ? (
          shouldFullyLockInsights ? (
            <View style={styles.emptyStateCardEmbedded} />
          ) : effectiveScienceType === 'zero' ? (
            <View style={styles.emptyStateCardEmbedded}>
              <Text style={styles.emptyStateTitle}>No notes yet</Text>
              <Text style={styles.emptyStateBody}>
                Complete your first session, respond to the pre- and post-session survey, and your notes history will start populating here.
              </Text>
            </View>
          ) : (
            <View style={[styles.notesContainerCard, styles.notesContainerCardEmbedded]}>
              <View style={styles.notesHistoryCard}>
                {!hasSurveyInsightsOptOutState ? (
                  <Text style={styles.notesHistorySub}>Check what has changed over time in your journey with us.</Text>
                ) : null}
                <View style={styles.notesRangeTabs}>
                  {(hasAtLeastThirtySessions
                    ? [
                        { key: 'today', label: 'Today' },
                        { key: 'week', label: 'Week' },
                        { key: 'month', label: 'Month' },
                      ]
                    : [
                        { key: 'today', label: 'Today' },
                        { key: 'week', label: 'Week' },
                      ]).map((tab) => {
                    const active = notesRange === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={[styles.notesRangeTabBtn, active && styles.notesRangeTabBtnActive]}
                        onPress={() => setNotesRange(tab.key)}
                        activeOpacity={0.86}
                      >
                        <Text style={[styles.notesRangeTabTxt, active && styles.notesRangeTabTxtActive]}>
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <View style={styles.notesListWrap}>
                {filteredNotes.map((note, idx) => (
                  <View key={note.id} style={idx > 0 ? styles.noteRowDivider : null}>
                    <NoteSwipeRow
                      onOpenChange={(isOpen) => setHasOpenNoteSwipeActions(isOpen)}
                      onView={() =>
                        Alert.alert(
                          'Note details',
                          note.body || 'No note content available.',
                          [{ text: 'Close', style: 'default' }]
                        )
                      }
                      onEdit={() => {
                        if (note.isSample) {
                          Alert.alert('Sample note', 'Sample notes are preview-only. Add a real note to edit.');
                          return;
                        }
                        setEditingNote(note);
                        setEditDraft(note.body || '');
                      }}
                      onDelete={() =>
                        note.isSample
                          ? Alert.alert('Sample note', 'Sample notes are preview-only and cannot be deleted.')
                          : Alert.alert('Delete note', 'Are you sure you want to delete this note?', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteSessionNote(note.id) },
                            ])
                      }
                    >
                      <View style={styles.noteCard}>
                        <Text style={styles.noteDate}>
                          {new Date(note.updatedAt || note.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.noteBody} numberOfLines={3}>
                          {note.body}
                        </Text>
                      </View>
                    </NoteSwipeRow>
                  </View>
                ))}
                {filteredNotes.length === 0 ? (
                  <View style={styles.emptyNotesCard}>
                    <Text style={styles.emptyNotesTitle}>{shouldShowEmptyState ? 'No notes yet' : 'No notes in this range'}</Text>
                    <Text style={styles.emptyNotesBody}>
                      {shouldShowEmptyState
                        ? 'Complete a Coherence Session and record your post-session survey to begin building your notes history.'
                        : 'Try another range to review earlier entries.'}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )
        ) : null}
          </View>
        </>
      ) : null}
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F6A400', '#F18A1F', '#EB6A33']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[styles.headerBg, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIconBtn} accessibilityLabel="Add favorite">
            <TopBarAddHeartIcon width={30} height={16} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={undefined}
              accessibilityLabel="Chat"
            >
              <MessageCircle size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              accessibilityLabel="Settings"
              onPress={() => navigation.navigate('HomeTab', { screen: 'Settings' })}
            >
              <TopBarSettingsIcon size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {showSurveySettingsCard ? (
        <Animated.View
          needsOffscreenAlphaCompositing={Platform.OS === 'android'}
          collapsable={false}
          style={[styles.surveySettingsBanner, surveySettingsBannerAnimatedStyle]}
        >
          <View style={styles.surveySettingsBannerInner} onLayout={onSurveySettingsBannerLayout}>
            <TouchableOpacity
              style={styles.surveySettingsBannerClose}
              onPress={onDismissSurveySettingsBanner}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Dismiss survey settings banner"
            >
              <X size={22} color="#E18B31" />
            </TouchableOpacity>
            <View style={styles.journeySurveyToggleWrap}>
              {hasIncompleteOrInactiveSurveyData ? renderInactiveSurveyToggle() : null}
              {hasPartialSurveyOptOutData ? renderPartialSurveyToggle() : null}
            </View>
          </View>
        </Animated.View>
      ) : null}

      <ScrollView
        ref={progressScrollRef}
        onScroll={(event) => {
          currentScrollYRef.current = event.nativeEvent.contentOffset.y || 0;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <JourneySection
          isZeroSnapshotState={isZeroSnapshotState}
          setIsJourneyHelpVisible={setIsJourneyHelpVisible}
          journeyProgressPct={journeyProgressPct}
          activePhaseIdx={activePhaseIdx}
          phaseNodeAnimRefs={phaseNodeAnimRefs}
          activeHeartScaleAnim={activeHeartScaleAnim}
          activeNodeGlowAnim={activeNodeGlowAnim}
          showPhaseCompletionBurst={showPhaseCompletionBurst}
          phaseCompletionAnim={phaseCompletionAnim}
          journeySummaryMessage={journeySummaryMessage}
          showSurveyBannerNextStepsCopy={showSurveyBannerNextStepsCopy}
          journeyCtaLabel={journeyCtaLabel}
          onPressJourneyCta={onPressJourneyCta}
        />

        <InsightsSection
          isZeroSnapshotState={isZeroSnapshotState}
          isSnapshotExpanded={isSnapshotExpanded}
          setIsSnapshotExpanded={setIsSnapshotExpanded}
          totalSessions={totalSessions}
          streak={streak}
          totalMinutes={totalMinutes}
          coherencePoints={coherencePoints}
          sciencePreviewType={sciencePreviewType}
          snapshotCount={snapshotCount}
          shouldHideTrendsCard={shouldHideTrendsCard}
          isTrendsExpanded={isTrendsExpanded}
          setIsTrendsExpanded={setIsTrendsExpanded}
          trendsPreview={trendsPreview}
          navigation={navigation}
          shouldPrioritizeInsightsCard={shouldPrioritizeInsightsCard}
          tabsSection={tabsSection}
          trendSessionCount={trendSessionCount}
          hasSurveyInsightsOptOutState={hasSurveyInsightsOptOutState}
          trendAverages={trendAverages}
        />

        <NotesSection
          isCommunityExpanded={isCommunityExpanded}
          setIsCommunityExpanded={setIsCommunityExpanded}
          setIsCommunityHelpVisible={setIsCommunityHelpVisible}
          isZeroSnapshotState={isZeroSnapshotState}
          communityCount={communityCount}
          quoteEntryAnim={quoteEntryAnim}
          editorialQuoteAuthor={editorialQuoteAuthor}
          editorialQuote={editorialQuote}
          navigation={navigation}
          sciencePreviewType={sciencePreviewType}
        />
      </ScrollView>

      <Modal
        visible={Boolean(editingNote)}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setEditingNote(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TextInput
              value={editDraft}
              onChangeText={setEditDraft}
              multiline
              style={styles.modalInput}
              placeholder="Update your reflection..."
              placeholderTextColor="rgba(52,37,61,0.46)"
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalBtnGhost} onPress={() => setEditingNote(null)} activeOpacity={0.86}>
                <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={saveEdit} activeOpacity={0.86}>
                <Text style={styles.modalBtnTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isJourneyHelpVisible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setIsJourneyHelpVisible(false)}
      >
        <View style={styles.communityHelpBackdrop}>
          <View style={styles.communityHelpDim} />
          <View
            style={[
              styles.communityHelpPopover,
              { maxHeight: helpSheetMaxHeight, paddingBottom: helpSheetBottomPadding },
            ]}
          >
            <View style={styles.communityHelpHeaderRow}>
              <View style={styles.communityHelpTitleWrap}>
                <Text style={styles.communityHelpModalTitle}>My Journey</Text>
              </View>
              <TouchableOpacity
                style={styles.communityHelpCloseBtn}
                onPress={() => setIsJourneyHelpVisible(false)}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel="Close journey help"
              >
                <X size={20} color="#6B2D8B" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={[styles.communityHelpScroll, { maxHeight: helpScrollMaxHeight }]}
              contentContainerStyle={styles.communityHelpScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <Text style={styles.communityHelpBody}>
                Progress is based on the number of consistent days you practice.
                {'\n\n'}
                {journeyHelpStageCopy}
              </Text>
            </ScrollView>
            <View style={styles.communityHelpActionRow}>
              <TouchableOpacity
                style={styles.communityHelpActionBtn}
                onPress={() => setIsJourneyHelpVisible(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.communityHelpActionBtnTxt}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isCommunityHelpVisible}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setIsCommunityHelpVisible(false)}
      >
        <View style={styles.communityHelpBackdrop}>
          <View style={styles.communityHelpDim} />
          <View
            style={[
              styles.communityHelpPopover,
              { maxHeight: helpSheetMaxHeight, paddingBottom: helpSheetBottomPadding },
            ]}
          >
            <View style={styles.communityHelpHeaderRow}>
              <View style={styles.communityHelpTitleWrap}>
                <Text style={styles.communityHelpModalTitle}>Coherence Points</Text>
              </View>
              <TouchableOpacity
                style={styles.communityHelpCloseBtn}
                onPress={() => setIsCommunityHelpVisible(false)}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel="Close help"
              >
                <X size={22} color="#6B2D8B" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={[styles.communityHelpScroll, { maxHeight: helpScrollMaxHeight }]}
              contentContainerStyle={styles.communityHelpScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <Text style={styles.communityHelpBody}>
                Each time your Coherence Score updates, it generates Coherence Points. For example, if your first
                Coherence Score is 2.0 and your second Coherence Score is 3.0, you will have generated 2.0 + 3.0 =
                5.0 Coherence Points.
                {'\n\n'}
                Your Coherence Points accumulate through your session and are added to your lifetime total. Some
                people set a daily objective of reaching a specific number of Coherence Points. When first beginning,
                we recommend 300 Coherence Points a day - and then increase this over time as it feels right to you.
                {'\n\n'}
                You can also check out the overall coherence points from our global community of users focused on
                increasing coherence.
                {'\n\n'}
                <Text
                  style={styles.communityHelpLink}
                  onPress={onPressCommunityHelpReadMore}
                  accessibilityRole="link"
                >
                  Learn More
                </Text>
              </Text>
            </ScrollView>
            <View style={styles.communityHelpActionRow}>
              <TouchableOpacity
                style={styles.communityHelpActionBtn}
                onPress={() => setIsCommunityHelpVisible(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.communityHelpActionBtnTxt}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F3F5' },
  headerBg: {
    paddingBottom: 34,
    borderBottomLeftRadius: borderRadius.sheet,
    borderBottomRightRadius: borderRadius.sheet,
    zIndex: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.heroTitle,
    fontFamily: PROGRESS_FONT_BOLD,
    color: colors.white,
    fontSize: 28,
    lineHeight: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  surveySettingsBanner: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: -borderRadius.sheet,
    backgroundColor: '#FFF8EE',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    zIndex: 25,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      default: {
        elevation: 16,
      },
    }),
  },
  surveySettingsBannerInner: {
    position: 'relative',
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.md + 4,
    paddingBottom: spacing.lg,
    justifyContent: 'center',
  },
  surveySettingsBannerClose: {
    position: 'absolute',
    top: spacing.md + 2,
    right: spacing.md + 2,
    zIndex: 2,
    padding: spacing.xs,
  },
  communityCardFrame: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md + 2,
    marginBottom: spacing.md,
  },
  communityHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: 10,
  },
  communityTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  communityHelpBtn: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginTop: 2,
  },
  communityHelpBackdrop: {
    flex: 1,
    width: '100%',
  },
  communityHelpDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.7)',
  },
  communityHelpPopover: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 36,
    paddingTop: 50,
  },
  communityHelpScroll: {},
  communityHelpScrollContent: {
    paddingBottom: 12,
  },
  communityHelpHeaderRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  communityHelpTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 36,
    paddingLeft: 0,
  },
  communityHelpCloseBtn: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  communityToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2C2C2E',
  },
  communityStatsRect: {
    borderRadius: 16,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'flex-start',
  },
  communityToday: { fontFamily: PROGRESS_FONT_REGULAR, fontSize: 13, lineHeight: 22, color: '#FFFFFF' },
  communityBig: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: colors.white,
    marginVertical: 4,
  },
  commRule: {
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginVertical: spacing.md,
  },
  communitySub: { fontFamily: PROGRESS_FONT_REGULAR, fontSize: 13, lineHeight: 26, color: '#FFFFFF' },
  sessionHistoryBtn: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    marginBottom: 0,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
  },
  sessionHistoryBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  trendsCard: {
    marginTop: 0,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md,
  },
  trendsSectionTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    color: '#2C2C2E',
    fontWeight: '800',
    marginBottom: 0,
  },
  trendsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  trendsMetaLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  trendsStarDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  trendsMetaLeft: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 12,
    lineHeight: 18,
    color: '#000000',
  },
  trendsMetaRight: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 12,
    lineHeight: 18,
    color: '#000000',
  },
  trendsChartWrap: {
    height: 222,
    borderRadius: 14,
    backgroundColor: '#FFF4E8',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.22)',
    overflow: 'hidden',
    position: 'relative',
  },
  trendsGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 88,
    paddingBottom: 118,
  },
  trendsGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  trendsYTick: {
    width: 32,
    textAlign: 'left',
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 18,
    color: '#171717',
    includeFontPadding: true,
    paddingRight: 0,
    zIndex: 3,
  },
  trendsGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D1',
  },
  trendsSpikeTrack: {
    position: 'absolute',
    left: '34%',
    top: 124,
    bottom: 44,
    width: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(23,23,23,0.14)',
  },
  trendsSpikeFill: {
    position: 'absolute',
    left: '34%',
    marginLeft: 2,
    bottom: 44,
    width: 36,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
  },
  trendsPeakDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    left: '34%',
    marginLeft: 12,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  trendsXAxisRow: {
    position: 'absolute',
    left: 52,
    right: 14,
    bottom: 10,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendsXTick: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: '#000000',
  },
  trendsXBullet: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 11,
    color: '#000000',
  },
  trendsAvgBubble: {
    position: 'absolute',
    left: '26%',
    top: 44,
    width: 74,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#8AB2FF',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  trendsAvgBubbleTxt: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#6B2D8B',
    fontSize: 12,
    lineHeight: 18,
  },
  trendsAvgBubbleStar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  trendsCtaBtn: {
    marginTop: 10,
    marginBottom: 0,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    backgroundColor: '#FFFFFF',
  },
  trendsCtaTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '700',
  },
  insightsSummaryCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.24)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  insightsSummaryTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  insightsSummaryText: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '600',
    color: '#171717',
  },
  emptyStateCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 180,
    justifyContent: 'center',
  },
  emptyStateCardEmbedded: {
    borderWidth: 0,
    borderRadius: 0,
    marginBottom: 0,
    minHeight: 180,
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 0,
  },
  emptyStateTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2C2C2E',
    marginBottom: 6,
  },
  emptyStateBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 15,
    lineHeight: 26,
    color: '#171717',
  },
  historicalDataHint: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717AD',
    marginTop: 8,
  },
  notesHistoryCard: {
    marginBottom: 8,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: spacing.sm,
  },
  notesContainerCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  notesContainerCardEmbedded: {
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: 0,
    paddingTop: 0,
  },
  notesListWrap: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 0,
  },
  noteRowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 0,
    paddingTop: 8,
  },
  notesHistoryTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  notesHistorySub: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    marginBottom: spacing.sm,
  },
  tabIntroTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  tabIntroSub: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    marginBottom: spacing.sm,
  },
  notesRangeTabs: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  notesRangeTabBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.28)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  notesRangeTabBtnActive: {
    backgroundColor: '#FFE8CC',
    borderColor: 'rgba(225,139,49,0.5)',
  },
  notesRangeTabTxt: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717',
    fontSize: 13,
    fontWeight: '600',
  },
  notesRangeTabTxtActive: {
    color: '#C26D1A',
  },
  emptyNotesCard: {
    marginBottom: 0,
    borderRadius: 12,
    backgroundColor: '#F8F8FA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyNotesTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  emptyNotesBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
  },
  noteCard: {
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
  },
  noteDate: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#2C2C2E7A',
    fontWeight: '400',
    marginBottom: 6,
  },
  noteBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
  },
  swipeRowWrap: {
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 174,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    zIndex: 0,
    elevation: 0,
  },
  swipeContent: {
    backgroundColor: 'transparent',
    zIndex: 2,
    elevation: 2,
    width: '100%',
  },
  swipeActionBtn: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeEditBtn: {
    backgroundColor: '#FFF4E8',
  },
  swipeViewBtn: {
    backgroundColor: '#FFEEDB',
  },
  swipeDeleteBtn: {
    backgroundColor: '#FFE6D6',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.24)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  modalTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2D1B3A',
    marginBottom: spacing.sm,
  },
  modalInput: {
    fontFamily: PROGRESS_FONT_REGULAR,
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.28)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#171717',
    fontSize: 15,
    lineHeight: 26,
    textAlignVertical: 'top',
    backgroundColor: '#FCF7FC',
  },
  modalActionRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalBtn: {
    borderRadius: 999,
    backgroundColor: '#E18B31',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  modalBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnGhost: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.34)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  modalBtnGhostTxt: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#C26D1A',
    fontSize: 14,
    fontWeight: '700',
  },
  phaseTimelineCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md,
  },
  journeyNextStepsCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  journeyNextStepsTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    color: '#2C2C2E',
    fontWeight: '800',
    marginBottom: 6,
  },
  phaseTimelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: spacing.md,
  },
  phaseTimelineTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  journeyHelpBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginTop: 2,
  },
  communityHelpBody: {
    fontFamily: 'Sailec-Light',
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
    letterSpacing: 0,
    textAlign: 'left',
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  communityHelpLink: {
    color: '#6B2D8B',
    textDecorationLine: 'underline',
  },
  communityHelpModalTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'left',
  },
  communityHelpActionRow: {
    paddingTop: 12,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  communityHelpActionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityHelpActionBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  journeySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
    paddingVertical: 2,
  },
  journeySummaryText: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    fontWeight: '400',
    flexShrink: 1,
  },
  journeySurveyToggleWrap: {
    minWidth: 0,
    paddingRight: 44,
    justifyContent: 'center',
  },
  journeyNextStepsCtaBtn: {
    marginTop: 10,
    marginBottom: 0,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    backgroundColor: '#FFFFFF',
  },
  journeyLevelOneCtaTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '700',
  },
  collapsibleCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md,
  },
  collapsibleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: 10,
  },
  sessionInsightsHeaderCollapsed: {
    marginBottom: 0,
  },
  collapsibleHeaderTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    color: '#2C2C2E',
    fontWeight: '800',
  },
  snapshotCompactRow: {
    marginTop: 0,
    marginBottom: 4,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  snapshotExpandedWrap: {
    marginTop: 0,
  },
  snapshotCompactItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  snapshotCompactDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  snapshotCompactValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 20,
    lineHeight: 26,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  snapshotCompactLabel: {
    marginTop: 2,
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#FFFFFF',
  },
  phaseTimelineTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    color: '#2C2C2E',
    fontWeight: '800',
  },
  phaseLineWrap: {
    position: 'relative',
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    marginBottom: spacing.lg + spacing.lg + spacing.xs,
  },
  phaseBaseLine: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 17,
    height: 1,
    backgroundColor: 'rgba(52,37,61,0.18)',
  },
  phaseProgressLine: {
    position: 'absolute',
    left: 2,
    top: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(225,139,49,0.75)',
  },
  phaseTimelineTrackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phaseItemWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  phaseNode: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#F1ECF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'visible',
  },
  phaseNodeCompleted: {
    backgroundColor: '#E18B31',
  },
  phaseNodeActive: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
    backgroundColor: '#C26D1A',
    shadowColor: '#E18B31',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  phaseNodeFuture: {
    backgroundColor: '#F8F8FA',
  },
  phaseNodeZeroStart: {
    backgroundColor: '#F2F2F5',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  phaseNodeGlow: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(225,139,49,0.28)',
    shadowColor: '#E18B31',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  phaseCompletionBurst: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseCompletionDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 202, 117, 0.95)',
  },
  phaseCompletionDotTop: { top: 2, left: 20 },
  phaseCompletionDotTopRight: { top: 9, right: 5 },
  phaseCompletionDotRight: { top: 20, right: 1 },
  phaseCompletionDotBottom: { bottom: 2, left: 20 },
  phaseCompletionDotLeft: { top: 20, left: 1 },
  phaseCompletionDotTopLeft: { top: 9, left: 5 },
  phaseNodeLabelAndroid: {
    includeFontPadding: false,
  },
  phaseNodeLabel: {
    marginTop: 8,
    width: '100%',
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 12.5,
    lineHeight: 15,
    textAlign: 'center',
    fontWeight: 'normal',
  },
  phaseNodeLabelCompleted: {
    color: '#171717AD',
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 12.5,
    lineHeight: 15,
    fontWeight: 'normal',
  },
  phaseNodeLabelActive: {
    color: '#171717AD',
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: 'normal',
  },
  phaseNodeLabelFuture: {
    color: '#171717AD',
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 12.5,
    lineHeight: 15,
    fontWeight: 'normal',
  },
  phaseTimelineSub: {
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717AD',
    fontSize: 13,
    lineHeight: 26,
  },
  tabsSharedCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md + 2,
  },
  tabsSharedContent: {
    paddingTop: spacing.md + 2,
  },
  sessionInsightsTabsWrap: {
    marginTop: spacing.sm,
  },
  disabledTabsHintCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.24)',
    backgroundColor: '#FFF8EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  disabledTabsHintText: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
  },
  sessionInsightsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    paddingRight: 8,
  },
  sessionInsightsStateBadgePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sessionInsightsStateBadgePillPaused: {
    borderColor: 'rgba(196,82,69,0.36)',
    backgroundColor: '#FFF2EF',
  },
  sessionInsightsStateBadgePillHistorical: {
    borderColor: 'rgba(225,139,49,0.34)',
    backgroundColor: '#FFF8EE',
  },
  sessionInsightsStateBadgePillLive: {
    borderColor: 'rgba(44,154,95,0.32)',
    backgroundColor: '#EEF9F2',
  },
  sessionInsightsStateBadgeText: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    fontWeight: '600',
  },
  toggleMicrocopy: {
    marginTop: spacing.xs,
    fontFamily: PROGRESS_FONT_REGULAR_ITALIC,
    fontSize: 13,
    lineHeight: 22,
    color: '#1717177A',
  },
  toggleConfirmationText: {
    marginTop: spacing.xs,
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#2C9A5F',
    fontWeight: '600',
  },
  tabsLockedToggleSwitchRow: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  tabsLockedToggleSwitchKnob: {
    width: 30,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.45)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  tabsLockedToggleSwitchKnobActive: {
    backgroundColor: '#FFE8CC',
    borderColor: '#E18B31',
    alignItems: 'flex-end',
  },
  tabsLockedToggleSwitchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E18B31',
    backgroundColor: '#FFE8CC',
  },
  tabsLockedToggleSwitchDotActive: {
    backgroundColor: '#E18B31',
  },
  tabsLockedToggleSwitchText: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '600',
  },
  tabsLockedToggleSwitchTextActive: {
    color: '#171717',
  },
  surveyOptInCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.28)',
    backgroundColor: '#FFF8EE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  surveyOptInText: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#171717',
    fontSize: 14,
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  surveyOptInBtn: {
    alignSelf: 'flex-start',
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  surveyOptInBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '700',
  },
  inactiveSurveyCard: {
    marginTop: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  inactiveSurveyBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
  },
  inactiveSurveyTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2C2C2E',
    fontSize: 13,
    lineHeight: 26,
    marginBottom: 2,
  },
  inactiveSurveyToggleRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: 8,
  },
  inactiveSurveyToggleBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  inactiveSurveyToggleBtnActive: {
    backgroundColor: '#FFE8CC',
    borderColor: '#E18B31',
  },
  inactiveSurveyToggleBtnMuted: {
    backgroundColor: '#F2F2F5',
    borderColor: 'rgba(52,37,61,0.2)',
  },
  inactiveSurveyToggleTxt: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
  },
  inactiveSurveyToggleTxtActive: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#171717',
  },
  inactiveSurveyToggleTxtMuted: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#171717',
  },
  editorialQuoteCardWrap: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(241,138,31,0.35)',
  },
  editorialQuoteGradient: {
    paddingHorizontal: spacing.xl + 2,
    paddingVertical: spacing.xl + 6,
  },
  editorialQuoteGloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '52%',
  },
  editorialQuoteBlock: {
    width: '100%',
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  editorialQuoteText: {
    fontFamily: 'Sailec-RegularItalic',
    color: '#3D2918',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '400',
  },
  editorialQuoteSource: {
    fontFamily: 'Sailec-Thin',
    color: '#171717',
    fontSize: 12,
    lineHeight: 22,
    fontWeight: '400',
  },
});

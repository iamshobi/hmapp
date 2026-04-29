/**
 * My Progress — HeartMath-style: warm header, Practice Stats, streaks, community banner, MoodMeter.
 */
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
  Share,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, Heart, Sparkles, Settings, MessageCircle, Pencil, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import ProgressSnapshotBar from '../components/ProgressSnapshotBar';
import ProgressMilestoneCard from '../components/ProgressMilestoneCard';
import ProgressSurveyDeltaCard from '../components/ProgressSurveyDeltaCard';
import ProgressViewTabs from '../components/ProgressViewTabs';
import ProgressCheckinsCalendar from '../components/ProgressCheckinsCalendar';
import { TrendLayerComparisonCard } from '../components/sessionInsights/SessionInsightsUI';
import { useMysession } from '../context/mysessionContext';
import { colors, spacing, borderRadius, typography } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function getScienceTypeFromSessions(totalSessions) {
  if (totalSessions >= 100) return 'pro';
  if (totalSessions >= 17) return 'advanced';
  if (totalSessions >= 5) return 'building';
  if (totalSessions >= 1) return 'firstTime';
  return 'zero';
}

function getSnapshotForPreviewType(type) {
  const t = normalizePreviewType(type);
  if (t === 'inactiveSurvey') return { sessions: 12, streak: 4, coherence: 2.8, points: 92 };
  if (t === 'partialSurveyOptOut') return { sessions: 18, streak: 6, coherence: 3.0, points: 128 };
  if (t === 'pro') return { sessions: 100, streak: 14, coherence: 4.8, points: 210 };
  if (t === 'advanced') return { sessions: 17, streak: 7, coherence: 3.1, points: 110 };
  if (t === 'building') return { sessions: 5, streak: 3, coherence: 2.3, points: 75 };
  if (t === 'firstTime') return { sessions: 1, streak: 1, coherence: 1.7, points: 40 };
  return { sessions: 0, streak: 0, coherence: 0, points: 0 };
}

function getCoherenceFromSessions(totalSessions) {
  if (totalSessions >= 100) return 4.8;
  if (totalSessions >= 17) return 3.1;
  if (totalSessions >= 5) return 2.3;
  if (totalSessions >= 1) return 1.7;
  return 0.0;
}

function normalizePreviewType(type) {
  if (type === 'growing') return 'building';
  return type;
}

function calcShiftPct(metric, before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0) return 0;
  const delta = metric === 'stress' ? before - after : after - before;
  return Math.max(0, Math.round((delta / before) * 100));
}

function getPreviewAveragesByType(type) {
  const t = normalizePreviewType(type);
  if (t === 'pro') {
    return {
      stressBefore: 8,
      stressAfter: 4,
      energyBefore: 3,
      energyAfter: 7,
      moodBefore: 3,
      moodAfter: 8,
    };
  }
  if (t === 'advanced') {
    return {
      stressBefore: 7,
      stressAfter: 4,
      energyBefore: 3,
      energyAfter: 7,
      moodBefore: 4,
      moodAfter: 7,
    };
  }
  if (t === 'building') {
    return {
      stressBefore: 7,
      stressAfter: 5,
      energyBefore: 4,
      energyAfter: 6,
      moodBefore: 4,
      moodAfter: 6,
    };
  }
  if (t === 'zero') {
    return {
      stressBefore: 5,
      stressAfter: 5,
      energyBefore: 5,
      energyAfter: 5,
      moodBefore: 5,
      moodAfter: 5,
    };
  }
  return {
    stressBefore: 6,
    stressAfter: 5,
    energyBefore: 4,
    energyAfter: 5,
    moodBefore: 4,
    moodAfter: 5,
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getProgressPhaseIndex(sessionCount) {
  if (sessionCount >= 17) return 3;
  if (sessionCount >= 5) return 2;
  if (sessionCount >= 1) return 1;
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

function NoteSwipeRow({ children, onEdit, onDelete, onOpenChange }) {
  const ACTION_WIDTH = 116;
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

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          const next = clamp(currentX.current + gesture.dx, -ACTION_WIDTH, 0);
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const movedFarLeft = gesture.dx < -40;
          const movedFarRight = gesture.dx > 24;
          if (movedFarLeft) animateTo(-ACTION_WIDTH);
          else if (movedFarRight) animateTo(0);
          else animateTo(currentX.current < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0);
        },
      }),
    [translateX]
  );

  return (
    <View style={styles.swipeRowWrap}>
      <View style={styles.swipeActions}>
        <TouchableOpacity style={[styles.swipeActionBtn, styles.swipeEditBtn]} onPress={onEdit} activeOpacity={0.86}>
          <Pencil size={16} color="#E18B31" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.swipeActionBtn, styles.swipeDeleteBtn]} onPress={onDelete} activeOpacity={0.86}>
          <Trash2 size={16} color="#C92262" />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.swipeContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default function ProgressMainScreen() {
  const insets = useSafeAreaInsets();
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
  const [isJourneyExpanded, setIsJourneyExpanded] = useState(false);
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(false);
  const [isMilestoneExpanded, setIsMilestoneExpanded] = useState(false);
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const [isSessionInsightsExpanded, setIsSessionInsightsExpanded] = useState(true);
  const [surveyPreferenceUpdatedVisible, setSurveyPreferenceUpdatedVisible] = useState(false);
  const surveyPreferenceFadeAnim = useRef(new Animated.Value(0)).current;
  const surveyPreferenceTimeoutRef = useRef(null);
  const isInactiveSurveyPreview = sciencePreviewType === 'inactiveSurvey';
  const isPartialSurveyOptOutPreview = sciencePreviewType === 'partialSurveyOptOut';
  const progressTabOrder = React.useMemo(() => ['trend', 'checkins', 'insights'], []);

  useEffect(() => {
    const nextPreviewType = normalizePreviewType(route?.params?.previewType ?? null);
    setSciencePreviewType(nextPreviewType);
  }, [route?.params?.previewType]);

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

  const trendAverages = React.useMemo(() => {
    if (sciencePreviewType) {
      if (sciencePreviewType === 'inactiveSurvey') {
        return getPreviewAveragesByType('building');
      }
      return getPreviewAveragesByType(sciencePreviewType);
    }
    const list = Array.isArray(surveyResults) ? surveyResults : [];
    const avg = (key) => {
      const nums = list.map((item) => item?.[key]).filter((v) => Number.isFinite(v));
      if (!nums.length) return null;
      return nums.reduce((sum, v) => sum + v, 0) / nums.length;
    };
    const fromResults = {
      stressBefore: avg('stressBefore'),
      stressAfter: avg('stressAfter'),
      energyBefore: avg('energyBefore'),
      energyAfter: avg('energyAfter'),
      moodBefore: avg('moodBefore'),
      moodAfter: avg('moodAfter'),
    };
    const hasAny =
      Number.isFinite(fromResults.stressBefore) ||
      Number.isFinite(fromResults.stressAfter) ||
      Number.isFinite(fromResults.energyBefore) ||
      Number.isFinite(fromResults.energyAfter) ||
      Number.isFinite(fromResults.moodBefore) ||
      Number.isFinite(fromResults.moodAfter);
    if (hasAny) return fromResults;

    return getPreviewAveragesByType(getScienceTypeFromSessions(totalSessions));
  }, [sciencePreviewType, surveyResults, totalSessions]);

  const trendSessionCount = React.useMemo(() => {
    if (!sciencePreviewType) return totalSessions;
    const t = normalizePreviewType(sciencePreviewType);
    if (t === 'inactiveSurvey') return 12;
    if (t === 'partialSurveyOptOut') return 18;
    if (t === 'pro') return 100;
    if (t === 'advanced') return 17;
    if (t === 'building') return 5;
    if (t === 'firstTime') return 1;
    return 0;
  }, [sciencePreviewType, totalSessions]);
  const shouldShowStartFirstSessionCta = trendSessionCount === 0;
  const shouldShowKeepGoingCta = trendSessionCount >= 1 && trendSessionCount <= 5;
  const shouldShowKeepRhythmCta = trendSessionCount >= 6 && trendSessionCount <= 15;
  const hasEnoughSessionsForProgressTabs = trendSessionCount >= 6;
  const hasAtLeastThirtySessions = trendSessionCount >= 30;
  const activePhaseIdx = getProgressPhaseIndex(trendSessionCount);
  const surveyResultsCount = Array.isArray(surveyResults) ? surveyResults.length : 0;
  const hasIncompleteOrInactiveSurveyData =
    isInactiveSurveyPreview || (!sciencePreviewType && totalSessions > 0 && surveyResultsCount === 0);
  const hasPartialSurveyOptOutData =
    isPartialSurveyOptOutPreview ||
    (!sciencePreviewType && totalSessions > 0 && surveyResultsCount > 0 && surveyResultsCount < totalSessions);
  const hasSurveyInsightsOptOutState = hasIncompleteOrInactiveSurveyData || hasPartialSurveyOptOutData;
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
  const showSurveyPreferenceUpdated = () => {
    if (surveyPreferenceTimeoutRef.current) {
      clearTimeout(surveyPreferenceTimeoutRef.current);
    }
    setSurveyPreferenceUpdatedVisible(true);
    surveyPreferenceFadeAnim.stopAnimation();
    surveyPreferenceFadeAnim.setValue(0);
    Animated.timing(surveyPreferenceFadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    surveyPreferenceTimeoutRef.current = setTimeout(() => {
      Animated.timing(surveyPreferenceFadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setSurveyPreferenceUpdatedVisible(false);
        }
        surveyPreferenceTimeoutRef.current = null;
      });
    }, 2500);
  };
  useEffect(
    () => () => {
      if (surveyPreferenceTimeoutRef.current) {
        clearTimeout(surveyPreferenceTimeoutRef.current);
      }
      surveyPreferenceFadeAnim.stopAnimation();
    },
    [surveyPreferenceFadeAnim]
  );
  useEffect(() => {
    if (shouldFullyLockInsights && activeProgressTab !== 'checkins') {
      setActiveProgressTab('checkins');
    }
  }, [shouldFullyLockInsights, activeProgressTab]);
  const editorialQuotePool =
    hasSurveyInsightsOptOutState
      ? EDITORIAL_QUOTES.inactive
      : trendSessionCount >= 16
        ? EDITORIAL_QUOTES.deep
        : trendSessionCount >= 6
          ? EDITORIAL_QUOTES.building
          : EDITORIAL_QUOTES.early;
  const editorialQuote = editorialQuotePool[Math.max(0, trendSessionCount) % editorialQuotePool.length];
  const editorialQuoteStageLabel = hasSurveyInsightsOptOutState
    ? 'shown for incomplete practice days'
    : trendSessionCount >= 16
      ? 'shown for deep practice milestones'
      : trendSessionCount >= 6
        ? 'shown for building milestones'
        : 'shown for first-step milestones';

  const effectiveScienceType = sciencePreviewType || getScienceTypeFromSessions(totalSessions);
  const hasNoProgressData = totalSessions <= 0;
  const shouldShowEmptyState = hasNoProgressData && !sciencePreviewType;
  const renderInactiveSurveyToggle = () => (
    <View>
      <TouchableOpacity
        style={styles.tabsLockedToggleSwitchRow}
        onPress={() => {
          const nextChoice = inactiveSurveyOptInChoice === 'yes' ? 'no' : 'yes';
          setInactiveSurveyOptInChoice(nextChoice);
          showSurveyPreferenceUpdated();
        }}
        activeOpacity={0.88}
      >
        <View
          style={[
            styles.tabsLockedToggleSwitchKnob,
            inactiveSurveyOptInChoice === 'yes' && styles.tabsLockedToggleSwitchKnobActive,
          ]}
        >
          <View
            style={[
              styles.tabsLockedToggleSwitchDot,
              inactiveSurveyOptInChoice === 'yes' && styles.tabsLockedToggleSwitchDotActive,
            ]}
          />
        </View>
        <Text
          style={[
            styles.tabsLockedToggleSwitchText,
            inactiveSurveyOptInChoice === 'yes' && styles.tabsLockedToggleSwitchTextActive,
          ]}
        >
          {inactiveSurveyOptInChoice === 'yes' ? 'Yes, keep surveys on' : 'No, pause surveys for now'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.toggleMicrocopy}>
        This only updates your survey preference. You can change it anytime.
      </Text>
      {surveyPreferenceUpdatedVisible ? (
        <Animated.Text style={[styles.toggleConfirmationText, { opacity: surveyPreferenceFadeAnim }]}>
          Survey preference updated
        </Animated.Text>
      ) : null}
    </View>
  );
  const renderPartialSurveyToggle = () => (
    <View>
      <TouchableOpacity
        style={styles.tabsLockedToggleSwitchRow}
        onPress={() => {
          const nextChoice = progressOptInChoice === 'yes' ? 'no' : 'yes';
          setProgressOptInChoice(nextChoice);
          showSurveyPreferenceUpdated();
        }}
        activeOpacity={0.88}
      >
        <View
          style={[
            styles.tabsLockedToggleSwitchKnob,
            progressOptInChoice === 'yes' && styles.tabsLockedToggleSwitchKnobActive,
          ]}
        >
          <View
            style={[
              styles.tabsLockedToggleSwitchDot,
              progressOptInChoice === 'yes' && styles.tabsLockedToggleSwitchDotActive,
            ]}
          />
        </View>
        <Text
          style={[
            styles.tabsLockedToggleSwitchText,
            progressOptInChoice === 'yes' && styles.tabsLockedToggleSwitchTextActive,
          ]}
        >
          {progressOptInChoice === 'yes' ? 'Yes, keep surveys on' : 'No, pause surveys for now'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.toggleMicrocopy}>
        This only updates your survey preference. You can change it anytime.
      </Text>
      {surveyPreferenceUpdatedVisible ? (
        <Animated.Text style={[styles.toggleConfirmationText, { opacity: surveyPreferenceFadeAnim }]}>
          Survey preference updated
        </Animated.Text>
      ) : null}
    </View>
  );
  const insightsSummaryLine = React.useMemo(() => {
    const stressPct = calcShiftPct('stress', trendAverages.stressBefore, trendAverages.stressAfter);
    const energyPct = calcShiftPct('energy', trendAverages.energyBefore, trendAverages.energyAfter);
    const moodPct = calcShiftPct('mood', trendAverages.moodBefore, trendAverages.moodAfter);
    return `Stress down by ${stressPct}%, Energy up by ${energyPct}% and Mood up by ${moodPct}%`;
  }, [trendAverages, effectiveScienceType]);

  const notesList = React.useMemo(
    () => (Array.isArray(sessionNotes) ? sessionNotes : []),
    [sessionNotes]
  );
  const notesForDisplay = React.useMemo(() => {
    if (notesList.length > 0) return notesList;
    if (shouldShowEmptyState) return [];
    const now = Date.now();
    if (effectiveScienceType === 'zero') return [];
    if (effectiveScienceType === 'firstTime') {
      return [
        {
          id: 'sample-note-1',
          body: 'I felt calmer after the session and my breathing felt steadier.',
          createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
          updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
          isSample: true,
        },
      ];
    }
    if (effectiveScienceType === 'building' || effectiveScienceType === 'advanced') {
      const advancedExtra =
        effectiveScienceType === 'advanced'
          ? [
              {
                id: 'sample-note-3',
                body: 'Noticed less reactivity today. Recovery after stress felt faster than last week.',
                createdAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
                updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
                isSample: true,
              },
              {
                id: 'sample-note-4',
                body: 'More focused after session. I want to keep this as part of my morning routine.',
                createdAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
                updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
                isSample: true,
              },
            ]
          : [];
      return [
        {
          id: 'sample-note-1',
          body: 'Felt less chest tightness after 5 minutes. Breath felt smoother by the end.',
          createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
          updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
          isSample: true,
        },
        {
          id: 'sample-note-2',
          body: 'Started distracted, finished calmer. Energy lifted from low to steady.',
          createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
          isSample: true,
        },
        ...advancedExtra,
      ];
    }
    return [
      {
        id: 'sample-note-1',
        body: 'Felt less chest tightness after 5 minutes. Breath felt smoother by the end.',
        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
        isSample: true,
      },
      {
        id: 'sample-note-2',
        body: 'Started distracted, finished calmer. Energy lifted from low to steady.',
        createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        isSample: true,
      },
      {
        id: 'sample-note-3',
        body: 'Mood improved after session. Should repeat this before afternoon meetings.',
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 20).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 20).toISOString(),
        isSample: true,
      },
      {
        id: 'sample-note-4',
        body: 'Handled a difficult conversation with less emotional overload than before.',
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 30).toISOString(),
        isSample: true,
      },
      {
        id: 'sample-note-5',
        body: 'Consistent breathing practice is helping me reset faster during high-pressure days.',
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 42).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 42).toISOString(),
        isSample: true,
      },
    ];
  }, [effectiveScienceType, notesList, shouldShowEmptyState]);
  const filteredNotes = React.useMemo(() => {
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
  }, [notesForDisplay, notesRange]);

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

  const onShareProgress = async () => {
    const sessions = Number(trendSessionCount) || 0;
    const activeStreak = Number(streak) || 0;
    const points = Math.max(0, Math.round(Number(coherencePoints) || 0));
    const shareMessage =
      `My HeartMath progress update:\n\n` +
      `Sessions completed: ${sessions}\n` +
      `Current streak: ${activeStreak} day${activeStreak === 1 ? '' : 's'}\n` +
      `Coherence points: ${points}\n\n` +
      `I am building a steadier rhythm, one session at a time.`;
    try {
      await Share.share({
        title: 'My Progress',
        message: shareMessage,
      });
    } catch (error) {
      Alert.alert('Unable to share', 'Please try again in a moment.');
    }
  };
  const shouldPrioritizeInsightsCard =
    hasEnoughSessionsForProgressTabs &&
    trendSessionCount > 0 &&
    !shouldFullyLockInsights &&
    !hasSurveyInsightsOptOutState;
  const milestoneHeaderText = React.useMemo(() => {
    if (hasPartialSurveyOptOutData) {
      return "Great, You've completed 18 sessions, but surveys are temporarily turned off!";
    }
    if (hasIncompleteOrInactiveSurveyData) {
      return "Great, You've completed 12 sessions.";
    }
    if (trendSessionCount >= 100) {
      return "Wow, You've completed 100 sessions!";
    }
    if (trendSessionCount >= 17) {
      return 'You are 17 sessions strong!';
    }
    if (trendSessionCount >= 5) {
      return "Great, You've completed 5 sessions!";
    }
    if (trendSessionCount >= 1) {
      return "You've completed your 1st session!";
    }
    return 'Start your first session!';
  }, [hasIncompleteOrInactiveSurveyData, hasPartialSurveyOptOutData, trendSessionCount]);
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
  const disabledTabs = shouldFullyLockInsights ? ['trend', 'insights'] : [];
  const tabsSection = hasEnoughSessionsForProgressTabs ? (
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
              embedded
            />
          </View>
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
  ) : (
    <View style={styles.tabsLockedCard}>
      <Text style={styles.tabsLockedTitle}>Your pattern is still forming</Text>
      <Text style={styles.tabsLockedBody}>
        Complete a few more sessions and record your answers to the pre- and post-session surveys to view Trends, Activity, and Notes here.
      </Text>
      {renderPartialSurveyToggle()}
    </View>
  );

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
            <Plus size={22} color={colors.white} />
            <Heart size={20} color={colors.white} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Progress</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn} accessibilityLabel="Highlights">
              <Sparkles size={20} color={colors.white} />
              <Heart size={20} color={colors.white} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={undefined}
              accessibilityLabel="Chat"
            >
              <MessageCircle size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} accessibilityLabel="Settings">
              <Settings size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.phaseTimelineCard}
          onPress={() => setIsJourneyExpanded((prev) => !prev)}
          activeOpacity={0.92}
        >
          <View style={styles.phaseTimelineHeaderRow}>
            <Text style={styles.phaseTimelineTitle}>My Journey</Text>
            <TouchableOpacity
              onPress={() => setIsJourneyExpanded((prev) => !prev)}
              activeOpacity={0.84}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isJourneyExpanded ? 'Collapse My Journey' : 'Expand My Journey'}
            >
              {isJourneyExpanded ? (
                <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
              ) : (
                <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.journeySummaryRow}>
            <Text style={styles.journeySummaryText}>
              {trendSessionCount === 0
                ? 'Start your journey by completing a Coherence Session!'
                : activePhaseIdx >= 3
                  ? "Great, You're in the Deep Practice level and among the top 1% of our practitioners!"
                  : activePhaseIdx >= 2
                    ? "Awesome! You're 30 sessions away from Deep Practice level. Keep practicing!"
                    : "Wow! You're only 15 sessions away from Habit level."}
            </Text>
          </View>
          {isJourneyExpanded ? (
            <>
              <View style={styles.phaseLineWrap}>
                <View style={styles.phaseBaseLine} />
                <View style={styles.phaseTimelineTrackRow}>
                  {['First Step', 'Seed', 'Habit', 'Deep Practice'].map((label, idx) => {
                  const isCompleted = idx < activePhaseIdx;
                  const isActive = idx === activePhaseIdx;
                  const isFuture = idx > activePhaseIdx;
                  return (
                    <View key={label} style={styles.phaseItemWrap}>
                      <View
                        style={[
                          styles.phaseNode,
                          isCompleted && styles.phaseNodeCompleted,
                          isActive && styles.phaseNodeActive,
                          isFuture && styles.phaseNodeFuture,
                        ]}
                      >
                        {isCompleted ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={2.8} />
                        ) : isActive ? (
                          <Heart size={11} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
                        ) : (
                          <Text style={styles.phasePendingDash}>-</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.phaseNodeLabel,
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
            </>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.collapsibleCard}
          onPress={() => setIsSnapshotExpanded((prev) => !prev)}
          activeOpacity={0.92}
        >
          <TouchableOpacity
            style={styles.collapsibleHeaderRow}
            onPress={() => setIsSnapshotExpanded((prev) => !prev)}
            activeOpacity={0.84}
          >
            <Text style={styles.collapsibleHeaderTitle}>Progress Snapshot</Text>
            {isSnapshotExpanded ? (
              <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
          {isSnapshotExpanded ? (
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
                <Text style={styles.snapshotCompactValue}>{snapshotCompact.coherence}</Text>
                <Text style={styles.snapshotCompactLabel}>Coherence</Text>
              </View>
              <View style={styles.snapshotCompactDivider} />
              <View style={styles.snapshotCompactItem}>
                <Text style={styles.snapshotCompactValue}>{snapshotCompact.points}</Text>
                <Text style={styles.snapshotCompactLabel}>Points</Text>
              </View>
              <View style={styles.snapshotCompactDivider} />
              <View style={styles.snapshotCompactItem}>
                <Text style={styles.snapshotCompactValue}>{snapshotCompact.streak}</Text>
                <Text style={styles.snapshotCompactLabel}>Streak</Text>
              </View>
            </LinearGradient>
          )}
        </TouchableOpacity>
        {shouldPrioritizeInsightsCard ? tabsSection : null}
        {trendSessionCount > 1 && !hasSurveyInsightsOptOutState ? (
          <ProgressSurveyDeltaCard averages={trendAverages} />
        ) : null}
        <View style={styles.milestoneActionCard}>
          <TouchableOpacity
            style={styles.milestoneHeaderRow}
            onPress={() => setIsMilestoneExpanded((prev) => !prev)}
            activeOpacity={0.84}
          >
            <Text style={styles.milestoneHeaderTitle}>{milestoneHeaderText}</Text>
            {isMilestoneExpanded ? (
              <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
          {isMilestoneExpanded ? (
            <>
              <ProgressMilestoneCard
                totalSessions={totalSessions}
                previewType={sciencePreviewType}
                milestoneState={
                  hasPartialSurveyOptOutData
                    ? 'partialSurveyOptOut'
                    : hasIncompleteOrInactiveSurveyData
                      ? 'inactiveSurvey'
                      : null
                }
                hideLeadingSessionCount
                onPress={() => setIsMilestoneExpanded((prev) => !prev)}
                embedded
              />
              {hasIncompleteOrInactiveSurveyData && !hasPartialSurveyOptOutData ? (
                renderInactiveSurveyToggle()
              ) : null}
              {hasPartialSurveyOptOutData ? renderPartialSurveyToggle() : null}
              {!hasSurveyInsightsOptOutState && shouldShowStartFirstSessionCta ? (
                <TouchableOpacity
                  style={styles.firstSessionBtn}
                  onPress={() => navigation.navigate('Measure')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.firstSessionBtnTxt}>Start first session</Text>
                </TouchableOpacity>
              ) : null}
              {!hasSurveyInsightsOptOutState && shouldShowKeepGoingCta ? (
                <TouchableOpacity
                  style={styles.firstSessionBtn}
                  onPress={() => navigation.navigate('Measure')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.firstSessionBtnTxt}>Keep going</Text>
                </TouchableOpacity>
              ) : null}
              {!hasSurveyInsightsOptOutState && shouldShowKeepRhythmCta ? (
                <TouchableOpacity
                  style={styles.firstSessionBtn}
                  onPress={() => navigation.navigate('Measure')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.firstSessionBtnTxt}>Keep your rhythm</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
        </View>
        {!shouldPrioritizeInsightsCard ? tabsSection : null}

        <TouchableOpacity
          style={styles.communityCardFrame}
          onPress={() => setIsCommunityExpanded((prev) => !prev)}
          activeOpacity={0.92}
        >
          <View
            style={styles.communityHeaderRow}
          >
            <Text style={styles.communityTitle}>Community Coherence Points</Text>
            <TouchableOpacity
              style={styles.communityToggleBtn}
              onPress={() => setIsCommunityExpanded((prev) => !prev)}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={isCommunityExpanded ? 'Collapse community card' : 'Expand community card'}
            >
              {isCommunityExpanded ? (
                <ChevronUp size={16} color="#E18B31" strokeWidth={2.4} />
              ) : (
                <ChevronDown size={16} color="#E18B31" strokeWidth={2.4} />
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
                <Text style={styles.communityToday}>Today</Text>
                <Text style={styles.communityBig}>2,623,382</Text>
                <View style={styles.commRule} />
                <Text style={styles.communitySub}>Highest Day Ever</Text>
                <Text style={styles.communityBig}>3,400,657</Text>
              </LinearGradient>
            ) : null}
        </TouchableOpacity>

        <View style={styles.editorialQuoteCard}>
          <Text style={styles.editorialQuoteText}>"{editorialQuote}"</Text>
        </View>
        <TouchableOpacity
          style={styles.sessionHistoryBtn}
          activeOpacity={0.88}
          onPress={() => {
            try {
              navigation.navigate('SessionHistory');
            } catch (error) {
              Alert.alert('Coming soon', 'Session history will be available here soon.');
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="My Session History"
        >
          <Text style={styles.sessionHistoryBtnTxt}>My Session History</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={Boolean(editingNote)} transparent animationType="fade" onRequestClose={() => setEditingNote(null)}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F3F5' },
  headerBg: {
    paddingBottom: 22,
    borderBottomLeftRadius: borderRadius.sheet,
    borderBottomRightRadius: borderRadius.sheet,
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
    marginBottom: spacing.xl,
  },
  communityHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: 10,
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
    alignItems: 'center',
  },
  communityToday: { fontFamily: PROGRESS_FONT_REGULAR, fontSize: 13, lineHeight: 26, color: '#FFFFFF' },
  communityBig: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 28,
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
  shareProgressBtn: {
    marginTop: spacing.md,
    marginBottom: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  shareProgressBtnGrad: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.52)',
  },
  shareProgressBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
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
    fontFamily: PROGRESS_FONT_MEDIUM,
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
    fontFamily: PROGRESS_FONT_MEDIUM,
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
    width: 116,
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
    backgroundColor: '#F6EAF5',
  },
  swipeDeleteBtn: {
    backgroundColor: '#FFEFF6',
  },
  modalBackdrop: {
    flex: 1,
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
  firstSessionBtn: {
    marginBottom: 0,
    marginTop: 4,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
  },
  phaseTimelineCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md,
  },
  phaseTimelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    marginBottom: 10,
  },
  journeySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 18,
    paddingVertical: 2,
  },
  journeySummaryText: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    fontWeight: '700',
    flexShrink: 1,
  },
  collapsibleCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
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
  milestoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 28,
    marginBottom: 10,
  },
  milestoneHeaderTitle: {
    flex: 1,
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    color: '#2C2C2E',
    fontWeight: '800',
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
    marginBottom: 10,
    marginTop: 2,
  },
  phaseBaseLine: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 14,
    height: 1,
    backgroundColor: 'rgba(52,37,61,0.18)',
  },
  phaseTimelineTrackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phaseItemWrap: {
    width: '24%',
    alignItems: 'center',
  },
  phaseNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: '#F1ECF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
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
  phasePendingDash: {
    color: '#171717AD',
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 13,
    marginTop: -1,
  },
  phaseNodeLabel: {
    marginTop: 8,
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    textAlign: 'center',
    minHeight: 24,
  },
  phaseNodeLabelCompleted: {
    color: '#171717AD',
  },
  phaseNodeLabelActive: {
    color: '#171717AD',
    fontFamily: PROGRESS_FONT_BOLD,
  },
  phaseNodeLabelFuture: {
    color: '#171717AD',
  },
  phaseTimelineSub: {
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#171717AD',
    fontSize: 13,
    lineHeight: 26,
  },
  milestoneActionCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: spacing.md + 2,
  },
  tabsSharedCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
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
    fontFamily: PROGRESS_FONT_MEDIUM,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    fontWeight: '600',
  },
  tabsLockedCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: spacing.md + 2,
  },
  tabsLockedTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '800',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  tabsLockedBody: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
  },
  toggleMicrocopy: {
    marginTop: 4,
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    color: '#1717177A',
  },
  toggleConfirmationText: {
    marginTop: 4,
    fontFamily: PROGRESS_FONT_MEDIUM,
    fontSize: 13,
    lineHeight: 26,
    color: '#2C9A5F',
    fontWeight: '600',
  },
  tabsLockedToggleSwitchRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 2,
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
    fontFamily: PROGRESS_FONT_MEDIUM,
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
    fontFamily: PROGRESS_FONT_MEDIUM,
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
  firstSessionBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  editorialQuoteCard: {
    alignSelf: 'stretch',
    marginBottom: 0,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: spacing.xl + 2,
    paddingVertical: spacing.xl + 6,
  },
  editorialQuoteText: {
    fontFamily: 'Sailec-RegularItalic',
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  editorialQuoteSource: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#171717',
    fontSize: 15,
    lineHeight: 26,
  },
});

import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { borderRadius, spacing } from '../theme';
import { getJourneyPhaseDetail } from '../utils/journeyPhase';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

function getProgressCopyFromPhase(detail) {
  const { levelKey, phaseState, sessions } = detail;

  if (levelKey === 'pro') {
    return {
      title: '',
      body: "You built a lasting rhythm. Your practice is now a dependable reset. This level of consistency reshapes how well you're improving by reducing stress and improving your energy and mood.",
    };
  }
  if (levelKey === 'deepPractice') {
    if (phaseState === 'start') {
      return {
        title: '',
        body: 'Welcome to Deep Practice! You are now in the highest level of consistency and calm.',
      };
    }
    return {
      title: '',
      body: "You're in Deep Practice. Every session now deepens your resilience, focus, and emotional balance.",
    };
  }
  if (levelKey === 'habit') {
    if (phaseState === 'start') {
      return {
        title: '',
        body: 'You have entered Habit level! Your consistency is becoming your strength. Keep going to earn your Habit badge.',
      };
    }
    if (phaseState === 'end') {
      return {
        title: '',
        body: "Excellent progress. You've completed Habit! Keep your rhythm strong as you step into Deep Practice.",
      };
    }
    const remaining = Math.max(1, 30 - sessions);
    return {
      title: '',
      body: `You are only ${remaining} session${remaining === 1 ? '' : 's'} away from completing this level and earning your Habit badge! Continue your journey!`,
    };
  }
  if (levelKey === 'seed') {
    if (phaseState === 'start') {
      return {
        title: '',
        body: 'You have entered Seed level! Keep your momentum going to earn your Seed badge.',
      };
    }
    if (phaseState === 'end') {
      return {
        title: '',
        body: "Great work. You've completed Seed! Keep going to strengthen your rhythm and unlock Habit.",
      };
    }
    const remaining = Math.max(1, 10 - sessions);
    return {
      title: '',
      body: `You are only ${remaining} session${remaining === 1 ? '' : 's'} away from completing this level and earning your Seed badge! Continue your journey!`,
    };
  }
  if (levelKey === 'foundation') {
    if (phaseState === 'start') {
      return {
        title: '',
        body: 'Start your journey by completing a Coherence Session!',
      };
    }
    if (phaseState === 'end') {
      return {
        title: '',
        body: 'Great work. Did you know deep breathing improves your sleep, mood & physiology? Keep going to receive your Foundation badge!',
      };
    }
    const remaining = Math.max(1, 5 - sessions);
    return {
      title: '',
      body: `You are only ${remaining} session${remaining === 1 ? '' : 's'} away from completing this level and earning your Foundation badge! Continue your journey!`,
    };
  }
  return {
    title: '',
    body: 'Keep practicing — your next milestone insight unlocks as your sessions add up.',
  };
}

function getProgressCopy(type, totalSessions) {
  if (type === 'inactiveSurvey') {
    return {
      title: '',
      body: 'Looks like you have completed Coherence Sessions but have not opted in for the session surveys. Tap on the toggle below to opt in and view the session insights.',
    };
  }
  if (type === 'partialSurveyOptOut') {
    return {
      title: '',
      body: 'You have prior survey data and continued sessions. But right now it looks like you have opted out of the surveys. Opt in for the surveys once again and answer them regularly to unlock your progress insights.',
    };
  }
  return getProgressCopyFromPhase(getJourneyPhaseDetail(totalSessions));
}

function splitSessionPrefix(title) {
  if (typeof title !== 'string') return { prefix: '', remainder: '' };
  const match = title.match(/^(\d+\s+sessions?(?:\s+completed)?\.)\s*(.*)$/i);
  if (!match) return { prefix: '', remainder: title };
  return {
    prefix: match[1],
    remainder: (match[2] || '').trim(),
  };
}

export default function ProgressMilestoneCard({
  totalSessions = 0,
  /** Sessions count used for level/sub-state (preview uses trendSessionCount). Defaults to totalSessions. */
  sessionPhaseCount,
  previewType = null,
  milestoneState = null,
  onPress,
  embedded = false,
  hideLeadingSessionCount = false,
}) {
  const phaseSessions = sessionPhaseCount ?? totalSessions;
  const phaseDetail = useMemo(() => getJourneyPhaseDetail(phaseSessions), [phaseSessions]);

  const copy = useMemo(() => {
    if (milestoneState) {
      return getProgressCopy(milestoneState, phaseSessions);
    }
    if (previewType === 'inactiveSurvey' || previewType === 'partialSurveyOptOut') {
      return getProgressCopy(previewType, phaseSessions);
    }
    return getProgressCopyFromPhase(phaseDetail);
  }, [milestoneState, previewType, phaseDetail, phaseSessions]);

  const splitTitle = useMemo(() => splitSessionPrefix(copy.title), [copy.title]);
  const renderedTitle = hideLeadingSessionCount
    ? splitTitle.remainder || copy.title
    : copy.title;

  return (
    <TouchableOpacity
      style={[styles.wrap, embedded && styles.wrapEmbedded]}
      onPress={onPress}
      activeOpacity={onPress ? 0.84 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? 'Cycle progress insight type' : undefined}
    >
      <View style={[styles.gradient, embedded && styles.gradientEmbedded]}>
        <View style={styles.textWrap}>
          {renderedTitle ? <Text style={styles.title}>{renderedTitle}</Text> : null}
          <Text style={styles.body}>{copy.body}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: borderRadius.lg,
    overflow: 'visible',
  },
  wrapEmbedded: {
    marginBottom: 0,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    backgroundColor: '#F8F8FA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 4,
  },
  gradientEmbedded: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  textWrap: {
    gap: 6,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    fontSize: 15,
    lineHeight: 26,
    color: '#171717',
    fontWeight: '800',
  },
  body: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 13,
    lineHeight: 26,
    color: '#171717',
    fontWeight: '600',
  },
});

import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { borderRadius, spacing } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

function getProgressType(totalSessions) {
  if (totalSessions >= 100) return 'pro';
  if (totalSessions >= 17) return 'advanced';
  if (totalSessions >= 5) return 'building';
  if (totalSessions >= 1) return 'firstTime';
  return 'zero';
}

function minSessionsForType(type) {
  if (type === 'pro') return 100;
  if (type === 'advanced') return 17;
  if (type === 'building') return 5;
  if (type === 'firstTime') return 1;
  return 0;
}

function getProgressCopy(type, totalSessions) {
  if (type === 'inactiveSurvey') {
    return {
      title: '',
      body: 'You have session activity, but pre- and post-session survey answers are missing. Opt in to unlock Trends, Practice Days, and Notes insights.',
    };
  }
  if (type === 'partialSurveyOptOut') {
    return {
      title: '',
      body: 'You have prior survey data and continued sessions. But right now it looks like you have opted out of the surveys. Opt-in for the surveys once again and answer them regularly to unlock your progress insights.',
    };
  }
  if (type === 'zero') {
    return {
      title: '',
      body: 'Your journey starts here. Take your first Coherence Session and complete the survey to start seeing progress insights here.',
    };
  }
  if (type === 'pro') {
    return {
      title: '',
      body: "You built a lasting rhythm. Your practice is now a dependable reset. This level of consistency reshapes how well you've improved in terms of reducing stress, and improvng your energy & mood.",
    };
  }
  if (type === 'advanced') {
    return {
      title: '',
      body: 'Your Practice Days are forming a clear pattern. Calmer stress response, steadier energy, and better emotional recovery.',
    };
  }
  if (type === 'building') {
    return {
      title: '',
      body: 'The momentum is building. You are beginning to establish a pattern! Continue to attend more Coherence Sessions and complete the surveys to start seeing your progress here.',
    };
  }
  return {
    title: '',
    body: 'You did it! First session complete. One session is a real beginning. Continue to attend more Coherence Sessions and complete the surveys to start seeing your progress here.',
  };
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
  previewType = null,
  milestoneState = null,
  onPress,
  embedded = false,
  hideLeadingSessionCount = false,
}) {
  const activeType = milestoneState || previewType || getProgressType(totalSessions);
  const copy = useMemo(() => getProgressCopy(activeType, totalSessions), [activeType, totalSessions]);
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
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  gradientEmbedded: {
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 12,
  },
  textWrap: {
    gap: 4,
    paddingRight: 0,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2C2C2E',
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '800',
    flexShrink: 1,
  },
  body: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: '#171717',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '500',
    flexShrink: 1,
  },
});

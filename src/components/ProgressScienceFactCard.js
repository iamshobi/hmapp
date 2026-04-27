import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { borderRadius, spacing } from '../theme';

function getScienceType(totalSessions) {
  if (totalSessions >= 100) return 'pro';
  if (totalSessions >= 10) return 'growing';
  return 'firstTime';
}

function getScienceCopy(type) {
  if (type === 'pro') {
    return {
      title: 'Science:',
      body: 'At 100+ sessions, sustained coherence practice has been linked to measurable changes in baseline HRV, reduced cortisol rhythms, and enhanced emotional regulation that persists outside of practice sessions.',
    };
  }
  if (type === 'growing') {
    return {
      title: 'Science:',
      body: 'Users at 15 sessions report an average 23% reduction in perceived stress. Your heart rate variability is measurably improving. Your brain is literally building new pathways for calm.',
    };
  }
  return {
    title: 'Science:',
    body: 'In as little as 90 seconds of heart coherence, your body begins switching from fight-or-flight to rest-and-digest. You just gave yourself that gift.',
  };
}

export default function ProgressScienceFactCard({ totalSessions = 0, previewType = null, onPress }) {
  const activeType = previewType || getScienceType(totalSessions);
  const copy = useMemo(() => getScienceCopy(activeType), [activeType]);

  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? 'Cycle science insight type' : undefined}
    >
      <View style={styles.gradient}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(166,76,138,0.12)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  textWrap: {
    gap: 7,
    paddingRight: spacing.sm,
  },
  title: {
    color: '#A64C8A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  body: {
    color: 'rgba(52,37,61,0.8)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});


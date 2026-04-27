import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../theme';

function normalizeType(type) {
  if (type === 'growing') return 'building';
  return type;
}

function getTypeFromSessions(totalSessions) {
  if (totalSessions >= 100) return 'pro';
  if (totalSessions >= 17) return 'advanced';
  if (totalSessions >= 5) return 'building';
  if (totalSessions >= 1) return 'firstTime';
  return 'zero';
}

function pad2(v) {
  return String(v).padStart(2, '0');
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

function previewByType(type) {
  if (type === 'pro') return { coherence: 4.8, points: 210, durationSec: 494, bpm: 65, streak: 42, sessions: 127 };
  if (type === 'advanced') return { coherence: 3.1, points: 110, durationSec: 356, bpm: 69, streak: 14, sessions: 17 };
  if (type === 'building') return { coherence: 2.4, points: 75, durationSec: 273, bpm: 72, streak: 5, sessions: 5 };
  if (type === 'firstTime') return { coherence: 1.7, points: 40, durationSec: 136, bpm: 83, streak: 1, sessions: 1 };
  return { coherence: 0.0, points: 0, durationSec: 0, bpm: 0, streak: 0, sessions: 0 };
}

function MetricTile({ label, value, color, bg }) {
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function ProgressSessionMetricsCard({
  totalSessions = 0,
  streak = 0,
  coherencePoints = 0,
  previewType = null,
}) {
  const activeType = normalizeType(previewType) || getTypeFromSessions(totalSessions);
  const p = previewByType(activeType);
  const usePreview = Boolean(previewType);
  const safeSessions = usePreview ? p.sessions : totalSessions;
  const pointsEarned = usePreview ? p.points : coherencePoints;
  const streakDays = usePreview ? p.streak : streak;

  const title = useMemo(() => {
    if (activeType === 'pro') return '☀️ 127 Sessions · Session Metrics';
    if (activeType === 'advanced') return '🟢 17 Sessions · Session Metrics';
    if (activeType === 'building') return '💪 5 Sessions · Session Metrics';
    if (activeType === 'firstTime') return '🎉 First Session · Session Metrics';
    return '';
  }, [activeType]);

  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.grid}>
        <MetricTile label="Points Earned" value={String(Math.round(pointsEarned))} color="#E0A100" bg="#F3F0E8" />
        <MetricTile label="Day Streak" value={`${Math.round(streakDays)} days 🔥`} color="#F57C00" bg="#F2E9E6" />
        <MetricTile label="Total Sessions" value={String(Math.round(safeSessions))} color="#5650E3" bg="#E8E9F4" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
  },
  title: {
    color: '#6A247B',
    fontSize: 29 / 2,
    lineHeight: 19,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 68,
  },
  tileLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(52,37,61,0.7)',
    marginBottom: 4,
  },
  tileValue: {
    fontSize: 32 / 2,
    lineHeight: 20,
    fontWeight: '800',
  },
});

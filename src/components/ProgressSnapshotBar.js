import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Zap, Flame, Heart, Timer } from 'lucide-react-native';
import { spacing } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Light';
const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

function normalizeType(type) {
  if (type === 'growing') return 'building';
  return type;
}

function getSnapshotForType(type) {
  const t = normalizeType(type);
  if (t === 'inactiveSurvey') {
    return { sessions: 12, streak: 4, coherence: 2.8 };
  }
  if (t === 'partialSurveyOptOut') {
    return { sessions: 18, streak: 6, coherence: 3.0 };
  }
  if (t === 'pro') {
    return { sessions: 100, streak: 14, coherence: 4.8 };
  }
  if (t === 'advanced') {
    return { sessions: 17, streak: 7, coherence: 3.1 };
  }
  if (t === 'building') {
    return { sessions: 5, streak: 3, coherence: 2.3 };
  }
  if (t === 'firstTime') {
    return { sessions: 1, streak: 1, coherence: 1.7 };
  }
  return { sessions: 0, streak: 0, coherence: 0.0 };
}

function getTypeFromTotalSessions(totalSessions) {
  if (totalSessions >= 100) return 'pro';
  if (totalSessions >= 17) return 'advanced';
  if (totalSessions >= 5) return 'building';
  if (totalSessions >= 1) return 'firstTime';
  return 'zero';
}

function getCoherenceFromSessions(totalSessions) {
  if (totalSessions >= 100) return 4.8;
  if (totalSessions >= 17) return 3.1;
  if (totalSessions >= 5) return 2.3;
  if (totalSessions >= 1) return 1.7;
  return 0.0;
}

function CoherenceDonut({ value = 0 }) {
  const size = 92;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(5, Number(value) || 0));
  const progress = normalized / 5;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size} style={styles.donutSvg}>
        <Defs>
          <SvgLinearGradient id="coherenceRingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF5E9A" />
            <Stop offset="52%" stopColor="#FF8A2C" />
            <Stop offset="100%" stopColor="#8A46D9" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,235,173,0.35)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#coherenceRingGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutValue}>{value}</Text>
        <Text style={styles.donutLabel}>coherence</Text>
      </View>
    </View>
  );
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0));
  if (safe <= 0) return '-';
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ProgressSnapshotBar({
  totalSessions = 0,
  streak = 0,
  totalMinutes = 0,
  coherencePoints = 0,
  previewType = null,
}) {
  const activeType = previewType || getTypeFromTotalSessions(totalSessions);
  const snapshot = getSnapshotForType(activeType);
  const sessionsValue = previewType ? snapshot.sessions : totalSessions;
  const streakValue = previewType ? snapshot.streak : streak;
  const coherence = (previewType ? snapshot.coherence : getCoherenceFromSessions(totalSessions)).toFixed(1);
  const avgSessionSeconds =
    sessionsValue > 0
      ? ((previewType ? snapshot.sessions * 195 : totalMinutes * 60) / Math.max(1, sessionsValue))
      : 0;
  const coherencePointsValue = previewType
    ? activeType === 'pro'
      ? 210
      : activeType === 'advanced'
        ? 110
        : activeType === 'inactiveSurvey'
          ? 92
          : activeType === 'partialSurveyOptOut'
            ? 128
        : activeType === 'building'
          ? 75
          : activeType === 'firstTime'
            ? 40
            : 0
    : Math.max(0, Math.round(coherencePoints));
  const isZeroState = activeType === 'zero' || (!previewType && totalSessions <= 0);
  const sessionsDisplay = isZeroState ? '-' : sessionsValue;
  const streakDisplay = isZeroState ? '-' : streakValue;
  const coherenceDisplay = isZeroState ? '-' : coherence;
  const sessionsCompletedDisplay = isZeroState ? '-' : sessionsValue;
  const avgSessionDisplay = isZeroState ? '-' : formatDuration(avgSessionSeconds);
  const coherencePointsDisplay = isZeroState ? '-' : coherencePointsValue;

  return (
    <LinearGradient
      colors={['#FFA70B', '#FF8B2C', '#E55AA9']}
      start={{ x: 0.05, y: 0.1 }}
      end={{ x: 0.95, y: 0.95 }}
      style={styles.wrap}
    >
      <View style={styles.leftCol}>
        <CoherenceDonut value={coherenceDisplay} />
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricTile}>
          <Zap size={12} color="#FFFFFF" />
          <Text style={styles.tileValue}>{coherencePointsDisplay}</Text>
          <Text style={styles.tileLabel}>Points</Text>
        </View>

        <View style={styles.metricTile}>
          <Heart size={12} color="#FFFFFF" />
          <Text style={styles.tileValue}>{sessionsCompletedDisplay}</Text>
          <Text style={styles.tileLabel}>sessions completed</Text>
        </View>

        <View style={styles.metricTile}>
          <Timer size={12} color="#FFFFFF" />
          <Text style={styles.tileValue}>{avgSessionDisplay}</Text>
          <Text style={styles.tileLabel}>session length</Text>
        </View>

        <View style={styles.metricTile}>
          <Flame size={12} color="#FFFFFF" />
          <Text style={styles.tileValue}>{streakDisplay === '-' ? '-' : `${streakDisplay}d`}</Text>
          <Text style={styles.tileLabel}>streak</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: spacing.md,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  leftCol: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
  },
  donutWrap: {
    width: 92,
    height: 92,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutSvg: {
    position: 'absolute',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  donutValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFF2CC',
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '800',
  },
  donutLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#FFF1D3',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  metricGrid: {
    flex: 1,
    marginLeft: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  metricTile: {
    width: '48.5%',
    minHeight: 74,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(61,28,73,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    justifyContent: 'center',
  },
  tileValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  tileLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#FFF3DE',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    marginTop: 1,
  },
});


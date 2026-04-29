import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Zap, Flame, Heart, Timer } from 'lucide-react-native';
import { spacing } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
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
  const size = 100;
  const stroke = 9;
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
            <Stop offset="0%" stopColor="#E14986" />
            <Stop offset="52%" stopColor="#D96F1D" />
            <Stop offset="100%" stopColor="#7239C3" />
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
  const glowDots = useMemo(() => {
    const sessionsFactor = Math.min(1, sessionsValue / 120);
    const coherenceFactor = Math.min(1, (Number(coherenceDisplay) || 0) / 5);
    const intensity = Math.max(0, Math.min(1, sessionsFactor * 0.55 + coherenceFactor * 0.45));
    const dotCount = 6 + Math.round(intensity * 18);

    // Deterministic pseudo-random generator so dots stay stable per state.
    let seed = Math.round(sessionsValue * 31 + (Number(coherenceDisplay) || 0) * 137 + 73);
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const dots = [];
    let attempts = 0;
    while (dots.length < dotCount && attempts < dotCount * 16) {
      attempts += 1;
      const x = 8 + rand() * 84; // %
      const y = 8 + rand() * 84; // %

      // Keep middle area (donut) and bottom label zone visually clear.
      const inDonutCore = x > 24 && x < 76 && y > 16 && y < 72;
      const inLabelZone = y > 82;
      if (inDonutCore || inLabelZone) continue;

      dots.push({
        left: `${x}%`,
        top: `${y}%`,
        size: 2 + rand() * 4.5,
        opacity: 0.2 + rand() * 0.45,
      });
    }
    return dots;
  }, [coherenceDisplay, sessionsValue]);

  return (
    <LinearGradient
      colors={['#F6A400', '#F18A1F', '#EB6A33']}
      start={{ x: 0.05, y: 0.1 }}
      end={{ x: 0.95, y: 0.95 }}
      style={styles.wrap}
    >
      <View style={styles.columnsRow}>
        <View style={styles.leftColumn}>
          <View style={styles.donutTile}>
            <View pointerEvents="none" style={styles.glowDotsLayer}>
              {glowDots.map((dot, idx) => (
                <View
                  key={`glow-dot-${idx}`}
                  style={[
                    styles.glowDot,
                    {
                      left: dot.left,
                      top: dot.top,
                      width: dot.size,
                      height: dot.size,
                      opacity: dot.opacity,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.donutCenterWrap}>
              <CoherenceDonut value={coherenceDisplay} />
            </View>
            <Text style={styles.donutColumnLabel}>{'Your\nCoherence'}</Text>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <View style={[styles.metricsGridRow, styles.metricsGridRowTop]}>
            <View style={[styles.metricTile, styles.gridMetricTile]}>
              <View style={styles.metricIconWrap}>
                <Zap size={13} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.tileValue}>{coherencePointsDisplay}</Text>
              <Text style={styles.tileLabel}>{'coherence\npoints'}</Text>
            </View>
            <View style={[styles.metricTile, styles.gridMetricTile]}>
              <View style={styles.metricIconWrap}>
                <Flame size={13} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.tileValue}>{streakDisplay}</Text>
              <Text style={styles.tileLabel}>{'day\nstreak'}</Text>
            </View>
          </View>

          <View style={styles.metricsGridRow}>
            <View style={[styles.metricTile, styles.gridMetricTile]}>
              <View style={styles.metricIconWrap}>
                <Timer size={13} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.tileValue}>{avgSessionDisplay}</Text>
              <Text style={styles.tileLabel}>{'session\nlength'}</Text>
            </View>

            <View style={[styles.metricTile, styles.gridMetricTile]}>
              <View style={styles.metricIconWrap}>
                <Heart size={13} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.tileValue}>{sessionsCompletedDisplay}</Text>
              <Text style={styles.tileLabel}>{'sessions\ndone'}</Text>
            </View>
          </View>
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
    alignItems: 'stretch',
  },
  columnsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 6,
  },
  leftColumn: {
    width: '34%',
    alignSelf: 'stretch',
  },
  rightColumn: {
    width: '66%',
  },
  donutTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    position: 'relative',
    overflow: 'hidden',
  },
  glowDotsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  glowDot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  donutCenterWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
  },
  donutValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFF2CC',
    fontSize: 25,
    lineHeight: 26,
    fontWeight: '800',
  },
  donutColumnLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#FFF1D3',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    position: 'absolute',
    bottom: 10,
    zIndex: 2,
  },
  metricsGridRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  metricsGridRowTop: {
    marginBottom: 6,
  },
  metricTile: {
    minHeight: 74,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  gridMetricTile: {
    flex: 1,
  },
  metricIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  tileValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  tileLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 26,
    fontWeight: '500',
    marginTop: 1,
    width: '100%',
    textAlign: 'left',
  },
});


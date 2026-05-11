import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Zap, Flame, Heart, Timer } from 'lucide-react-native';
import { spacing, palette } from '../theme';

const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';
const SNAPSHOT_ACCENT = '#C26D1A';
const SNAPSHOT_TEXT = '#FFFFFF';
const SNAPSHOT_SUBTEXT = '#FFFFFF';
const SNAPSHOT_TEXT_MUTED = 'rgba(255,255,255,0.62)';
/** Matches Progress Snapshot collapsed row (`ProgressMainScreen` snapshotCompactRow). */
const SNAPSHOT_PANEL_GRADIENT = ['#F6A400', '#F18A1F', '#EB6A33'];
const SNAPSHOT_PANEL_GRADIENT_START = { x: 0.05, y: 0.1 };
const SNAPSHOT_PANEL_GRADIENT_END = { x: 0.95, y: 0.95 };
/** Frosted glass fill + border shared by coherence column + metric tiles */
const SNAPSHOT_GLASS_SURFACE_BG = 'rgba(255,255,255,0.2)';
const SNAPSHOT_GLASS_SURFACE_BORDER = 'rgba(255,255,255,0.46)';
const SNAPSHOT_GLASS_SURFACE_SHADOW = {
  shadowColor: '#E18B31',
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 10,
  elevation: 1,
};

/** Decorative dots around the coherence donut — white; opacity varies per dot */
const COHERENCE_GLOW_DOT_COLOR = '#FFFFFF';

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
  if (t === 'deepPractice') {
    return { sessions: 35, streak: 10, coherence: 3.35 };
  }
  if (t === 'habit' || t === 'advanced') {
    return { sessions: 18, streak: 6, coherence: 3.0 };
  }
  if (t === 'seed') {
    return { sessions: 8, streak: 4, coherence: 2.45 };
  }
  if (t === 'foundation') {
    return { sessions: 3, streak: 2, coherence: 1.85 };
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
  const n = Math.max(0, Math.floor(Number(totalSessions) || 0));
  if (n >= 100) return 'pro';
  if (n >= 31) return 'deepPractice';
  if (n >= 11) return 'habit';
  if (n >= 6) return 'seed';
  if (n >= 2) return 'building';
  if (n >= 1) return 'firstTime';
  return 'zero';
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

function previewCoherencePointsForType(activeType) {
  switch (activeType) {
    case 'pro':
      return 210;
    case 'deepPractice':
      return 158;
    case 'habit':
    case 'advanced':
      return 122;
    case 'seed':
      return 86;
    case 'foundation':
      return 54;
    case 'inactiveSurvey':
      return 92;
    case 'partialSurveyOptOut':
      return 128;
    case 'building':
      return 75;
    case 'firstTime':
      return 40;
    default:
      return 0;
  }
}

function CoherenceCircle({ value }) {
  const numeric =
    value === '-' || value === undefined || value === null ? NaN : Number(String(value).replace(/,/g, ''));
  const isEmpty = !Number.isFinite(numeric);
  const size = 92;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const ringGradient = isEmpty
    ? ['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.28)']
    : numeric >= 3
      ? [palette.hmAppBlue, palette.hmAppGreen]
      : numeric >= 2
        ? [palette.hmBrandMagenta, palette.hmAppBlue]
        : numeric >= 1
          ? [palette.hmBrandPurple, palette.hmBrandMagenta]
          : [palette.hmBrandPurple, palette.hmBrandMagenta];
  const gradientId = 'coherenceRingGradient';

  return (
    <View style={[styles.coherenceDonutWrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.coherenceDonutSvg}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={ringGradient[0]} />
            <Stop offset="100%" stopColor={ringGradient[1]} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 239, 214, 0.6)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <Text style={[styles.coherenceCircleValue, isEmpty && styles.coherenceCircleValueMuted]}>{value}</Text>
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
    ? previewCoherencePointsForType(normalizeType(activeType))
    : Math.max(0, Math.round(coherencePoints));
  const isZeroState = activeType === 'zero' || (!previewType && totalSessions <= 0);
  const streakDisplay = isZeroState ? '-' : streakValue;
  const coherenceDisplay = isZeroState ? '-' : coherence;
  const sessionsCompletedDisplay = isZeroState ? '-' : sessionsValue;
  const avgSessionDisplay = isZeroState ? '-' : formatDuration(avgSessionSeconds);
  const coherencePointsDisplay = isZeroState ? '-' : coherencePointsValue;
  const glowDotColor = COHERENCE_GLOW_DOT_COLOR;
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

      // Keep center (coherence ring) and top label zone visually clear.
      // Circular exclusion prevents sparkles from appearing as distorted fill.
      const dx = x - 50;
      const dy = y - 55;
      const inCoherenceCore = Math.sqrt(dx * dx + dy * dy) < 30;
      const inLabelZone = y < 30;
      if (inCoherenceCore || inLabelZone) continue;

      dots.push({
        left: `${x}%`,
        top: `${y}%`,
        size: 3.5 + rand() * 5.5,
        opacity: 0.38 + rand() * 0.42,
      });
    }
    return dots;
  }, [coherenceDisplay, sessionsValue]);

  return (
    <LinearGradient
      colors={SNAPSHOT_PANEL_GRADIENT}
      start={SNAPSHOT_PANEL_GRADIENT_START}
      end={SNAPSHOT_PANEL_GRADIENT_END}
      style={styles.wrapBorder}
    >
      <LinearGradient
        colors={SNAPSHOT_PANEL_GRADIENT}
        start={SNAPSHOT_PANEL_GRADIENT_START}
        end={SNAPSHOT_PANEL_GRADIENT_END}
        style={styles.wrapInner}
      >
        <View style={styles.columnsRow}>
          <View style={styles.leftColumn}>
            <View style={styles.coherenceTile}>
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
                        backgroundColor: glowDotColor,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.coherenceColumnLabel}>{'Current\nCoherence'}</Text>
              <View style={styles.coherenceCircleWrap} pointerEvents="box-none">
                <CoherenceCircle value={coherenceDisplay} />
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={[styles.metricsGridRow, styles.metricsGridRowTop]}>
              <View style={[styles.metricTile, styles.gridMetricTile]}>
                <View style={styles.metricIconWrap}>
                  <Zap size={13} color={SNAPSHOT_ACCENT} strokeWidth={2.2} />
                </View>
                <Text style={styles.tileValue}>{coherencePointsDisplay}</Text>
                <Text style={styles.tileLabel}>{'coherence\npoints'}</Text>
              </View>
              <View style={[styles.metricTile, styles.gridMetricTile]}>
                <View style={styles.metricIconWrap}>
                  <Flame size={13} color={SNAPSHOT_ACCENT} strokeWidth={2.2} />
                </View>
                <Text style={styles.tileValue}>{streakDisplay}</Text>
                <Text style={styles.tileLabel}>{'day\nstreak'}</Text>
              </View>
            </View>

            <View style={styles.metricsGridRow}>
              <View style={[styles.metricTile, styles.gridMetricTile]}>
                <View style={styles.metricIconWrap}>
                  <Timer size={13} color={SNAPSHOT_ACCENT} strokeWidth={2.2} />
                </View>
                <Text style={styles.tileValue}>{avgSessionDisplay}</Text>
                <Text style={styles.tileLabel}>{'session\nlength'}</Text>
              </View>
              <View style={[styles.metricTile, styles.gridMetricTile]}>
                <View style={styles.metricIconWrap}>
                  <Heart size={13} color={SNAPSHOT_ACCENT} strokeWidth={2.2} />
                </View>
                <Text style={styles.tileValue}>{sessionsCompletedDisplay}</Text>
                <Text style={styles.tileLabel}>{'total\nsessions'}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapBorder: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: spacing.md,
    borderRadius: 24,
    padding: 1,
  },
  wrapInner: {
    borderRadius: 23,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
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
  coherenceTile: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 190,
    backgroundColor: SNAPSHOT_GLASS_SURFACE_BG,
    borderWidth: 1,
    borderColor: SNAPSHOT_GLASS_SURFACE_BORDER,
    position: 'relative',
    overflow: 'hidden',
    ...SNAPSHOT_GLASS_SURFACE_SHADOW,
  },
  glowDotsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  glowDot: {
    position: 'absolute',
    borderRadius: 999,
  },
  /** Fills tile; centers donut in the block (title is separate, absolute top). */
  coherenceCircleWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  coherenceDonutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coherenceDonutSvg: {
    position: 'absolute',
  },
  coherenceCircleValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: SNAPSHOT_TEXT,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  coherenceCircleValueMuted: {
    color: SNAPSHOT_TEXT_MUTED,
    textShadowColor: 'transparent',
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
  },
  coherenceColumnLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: SNAPSHOT_SUBTEXT,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    textAlign: 'center',
    position: 'absolute',
    top: 12,
    left: 6,
    right: 6,
    zIndex: 4,
  },
  metricsGridRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  metricsGridRowTop: {
    marginBottom: 6,
  },
  metricTile: {
    minHeight: 74,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: SNAPSHOT_GLASS_SURFACE_BG,
    borderWidth: 1,
    borderColor: SNAPSHOT_GLASS_SURFACE_BORDER,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    ...SNAPSHOT_GLASS_SURFACE_SHADOW,
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
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.25)',
  },
  tileValue: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  tileLabel: {
    fontFamily: PROGRESS_FONT_MEDIUM,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 1,
    width: '100%',
    textAlign: 'left',
  },
});


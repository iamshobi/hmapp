import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useMysession } from '../context/mysessionContext';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_MEDIUM = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

const FIGMA = {
  headerHeight: 146,
  topNavY: 24,
  backLeft: 11,
  titleLeft: 37,
  titleTop: 74,
  listInset: 11,
  introLeftOffsetFromList: 20, // 11 + 20 = 31px
  introTop: 30, // 146 + 30 = 176px
  introToFirstCardGap: 25,
  cardHeight: 70,
  cardGap: 10,
  cardRadius: 5,
  cardHorizontalPadding: 20,
};

function getCoherenceFromSessions(totalSessions) {
  const n = Math.max(0, Number(totalSessions) || 0);
  if (n >= 100) return 4.8;
  if (n >= 31) return 3.35;
  if (n >= 11) return 3.1;
  if (n >= 6) return 2.45;
  if (n >= 1) return 1.85;
  return 0.0;
}

function getOrdinal(day) {
  const v = day % 100;
  if (v >= 11 && v <= 13) return `${day}th`;
  if (day % 10 === 1) return `${day}st`;
  if (day % 10 === 2) return `${day}nd`;
  if (day % 10 === 3) return `${day}rd`;
  return `${day}th`;
}

function formatSessionLengthLabel(seconds, isPartial = false) {
  const safe = Math.max(0, Math.round(seconds || 0));
  const mins = Math.max(1, Math.round(safe / 60));
  return `${mins} mins ${isPartial ? 'partial session' : 'session'}`;
}

function formatHistoryDateTime(value, isPartial = false) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Recently';
  const time = d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase()
    .replace(' ', '');
  const day = getOrdinal(d.getDate());
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${time}, ${day} ${month}`;
}

function deriveCoherence(entry, fallback) {
  const stress = Number(entry?.stressAfter);
  const energy = Number(entry?.energyAfter);
  const mood = Number(entry?.moodAfter);
  if (!Number.isFinite(stress) || !Number.isFinite(energy) || !Number.isFinite(mood)) {
    return fallback;
  }
  const normalized = ((11 - stress) + energy + mood) / 3;
  return Math.max(1, Math.min(5, normalized / 2)).toFixed(1);
}

export default function SessionHistoryScreen() {
  const navigation = useNavigation();
  const { totalSessions, totalMinutes, coherencePoints, surveyResults, lastSessionDate } = useMysession();

  const rows = useMemo(() => {
    const results = Array.isArray(surveyResults) ? surveyResults : [];
    const completedCount = Math.min(totalSessions, results.length);
    const partialCount = Math.max(0, totalSessions - completedCount);
    const avgSeconds = totalSessions > 0 ? (Math.max(0, Number(totalMinutes) || 0) * 60) / totalSessions : 0;
    const avgPoints = totalSessions > 0 ? Math.max(60, Math.round((Number(coherencePoints) || 0) / totalSessions)) : 120;
    const avgCoherence = getCoherenceFromSessions(totalSessions).toFixed(1);

    const completedRows = results.slice(0, completedCount).map((entry, idx) => ({
      id: `completed-${idx}-${entry?.at || 'na'}`,
      sessionLabel: formatSessionLengthLabel(avgSeconds, false),
      timeLabel: formatHistoryDateTime(entry?.at, false),
      coherence: deriveCoherence(entry, avgCoherence),
      points: Math.max(80, Math.round((deriveCoherence(entry, avgCoherence) || avgCoherence) * 55)),
      state: 'Completed',
    }));

    const baseDate = lastSessionDate ? new Date(lastSessionDate) : new Date();
    const partialRows = Array.from({ length: partialCount }).map((_, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - (idx + 1));
      const partialCoherence = Math.max(1, Number(avgCoherence) - 0.2).toFixed(1);
      return {
        id: `partial-${idx}`,
        sessionLabel: formatSessionLengthLabel(Math.max(0, avgSeconds * 0.7), true),
        timeLabel: formatHistoryDateTime(d.toISOString(), true),
        points: Math.max(60, Math.round(avgPoints * 0.7)),
        coherence: partialCoherence,
        state: 'Partial',
      };
    });

    return [...completedRows, ...partialRows];
  }, [coherencePoints, lastSessionDate, surveyResults, totalMinutes, totalSessions]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F6A400', '#F18A1F', '#EB6A33']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.84}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Session History</Text>
      </LinearGradient>

      <View style={styles.contentWrap}>
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>Here are your past sessions.</Text>
        {rows.map((row) => (
          <View key={row.id} style={styles.rowCard}>
            <View style={styles.leftCol}>
              <Text style={styles.sessionLabel}>{row.sessionLabel}</Text>
              <Text style={styles.sessionMeta}>{row.timeLabel}</Text>
            </View>
            <View style={styles.rightCol}>
              <Text style={styles.metricLine}>{row.coherence} coherence</Text>
              <Text style={styles.metricLine}>{row.points.toLocaleString('en-US')} points</Text>
            </View>
          </View>
        ))}
        {rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No sessions yet. Start your first session to build history.</Text>
          </View>
        ) : null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: FIGMA.headerHeight,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: FIGMA.backLeft,
    top: FIGMA.topNavY,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    left: FIGMA.titleLeft,
    top: FIGMA.titleTop,
    fontFamily: PROGRESS_FONT_MEDIUM,
    fontSize: 32,
    lineHeight: 35,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contentWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
  },
  listContent: {
    paddingHorizontal: FIGMA.listInset,
    paddingTop: FIGMA.introTop,
    paddingBottom: 24,
    gap: FIGMA.cardGap,
  },
  introText: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2C2C2E',
    fontSize: 14,
    lineHeight: 26,
    fontWeight: '800',
    marginBottom: FIGMA.introToFirstCardGap,
    paddingLeft: FIGMA.introLeftOffsetFromList,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: FIGMA.cardRadius,
    minHeight: FIGMA.cardHeight,
    paddingVertical: 12,
    paddingHorizontal: FIGMA.cardHorizontalPadding,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  leftCol: {
    flex: 1,
    paddingRight: 8,
  },
  rightCol: {
    minWidth: 126,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sessionLabel: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0,0,0,0.69)',
    letterSpacing: -0.14,
    fontWeight: '400',
  },
  sessionMeta: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(0,0,0,0.69)',
    letterSpacing: -0.14,
  },
  metricLine: {
    fontFamily: PROGRESS_FONT_REGULAR,
    fontSize: 16,
    lineHeight: 22,
    color: '#E2513A',
    textAlign: 'right',
    letterSpacing: -0.14,
  },
  emptyWrap: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  emptyText: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: 'rgba(0,0,0,0.69)',
    fontSize: 16,
    lineHeight: 22,
  },
});

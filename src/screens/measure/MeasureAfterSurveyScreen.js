import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useBreathGarden } from '../../context/BreathGardenContext';
import { spacing } from '../../theme';

const METRICS = [
  { key: 'stress', title: 'Stress', left: 'Low stress', right: 'High stress' },
  { key: 'energy', title: 'Energy', left: 'Drained', right: 'Energized' },
  { key: 'mood', title: 'Mood', left: 'Feel bad', right: 'Feel good' },
];

function avg(rows = [], key) {
  const vals = rows.map((r) => r?.[key]).filter((v) => Number.isFinite(v));
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export default function MeasureAfterSurveyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { recordSessionSurveyAfter, surveyResults } = useBreathGarden();
  const [scores, setScores] = useState({ stress: null, energy: null, mood: null });
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const notesInputRef = useRef(null);
  const allSelected = useMemo(
    () => scores.stress != null && scores.energy != null && scores.mood != null,
    [scores]
  );

  const saveAndViewInsights = () => {
    if (!allSelected) return;
    const created = recordSessionSurveyAfter(scores);
    const nextCount = (Array.isArray(surveyResults) ? surveyResults.length : 0) + 1;
    if (!created) return;

    const thisSession = {
      stressBefore: created.stressBefore,
      stressAfter: created.stressAfter,
      energyBefore: created.energyBefore,
      energyAfter: created.energyAfter,
      moodBefore: created.moodBefore,
      moodAfter: created.moodAfter,
    };

    const withNew = [created, ...(Array.isArray(surveyResults) ? surveyResults : [])];
    const averagesPayload = {
      stressBefore: avg(withNew, 'stressBefore'),
      stressAfter: avg(withNew, 'stressAfter'),
      energyBefore: avg(withNew, 'energyBefore'),
      energyAfter: avg(withNew, 'energyAfter'),
      moodBefore: avg(withNew, 'moodBefore'),
      moodAfter: avg(withNew, 'moodAfter'),
    };

    let params = {
      variant: 'firstTime',
      sessionCount: nextCount,
      ...thisSession,
    };
    if (nextCount >= 100) {
      params = {
        variant: 'pro',
        sessionCount: nextCount,
        averages: averagesPayload,
        ...thisSession,
      };
    } else if (nextCount >= 10) {
      params = {
        variant: 'beginner',
        sessionCount: nextCount,
        milestoneTarget: 21,
        averages: averagesPayload,
        ...thisSession,
      };
    }
    navigation.replace('SessionInsights', {
      ...params,
      primaryRouteName: 'MeasureSurvey',
      secondaryRouteName: 'MeasureSurvey',
    });
  };

  const openNotesInput = () => {
    if (showNotesInput) {
      notesInputRef.current?.focus?.();
      return;
    }
    setShowNotesInput(true);
    setTimeout(() => {
      notesInputRef.current?.focus?.();
    }, 0);
  };

  return (
    <LinearGradient
      colors={['#C31F64', '#6B2D8B']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 18 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How do you feel after the session?</Text>
        {METRICS.map((metric) => (
          <View key={metric.key} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>{metric.title}</Text>
            </View>
            <View style={styles.metricBody}>
              <View style={styles.metricLabels}>
                <Text style={styles.metricLabel}>{metric.left}</Text>
                <Text style={styles.metricLabel}>{metric.right}</Text>
              </View>
              <View style={styles.dotRow}>
                {Array.from({ length: 10 }).map((_, index) => {
                  const value = index + 1;
                  const selected = scores[metric.key] === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.dot, selected && styles.dotSelected]}
                      onPress={() => setScores((prev) => ({ ...prev, [metric.key]: value }))}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`${metric.title} ${value} out of 10`}
                    >
                      {selected ? <View style={styles.dotInner} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
        <View style={styles.notesCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>My Notes</Text>
          </View>
          <View style={styles.notesBody}>
            {showNotesInput ? (
              <TextInput
                ref={notesInputRef}
                value={notes}
                onChangeText={(text) => setNotes(text)}
                placeholder=""
                style={styles.notesInput}
                multiline
                textAlignVertical="top"
                editable
                autoCorrect
                autoCapitalize="sentences"
                blurOnSubmit={false}
                returnKeyType="default"
              />
            ) : (
              <TouchableOpacity
                style={styles.notesPrompt}
                onPress={openNotesInput}
                activeOpacity={0.86}
                accessibilityRole="button"
                accessibilityLabel="Open My Notes input"
              />
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, !allSelected && styles.saveButtonDisabled]}
          onPress={saveAndViewInsights}
          activeOpacity={0.88}
          disabled={!allSelected}
        >
          <Text style={[styles.saveButtonText, !allSelected && styles.saveButtonTextDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
        <View style={styles.bottomLinksRow}>
          <TouchableOpacity style={styles.bottomLinkBtn} activeOpacity={0.75}>
            <Text style={styles.bottomLinkTxt}>Don’t show this again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomLinkBtn}
            onPress={() =>
              navigation.replace('SessionInsights', {
                variant: 'firstTime',
                sessionCount: Array.isArray(surveyResults) ? surveyResults.length : 0,
                primaryRouteName: 'MeasureSurvey',
                secondaryRouteName: 'MeasureSurvey',
              })
            }
            activeOpacity={0.75}
          >
            <Text style={styles.bottomLinkTxt}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    paddingHorizontal: 35,
    alignItems: 'center',
  },
  title: {
    width: 241,
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  metricCard: {
    width: 295,
    minHeight: 162,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.24)',
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 16,
  },
  metricHeader: {
    paddingHorizontal: 17,
    paddingTop: 9,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#B92168',
    backgroundColor: 'transparent',
  },
  metricBody: {
    paddingHorizontal: 17,
    paddingTop: 14,
    paddingBottom: 12,
  },
  metricTitle: {
    fontFamily: 'Sailec-Medium',
    fontSize: 16,
    lineHeight: 26,
    color: '#FFFFFF',
  },
  metricLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Light',
    fontSize: 16,
    lineHeight: 26,
  },
  dotRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0.75,
    borderColor: '#B8B6BF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B8B6BF',
  },
  dotInner: { width: 0, height: 0 },
  notesCard: {
    width: 295,
    minHeight: 116,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.24)',
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 12,
  },
  notesBody: {
    paddingHorizontal: 17,
    paddingTop: 10,
    paddingBottom: 10,
  },
  notesInput: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontFamily: 'Sailec-Light',
    fontSize: 14,
    lineHeight: 20,
  },
  notesPrompt: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.14)',
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: 2,
    width: 294,
    height: 45,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.58,
  },
  saveButtonText: {
    color: '#6B2D8B',
    fontFamily: 'Sailec-Medium',
    fontSize: 18,
    lineHeight: 22,
  },
  saveButtonTextDisabled: {
    opacity: 0.8,
  },
  bottomLinksRow: {
    marginTop: 44,
    width: 294,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomLinkBtn: {
    paddingVertical: 4,
  },
  bottomLinkTxt: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Light',
    fontSize: 14,
    lineHeight: 32,
    textDecorationLine: 'underline',
  },
});

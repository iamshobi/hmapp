import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMysession } from '../context/mysessionContext';

const METRICS = [
  { key: 'stress', title: 'Stress', left: 'Low stress', right: 'High stress' },
  { key: 'energy', title: 'Energy', left: 'Drained', right: 'Energized' },
  { key: 'mood', title: 'Emotion', left: 'Feel bad', right: 'Feel good' },
];

export default function MeasureTabScreen({ showNotes = true }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { recordSessionSurveyBefore, currentSurveyBefore } = useMysession();
  const [scores, setScores] = useState({
    stress: currentSurveyBefore?.stress ?? null,
    energy: currentSurveyBefore?.energy ?? null,
    mood: currentSurveyBefore?.mood ?? null,
  });
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const notesInputRef = useRef(null);
  const allSelected = useMemo(
    () => scores.stress != null && scores.energy != null && scores.mood != null,
    [scores]
  );

  const saveCheckIn = () => {
    if (!allSelected) return;
    recordSessionSurveyBefore(scores);
    navigation.navigate('MeasureAfterSurvey');
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
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View
        style={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.fixedFrame}>
          <Text style={styles.hero}>How do you feel right now?</Text>

          {METRICS.map((metric, index) => (
            <View
              key={metric.key}
              style={[
                styles.metricCard,
                index === 0 && styles.metricCardFirst,
                index === 1 && styles.metricCardSecond,
                index === 2 && styles.metricCardThird,
              ]}
            >
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>{metric.title}</Text>
              </View>
              <View style={styles.metricBody}>
                <View style={styles.metricLabels}>
                  <Text style={styles.metricLabel}>{metric.left}</Text>
                  <Text style={styles.metricLabel}>{metric.right}</Text>
                </View>
                <View style={styles.dotRow}>
                  {Array.from({ length: 10 }).map((_, scoreIndex) => {
                    const value = scoreIndex + 1;
                    const selected = scores[metric.key] === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[styles.dotButton, selected && styles.dotButtonSelected]}
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

          {showNotes ? (
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
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, !allSelected && styles.saveButtonDisabled]}
            onPress={saveCheckIn}
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
              onPress={() => navigation.navigate('MeasureAfterSurvey')}
              activeOpacity={0.75}
            >
              <Text style={styles.bottomLinkTxt}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  fixedFrame: {
    width: 375,
    minHeight: 812,
    paddingTop: 42,
  },
  hero: {
    width: 241,
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 42 / 2,
    lineHeight: 30,
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 17,
    alignSelf: 'center',
  },
  metricCard: {
    width: 295,
    height: 146,
    opacity: 1,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.24)',
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 0,
    alignSelf: 'flex-start',
    marginLeft: 35,
  },
  metricCardFirst: { marginTop: 0, marginBottom: 10 },
  metricCardSecond: { marginBottom: 10 },
  metricCardThird: { marginBottom: 10 },
  metricHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#B92168',
    backgroundColor: 'transparent',
  },
  metricBody: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  metricTitle: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 16,
    lineHeight: 26,
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
    alignItems: 'center',
  },
  dotButton: {
    width: 19.89,
    height: 19.89,
    borderRadius: 9.945,
    borderWidth: 0.75,
    borderColor: '#B8B6BF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'rgba(50, 50, 71, 0.22)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  dotButtonSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  dotInner: { width: 0, height: 0 },
  notesCard: {
    width: 295,
    minHeight: 132,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.24)',
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 14,
    alignSelf: 'flex-start',
    marginLeft: 35,
  },
  notesBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  notesInput: {
    minHeight: 76,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontFamily: 'Sailec-Light',
    fontSize: 15,
    lineHeight: 22,
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
    width: 294,
    height: 45,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
    marginLeft: 35,
  },
  saveButtonDisabled: {
    opacity: 0.55,
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
    marginBottom: 0,
    alignSelf: 'flex-start',
    marginLeft: 35,
  },
  bottomLinkBtn: {
    paddingVertical: 4,
  },
  bottomLinkTxt: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Light',
    fontSize: 14,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
});

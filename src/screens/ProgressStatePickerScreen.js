import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

const STATE_OPTIONS = [
  { label: 'Zero sessions', previewType: 'zero' },
  { label: 'First Time User', previewType: 'firstTime' },
  { label: 'First few Sessions', previewType: 'building' },
  { label: 'Inactive Survey', previewType: 'inactiveSurvey' },
  { label: 'Partial Survey', previewType: 'partialSurveyOptOut' },
  { label: '16+ Sessions', previewType: 'advanced' },
  { label: '100+ Sessions', previewType: 'pro' },
];

export default function ProgressStatePickerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F6A400', '#F18A1F', '#EB6A33']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Text style={styles.headerTitle}>My Progress</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Temporary Preview States</Text>
        <Text style={styles.subtitle}>Tap a button to open the corresponding My Progress screen state.</Text>

        {STATE_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item.previewType}
            style={styles.optionBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('ProgressMain', { previewType: item.previewType })}
          >
            <Text style={styles.optionBtnTxt}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F3F5' },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: borderRadius.sheet,
    borderBottomRightRadius: borderRadius.sheet,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    minHeight: 88,
  },
  headerTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#2D1B3A',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: 'rgba(52,37,61,0.82)',
    fontSize: 13,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  optionBtn: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.42)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: spacing.md,
  },
  optionBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '700',
  },
});

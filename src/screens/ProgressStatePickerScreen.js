import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius } from '../theme';

const PROGRESS_FONT_REGULAR = 'Sailec-Medium';
const PROGRESS_FONT_BOLD = 'Sailec-Bold';

/** Preview states grouped like the Temporary Preview States layout (This release / Future release). */
const STATE_OPTIONS = [
  { label: 'Zero sessions', previewType: 'zero' },
  { label: 'Settle (2–5 unique practice days)', previewType: 'foundation' },
  { label: 'Flow (6–12 unique practice days)', previewType: 'seed' },
  { label: 'Deep (13–19 unique practice days)', previewType: 'habit' },
  { label: 'Inactive Survey', previewType: 'inactiveSurvey' },
  { label: 'Partial Survey', previewType: 'partialSurveyOptOut' },
  { label: 'Still (20+ unique practice days)', previewType: 'deepPractice' },
  { label: '100+ sessions', previewType: 'pro' },
];

export default function ProgressStatePickerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFC629', '#F6A400', '#F18A1F', '#EB6A33']}
        locations={[0, 0.28, 0.62, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.94, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <Text style={styles.headerTitle}>Progress</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Temporary Preview States</Text>
        <Text style={styles.subtitle}>Tap a button to open the corresponding Progress preview by Journey logic.</Text>

        {STATE_OPTIONS.map((item) => (
          <React.Fragment key={item.previewType}>
            {item.previewType === 'zero' ? (
              <Text style={[styles.scopeHeader, styles.scopeHeaderFirst]}>Scope: This release</Text>
            ) : null}
            {item.previewType === 'deepPractice' ? <View style={styles.scopeDivider} /> : null}
            {item.previewType === 'deepPractice' ? (
              <Text style={styles.scopeHeader}>Scope: Future release</Text>
            ) : null}
            <TouchableOpacity
              style={styles.optionBtn}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('ProgressMain', { previewType: item.previewType })}
            >
              <Text style={styles.optionBtnTxt}>{item.label}</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EFEFF2' },
  header: {
    paddingBottom: 22,
    borderBottomLeftRadius: borderRadius.sheet,
    borderBottomRightRadius: borderRadius.sheet,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 92,
  },
  headerTitle: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + 2,
    paddingBottom: spacing.xl + spacing.sm,
  },
  title: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#1C1424',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: 0.15,
  },
  subtitle: {
    fontFamily: PROGRESS_FONT_REGULAR,
    color: 'rgba(52,37,61,0.78)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  optionBtn: {
    minHeight: 46,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(225, 139, 49, 0.55)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scopeDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(44, 44, 46, 0.18)',
    marginHorizontal: 4,
    marginTop: 14,
    marginBottom: 16,
  },
  scopeHeader: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: 'rgba(52, 37, 61, 0.62)',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  scopeHeaderFirst: {
    marginTop: 0,
  },
  optionBtnTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: '#C26D1A',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
});

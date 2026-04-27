import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function MeasureEntryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#C31F64', '#6B2D8B']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>Measure</Text>
        <Text style={styles.subtitle}>Choose where you want to go</Text>

        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('MeasureBeforeSurvey')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnTxt}>Survey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('MeasureInsightsSamples')}
            activeOpacity={0.88}
          >
            <Text style={styles.secondaryBtnTxt}>Insights</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.84)',
    fontFamily: 'Sailec-Light',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionsWrap: {
    marginTop: 28,
    gap: 14,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnTxt: {
    color: '#6B2D8B',
    fontFamily: 'Sailec-Medium',
    fontSize: 17,
    lineHeight: 22,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnTxt: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 17,
    lineHeight: 22,
  },
});

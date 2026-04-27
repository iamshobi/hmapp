import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { spacing, colors } from '../../theme';

export default function MeasureCameraGuideScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft color={colors.textDark} size={22} />
      </TouchableOpacity>
      <Text style={styles.logo}>+❤</Text>
      <Text style={styles.title}>Your phone’s camera can now film blood flow through your finger</Text>
      <Text style={styles.body}>
        to measure your <Text style={styles.bold}>heartbeats</Text> and calculate your <Text style={styles.bold}>Heart Coherence</Text> score.
      </Text>
      <View style={styles.illustration}>
        <Text style={styles.illustrationTxt}>📱☝️</Text>
      </View>
      <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('MeasureGettingStarted')}>
        <Text style={styles.ctaTxt}>Start Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8', paddingHorizontal: 20 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  logo: { fontSize: 36, textAlign: 'center', color: '#8E2BA5', marginTop: spacing.md, fontWeight: '600' },
  title: {
    marginTop: spacing.xl,
    textAlign: 'center',
    color: '#4C3D85',
    fontSize: 40 / 2,
    lineHeight: 30,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  body: {
    marginTop: spacing.lg + 2,
    textAlign: 'center',
    color: '#2F2E36',
    fontSize: 18,
    lineHeight: 31,
    paddingHorizontal: 8,
  },
  bold: { fontWeight: '700' },
  illustration: {
    alignSelf: 'center',
    marginTop: 56,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(78, 217, 197, 0.36)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationTxt: { fontSize: 64 },
  cta: {
    marginTop: 'auto',
    borderRadius: 28,
    paddingVertical: 17,
    backgroundColor: '#6F3098',
    alignItems: 'center',
  },
  ctaTxt: { color: '#FFF', fontSize: 20, fontWeight: '700' },
});

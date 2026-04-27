import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { spacing, colors } from '../../theme';

export default function MeasureMethodScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft color={colors.textDark} size={22} />
      </TouchableOpacity>
      <Text style={styles.logo}>+❤</Text>
      <Text style={styles.title}>
        To calculate your coherence score, we’ll need to measure your heart beats.
      </Text>
      <View style={styles.circle}>
        <Text style={styles.wave}>~ ~ ~ ❤ ~ ~ ~</Text>
      </View>
      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('MeasureGettingStarted')}>
        <Text style={styles.primaryTxt}>Use a HeartMath Sensor</Text>
      </TouchableOpacity>
      <Text style={styles.help}>Don’t have a sensor? That’s okay!</Text>
      <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('MeasureCameraGuide')}>
        <Text style={styles.secondaryTxt}>Use your phone’s camera</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7FA', paddingHorizontal: 22 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  logo: { fontSize: 38, textAlign: 'center', color: '#8E2BA5', marginTop: spacing.md, fontWeight: '600' },
  title: {
    marginTop: spacing.xl + 2,
    textAlign: 'center',
    color: '#5E2D83',
    fontSize: 42,
    lineHeight: 60,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  circle: {
    alignSelf: 'center',
    marginTop: 58,
    width: 238,
    height: 238,
    borderRadius: 119,
    backgroundColor: 'rgba(79, 211, 200, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: { color: 'white', fontSize: 24, letterSpacing: 1.2 },
  primary: {
    marginTop: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#9C4B9D',
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  primaryTxt: { color: '#8A3F8A', fontSize: 18, fontWeight: '600' },
  help: { textAlign: 'center', marginTop: spacing.xl - 2, color: '#2E2E35', fontSize: 35 / 2 },
  secondary: {
    marginTop: spacing.lg + 2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C25D9D',
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryTxt: { color: '#9B4E89', fontSize: 18, fontWeight: '600' },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MeasurePulseLine from '../../components/measure/MeasurePulseLine';

export default function MeasureConnectedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#D91E79', '#7A2EA5']} style={styles.root}>
      <View style={[styles.wrap, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 18 }]}>
        <TouchableOpacity style={styles.exit} onPress={() => navigation.popToTop()}>
          <Text style={styles.exitTxt}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.title}>You are connected!</Text>
        <View style={styles.checkCircle}>
          <Text style={styles.checkTxt}>✓</Text>
        </View>
        <Text style={styles.sub}>Here are your heart beats (pulse).</Text>
        <View style={styles.waveWrap}>
          <MeasurePulseLine />
        </View>
        <Text style={styles.wait}>Please wait, we’re almost there!</Text>
        <View style={styles.barRow}>
          <Text style={styles.barTick}>✓</Text>
          <View style={styles.barTrack}>
            <View style={styles.barFill} />
          </View>
          <Text style={[styles.barTick, styles.barTickMuted]}>✓</Text>
        </View>
        <TouchableOpacity style={styles.continue} onPress={() => navigation.navigate('MeasureLiveSession')}>
          <Text style={styles.continueTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 20 },
  exit: { alignSelf: 'flex-end', padding: 8 },
  exitTxt: { color: '#FFF', fontWeight: '600', fontSize: 15, letterSpacing: 0.2 },
  title: { color: '#FFF', textAlign: 'center', fontSize: 42, fontWeight: '700', marginTop: 52 },
  checkCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#EF2D2A',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
    shadowColor: '#D71C27',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  checkTxt: { color: '#FFF', fontSize: 82, fontWeight: '700' },
  sub: { marginTop: 54, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: 20, lineHeight: 28 },
  waveWrap: { marginTop: 18, width: '100%', minHeight: 90 },
  wait: { marginTop: 34, color: '#FFF', textAlign: 'center', fontSize: 20, fontWeight: '500' },
  barRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTick: { color: '#FFF', fontSize: 18 },
  barTickMuted: { color: 'rgba(255,255,255,0.45)' },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  barFill: { width: '86%', height: '100%', backgroundColor: '#FFF' },
  continue: {
    marginTop: 'auto',
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  continueTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MeasurePulseLine from '../../components/measure/MeasurePulseLine';

export default function MeasureLiveSessionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <LinearGradient colors={['#D91E79', '#7A2EA5']} style={styles.root}>
      <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
        <TouchableOpacity style={styles.exit} onPress={() => navigation.popToTop()}>
          <Text style={styles.exitTxt}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>+❤</Text>
        <Text style={styles.guidance}>Feel the heart-lung connection. Smooth out the wave.</Text>
        <View style={styles.chart}>
          <Text style={styles.chartHintTop}>Faster Heartrate</Text>
          <View style={styles.chartGrid}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>
          <MeasurePulseLine variant="live" />
          <Text style={styles.chartHintBottom}>Slower Heartrate</Text>
        </View>
        <View style={styles.timerRow}>
          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
          <Text style={styles.timerTxt}>04:13 Left</Text>
        </View>
        <TouchableOpacity style={styles.continue} onPress={() => navigation.navigate('MeasureCoherenceResult')}>
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
  exitTxt: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  logo: { color: '#FFF', textAlign: 'center', fontSize: 34, fontWeight: '700', marginTop: 4 },
  guidance: {
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  chart: { flex: 1, justifyContent: 'center', marginTop: 18 },
  chartHintTop: { color: '#FFF', alignSelf: 'flex-end', fontWeight: '700', marginBottom: 8, fontSize: 15 },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    top: 82,
    bottom: 92,
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chartHintBottom: { color: '#FFF', alignSelf: 'flex-end', marginTop: 4, fontWeight: '700', fontSize: 15 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 },
  track: { flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
  fill: { width: '8%', height: '100%', borderRadius: 999, backgroundColor: '#FFF' },
  timerTxt: { color: '#FFF', fontSize: 28 / 2 },
  continue: {
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  continueTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

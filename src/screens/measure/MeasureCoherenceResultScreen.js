import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function MeasureCoherenceResultScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <LinearGradient colors={['#D91E79', '#7A2EA5']} style={styles.root}>
      <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
        <TouchableOpacity style={styles.exit} onPress={() => navigation.popToTop()}>
          <Text style={styles.exitTxt}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>+❤</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Coherence</Text>
          <Text style={styles.scoreValue}>1.0</Text>
        </View>
        <View style={styles.circleOuter}>
          <View style={styles.circleInner} />
        </View>
        <View style={styles.timerRow}>
          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
          <Text style={styles.timerTxt}>02:14 Left</Text>
        </View>
        <TouchableOpacity style={styles.continue} onPress={() => navigation.navigate('MeasureAfterSurvey')}>
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
  logo: { color: '#FFF', textAlign: 'center', fontSize: 34, fontWeight: '700', marginTop: 10 },
  scoreCard: {
    alignSelf: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(255,201,78,0.94)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  scoreLabel: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  scoreValue: { color: '#FFF', fontWeight: '800', fontSize: 68, marginTop: -4, lineHeight: 72 },
  circleOuter: {
    width: 336,
    height: 336,
    borderRadius: 168,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    alignSelf: 'center',
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', marginBottom: 12 },
  track: { flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
  fill: { width: '52%', height: '100%', borderRadius: 999, backgroundColor: '#FFF' },
  timerTxt: { color: '#FFF', fontSize: 28 / 2 },
  continue: {
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  continueTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

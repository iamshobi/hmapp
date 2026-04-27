import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Bell, Heart, Sparkles, Settings, Clock3, Volume2, CircleDot, ChevronRight } from 'lucide-react-native';

export default function MeasureLandingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#F29A39', '#E11C76', '#6B2D8B']} start={{ x: 0.1, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.root}>
      <View style={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.topRow}>
          <Bell size={20} color="#FFFFFF" />
          <View style={styles.topRight}>
            <View style={styles.sparkleHeartWrap}>
              <Sparkles size={14} color="#FFFFFF" strokeWidth={2.2} />
              <Heart size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Settings size={20} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>Coherence Practice</Text>
          <Text style={styles.title}>Measure Your{"\n"}Coherence</Text>
        </View>

        <View style={styles.optionsStack}>
          <OptionRow icon={<Clock3 size={18} color="#FFFFFF" />} label="Timer: 5 min" />
          <OptionRow icon={<Volume2 size={18} color="#FFFFFF" />} label="Sounds: On" />
          <OptionRow icon={<CircleDot size={18} color="#FFFFFF" />} label="Breath: 20 sec" />
        </View>

        <TouchableOpacity style={styles.startBtn} activeOpacity={0.9} onPress={() => navigation.navigate('MeasureEntry')}>
          <Text style={styles.startBtnTxt}>Start Session</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guidedRow} activeOpacity={0.8} onPress={() => navigation.navigate('MeasureEntry')}>
          <Text style={styles.guidedTxt}>Want a Guided Technique?</Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View pointerEvents="none" style={styles.bubbleLayer}>
        <View style={[styles.bubble, { left: '10%', top: '26%', width: 22, height: 22 }]} />
        <View style={[styles.bubble, { left: '22%', top: '27%', width: 10, height: 10 }]} />
        <View style={[styles.bubble, { left: '35%', top: '33%', width: 18, height: 18 }]} />
        <View style={[styles.bubble, { left: '63%', top: '25%', width: 16, height: 16 }]} />
        <View style={[styles.bubble, { left: '80%', top: '33%', width: 18, height: 18 }]} />
        <View style={[styles.bubble, { left: '14%', top: '58%', width: 20, height: 20 }]} />
        <View style={[styles.bubble, { left: '72%', top: '61%', width: 24, height: 24 }]} />
        <View style={[styles.bubble, { left: '86%', top: '66%', width: 14, height: 14 }]} />
      </View>
    </LinearGradient>
  );
}

function OptionRow({ icon, label }) {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.optionRow}>
      <View style={styles.optionLeft}>
        {icon}
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 26 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sparkleHeartWrap: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  titleBlock: { marginTop: 36, alignItems: 'center' },
  kicker: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    width: 311,
    height: 95,
    fontFamily: 'Sailec-Medium',
    fontSize: 32,
    lineHeight: 52,
    textAlign: 'center',
    letterSpacing: 0,
  },
  optionsStack: { marginTop: 52, gap: 16 },
  optionRow: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(145, 56, 134, 0.54)',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  optionLabel: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Medium',
    fontSize: 16,
    lineHeight: 32,
  },
  startBtn: {
    marginTop: 88,
    alignSelf: 'center',
    width: 252,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F2F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnTxt: {
    color: '#A01B78',
    fontFamily: 'Sailec-Medium',
    fontSize: 40 / 2,
    lineHeight: 24,
  },
  guidedRow: {
    marginTop: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guidedTxt: {
    color: '#FFFFFF',
    fontFamily: 'Sailec-Light',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
  },
  bubbleLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.74)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});


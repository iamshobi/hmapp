import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Heart, Sparkles, Settings } from 'lucide-react-native';
import { Logo } from '../components/ui';
import { spacing, gradients, borderRadius, palette } from '../theme';

export default function LearnTabScreen() {
  const insets = useSafeAreaInsets();
  const topPad = useMemo(() => insets.top + 10, [insets.top]);

  return (
    <LinearGradient colors={gradients.learn} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad, paddingBottom: insets.bottom + 18 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <Plus size={30} color="#FFFFFF" strokeWidth={2.7} />
            <Heart size={27} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View style={styles.topIcons}>
            <View style={styles.sparkleHeartWrap}>
              <Sparkles size={14} color="#FFFFFF" strokeWidth={2.2} />
              <Heart size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View style={styles.settingsBtn}>
              <Settings size={20} color="#FFFFFF" strokeWidth={2.3} />
            </View>
          </View>
        </View>

        <Text style={styles.screenTitle}>Learning</Text>

        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={['#F3E9A9', '#E42A74', '#FFCB00']} start={{ x: 0.02, y: 0.02 }} end={{ x: 0.95, y: 0.95 }} style={styles.tileWide}>
            <Text style={styles.tileWideText}>Multi-Day{"\n"}Programs</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.tileGrid}>
          <TouchableOpacity activeOpacity={0.9} style={styles.tileHalfWrap}>
            <LinearGradient colors={['#F4DB96', '#FFCB00', '#F58C00']} start={{ x: 0.03, y: 0.03 }} end={{ x: 0.97, y: 0.97 }} style={styles.tileHalf}>
              <Text style={styles.tileHalfText}>Heart Based{"\n"}Living{"\n"}Practices</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} style={styles.tileHalfWrap}>
            <LinearGradient colors={['#92D9C5', '#12B28F', '#5A52C8']} start={{ x: 0.1, y: 0.03 }} end={{ x: 0.95, y: 0.95 }} style={styles.tileHalf}>
              <Text style={styles.tileHalfText}>Guided{"\n"}Techniques</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} style={styles.tileHalfWrap}>
            <LinearGradient colors={['#5FC8E7', '#0E7AC8', '#1EBF9B']} start={{ x: 0.05, y: 0.05 }} end={{ x: 0.94, y: 0.96 }} style={styles.tileHalf}>
              <Text style={styles.tileHalfText}>Courses</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} style={styles.tileHalfWrap}>
            <LinearGradient colors={['#F3E09F', '#E42A74', '#FFCB00']} start={{ x: 0.03, y: 0.03 }} end={{ x: 0.96, y: 0.95 }} style={styles.tileHalf}>
              <Text style={styles.tileHalfText}>Audiobooks</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sparkleHeartWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  settingsBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blueBright,
  },
  screenTitle: {
    fontFamily: 'Sailec-Medium',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'left',
    color: '#F2F3F7',
    marginBottom: 26,
    letterSpacing: 0,
  },
  tileWide: {
    width: '100%',
    height: 178,
    borderRadius: borderRadius.xl,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileWideText: {
    fontFamily: 'Sailec-Medium',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  tileHalfWrap: {
    width: '47%',
  },
  tileHalf: {
    height: 176,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tileHalfText: {
    fontFamily: 'Sailec-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

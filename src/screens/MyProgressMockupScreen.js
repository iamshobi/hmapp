/**
 * Phone-style frame around a compact MoodMeter + mini header strip (library / showcase).
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import MoodMeter from '../components/MoodMeter';
import { colors, spacing, borderRadius, shadows } from '../theme';

export default function MyProgressMockupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeft size={26} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Progress (mockup)</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneOuter}>
          <View style={styles.phoneBezel}>
            <LinearGradient colors={['#FF7043', '#FFA726']} style={styles.mockHeader}>
              <Text style={styles.mockTitle}>My Progress</Text>
            </LinearGradient>
            <View style={styles.mockBody}>
              <MoodMeter compact demoApril2026={true} />
            </View>
          </View>
        </View>
        <Text style={styles.caption}>
          Compact MoodMeter inside a device frame. Full layout: Progress tab → My Progress.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8E0F5' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  navTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  scroll: { alignItems: 'center', paddingHorizontal: spacing.lg },
  phoneOuter: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  phoneBezel: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#111',
    padding: 10,
    ...shadows.cardLift,
  },
  mockHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mockTitle: { fontSize: 20, fontWeight: '800', color: colors.white },
  mockBody: {
    backgroundColor: '#F5F5F5',
    padding: spacing.sm,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  caption: {
    marginTop: spacing.lg,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 20,
  },
});

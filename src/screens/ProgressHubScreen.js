/**
 * Progress hub — full-width MoodMeter demo + entry to rationale & phone mockup.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Smartphone } from 'lucide-react-native';
import MoodMeter from '../components/MoodMeter';
import { colors, spacing, borderRadius, typography, shadows, palette } from '../theme';

export default function ProgressHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
          <ChevronLeft size={26} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Progress & mood</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Live demo: calendar (color-coded coherence), trend curves, and insights — re-skinned in HeartMath
          purple–magenta–teal.
        </Text>

        <MoodMeter compact={false} demoApril2026={true} />

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('MyProgressMockup')}
          activeOpacity={0.85}
        >
          <Smartphone size={28} color={palette.hmBrandPurple} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Phone mockup</Text>
            <Text style={styles.cardSub}>Framed preview of the My Progress layout</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE7F6' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: { padding: 4 },
  title: { ...typography.modalTitle, fontSize: 18, color: colors.textDark },
  scroll: { paddingHorizontal: spacing.lg },
  lead: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.card,
    gap: spacing.md,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  cardSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  chev: { fontSize: 22, color: palette.hmBrandPurple, fontWeight: '300' },
});

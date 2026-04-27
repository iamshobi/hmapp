/**
 * Full-screen alert when the user enters Gentle Mode (critical strain 3 days in a row).
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreathGarden } from '../context/BreathGardenContext';
import { CRITICAL_SHIFT_ALERT_COPY } from '../constants/criticalShift';
import { sessionInsightsTokens } from '../constants/sessionInsights';

const T = sessionInsightsTokens;

export default function CriticalShiftAlertOverlay() {
  const insets = useSafeAreaInsets();
  const { criticalShiftAlertPending, acknowledgeCriticalShiftAlert } = useBreathGarden();

  if (!criticalShiftAlertPending) return null;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={acknowledgeCriticalShiftAlert}>
        <Pressable style={styles.cardWrap} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={[T.colors.gradientTop, T.colors.gradientBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.card, { paddingTop: 20 + insets.top, paddingBottom: 24 + insets.bottom }]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Critical shift</Text>
            </View>
            <Text style={styles.title}>Gentle mode</Text>
            <Text style={styles.body}>{CRITICAL_SHIFT_ALERT_COPY}</Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={acknowledgeCriticalShiftAlert}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Continue in gentle mode"
            >
              <Text style={styles.ctaText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 8, 20, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 14,
  },
  badgeText: {
    color: T.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  title: {
    color: T.colors.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    color: T.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 22,
  },
  cta: {
    backgroundColor: T.colors.buttonBg,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: T.colors.buttonText,
    fontSize: 16,
    fontWeight: '700',
  },
});

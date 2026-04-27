/**
 * Pelagic zone education — popup modal (ocean theme), same copy as session zone help.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getOceanLevelById } from '../constants/oceanDepthLevels';
import { getOceanZoneInfo } from '../constants/oceanZoneInfo';
import { palette, borderRadius, spacing, shadows } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

export default function OceanZoneInfoScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const nav = useNavigation();
  const levelId = route.params?.levelId ?? 'epipelagic';
  const level = getOceanLevelById(levelId);
  const info = getOceanZoneInfo(levelId);
  const accent = palette[level.accentToken] ?? palette.hmAppBlue;

  const close = () => nav.goBack();

  const cardMaxH = Math.min(SCREEN_H * 0.88, 720);
  const okayBtnMinH = 54;
  const scrollMaxH = Math.max(180, cardMaxH - okayBtnMinH - 8);

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />
      <View
        style={[
          styles.modalLayer,
          {
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 10,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.cardOuter, { maxHeight: cardMaxH }, shadows.cardLift]}>
          <LinearGradient
            colors={['#071e34', '#0c3a58', '#061a28']}
            start={{ x: 0.35, y: 0 }}
            end={{ x: 0.65, y: 1 }}
            style={styles.cardGradient}
          >
            <ScrollView
              style={[styles.scroll, { maxHeight: scrollMaxH }]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={[styles.accentBar, { backgroundColor: accent }]} />

              <Text style={styles.title}>{info.title}</Text>
              <Text style={[styles.subtitle, { color: accent }]}>{info.subtitle}</Text>

              <View style={styles.divider} />

              <Text style={styles.body}>{info.body}</Text>

              <View style={styles.notePill}>
                <Text style={styles.noteTxt}>
                  Coherence is simulated until a HeartMath sensor is connected.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.okayBtn, { backgroundColor: accent, minHeight: okayBtnMinH }]}
              onPress={close}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Got it!"
            >
              <Text style={styles.okayTxt}>Got it!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 12, 28, 0.82)',
  },
  modalLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  cardOuter: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.22)',
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  scroll: {},
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  accentBar: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginBottom: spacing.md,
    opacity: 0.95,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.98)',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.35,
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(100, 200, 220, 0.35)',
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 24,
  },
  notePill: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteTxt: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.48)',
    lineHeight: 16,
    textAlign: 'center',
  },
  okayBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  okayTxt: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.35,
  },
});

/**
 * First Play step: choose a game theme (Sky, Ocean, Universe, …).
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { PLAY_THEMES } from '../constants/playThemes';
import { colors, spacing, borderRadius, gradients, shadows, typography } from '../theme';

export default function PlayThemesScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const openTheme = (themeId) => {
    if (themeId === 'ocean') {
      nav.navigate('OceanLevelDetail', {
        themeId: 'ocean',
        levelId: 'epipelagic',
        durationSec: 90,
      });
      return;
    }
    nav.navigate('ThemeGames', { themeId });
  };

  const THEME_CARD_GRADIENTS = {
    universe: ['#6A1B9A', '#651FFF', '#311B92'],
    sky: ['#3BB2D0', '#5E35B1', '#6A3093'],
    ocean: ['#00ACC1', '#0091EA', '#006064'],
    forest: ['#2E7D32', '#66BB6A', '#1B5E20'],
    mountain: ['#8D6E63', '#90A4AE', '#546E7A'],
  };

  return (
    <LinearGradient colors={gradients.learn} style={styles.gradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.heroTitle, styles.hero]}>Choose a theme</Text>
        <Text style={styles.sub}>Pick a world — then choose a game inside it.</Text>

        <View style={styles.grid}>
          {PLAY_THEMES.map((theme) => {
            const cardGrad = THEME_CARD_GRADIENTS[theme.id] ?? gradients.learn;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeCard, shadows.card]}
                onPress={() => openTheme(theme.id)}
                activeOpacity={0.92}
              >
                <LinearGradient colors={cardGrad} style={styles.themeCardBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.themeCardTop}>
                    <Text style={styles.emoji}>{theme.emoji}</Text>
                    <View style={styles.chevronWrap}>
                      <ChevronRight size={20} color="rgba(255,255,255,0.95)" />
                    </View>
                  </View>
                  <View style={styles.themeCardText}>
                    <Text style={styles.cardTitle}>{theme.title}</Text>
                    <Text style={styles.cardBlurb} numberOfLines={2}>
                      {theme.blurb}
                    </Text>
                  </View>
                  <View style={styles.cardGlow} pointerEvents="none" />
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl },
  hero: { color: colors.textWhite, marginBottom: spacing.sm },
  sub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  themeCardBg: {
    flex: 1,
    padding: spacing.lg,
    minHeight: 145,
    justifyContent: 'space-between',
  },
  themeCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  emoji: { fontSize: 38 },
  chevronWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  themeCardText: {
    paddingRight: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.98)',
    marginBottom: 6,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardBlurb: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 18,
  },
  cardGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});

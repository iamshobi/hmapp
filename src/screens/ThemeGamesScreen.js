/**
 * Games available under one theme (e.g. Universe → The Sacred Geometry).
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { getGamesForTheme, getThemeById } from '../constants/playThemes';
import { colors, spacing, borderRadius, gradients, shadows, typography } from '../theme';

export default function ThemeGamesScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const nav = useNavigation();
  const themeId = route.params?.themeId ?? 'universe';

  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  const games = useMemo(() => getGamesForTheme(themeId), [themeId]);

  const openGame = (game) => {
    if (game.comingSoon || !game.screen) return;
    nav.navigate(game.screen, { themeId });
  };

  return (
    <LinearGradient colors={gradients.learn} style={styles.gradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emojiLarge}>{theme?.emoji ?? '✦'}</Text>
        <Text style={[typography.heroTitle, styles.hero]}>{theme?.title ?? 'Games'}</Text>
        <Text style={styles.sub}>{theme?.blurb ?? ''}</Text>
        <Text style={styles.section}>Games</Text>

        {games.map((game) => {
          const locked = game.comingSoon || !game.screen;
          return (
            <TouchableOpacity
              key={game.id}
              style={[styles.card, locked && styles.cardLocked, shadows.card]}
              onPress={() => openGame(game)}
              activeOpacity={locked ? 1 : 0.88}
              disabled={locked}
            >
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, locked && styles.muted]}>{game.title}</Text>
                {game.subtitle ? (
                  <Text style={[styles.cardSub, locked && styles.muted]}>{game.subtitle}</Text>
                ) : null}
                {locked ? <Text style={styles.soonBadge}>Coming soon</Text> : null}
              </View>
              {!locked && <ChevronRight size={22} color={colors.purpleLight} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl },
  emojiLarge: { fontSize: 44, textAlign: 'center', marginBottom: spacing.sm },
  hero: { color: colors.textWhite, marginBottom: spacing.sm, textAlign: 'center' },
  sub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: spacing.xl,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardLocked: { opacity: 0.55 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  muted: { color: colors.textMuted },
  soonBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
    letterSpacing: 0.3,
  },
});

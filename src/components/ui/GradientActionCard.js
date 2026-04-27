import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, spacing, borderRadius, shadows } from '../../theme';

const GRADIENT_MAP = {
  learn: gradients.actionLearn,
  measure: gradients.actionMeasure,
  play: gradients.actionPlay,
  multi: gradients.actionMulti,
  guided: gradients.actionGuided,
  courses: gradients.actionCourses,
  audiobooks: gradients.actionAudiobooks,
};

/**
 * @param {keyof typeof GRADIENT_MAP} gradient
 */
export function GradientActionCard({
  title,
  gradient = 'learn',
  icon,
  large,
  onPress,
  style,
}) {
  const colorsArr = GRADIENT_MAP[gradient] ?? GRADIENT_MAP.learn;

  if (large) {
    const inner = (
      <LinearGradient
        colors={colorsArr}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradLarge}
      >
        <Text style={styles.titleLarge}>{title}</Text>
      </LinearGradient>
    );
    return onPress ? (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.touchLarge, shadows.card, style]}
      >
        {inner}
      </TouchableOpacity>
    ) : (
      <View style={[styles.touchLarge, shadows.card, style]}>{inner}</View>
    );
  }

  /* Compact card — icon badge centered, title at bottom */
  const inner = (
    <LinearGradient
      colors={colorsArr}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradCompact}
    >
      {icon ? (
        <View style={styles.iconBadge}>
          {icon}
        </View>
      ) : null}
      <Text style={styles.titleCompact}>{title}</Text>
    </LinearGradient>
  );

  return onPress ? (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.touchCompact, shadows.card, style]}
    >
      {inner}
    </TouchableOpacity>
  ) : (
    <View style={[styles.touchCompact, shadows.card, style]}>{inner}</View>
  );
}

const styles = StyleSheet.create({
  /* Compact (Daily Practice) */
  touchCompact: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradCompact: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
    gap: spacing.md,
  },
  iconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCompact: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* Large (Programs grid) */
  touchLarge: {
    width: '48%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradLarge: {
    minHeight: 120,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  titleLarge: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, gradients } from '../../theme';
import { styleGuide } from '../../theme/styleGuide';

/**
 * @param {'primary' | 'secondary' | 'outline' | 'ghost'} variant
 */
export function Button({
  children,
  variant = 'primary',
  fullWidth,
  disabled,
  loading,
  onPress,
  style,
  textStyle,
}) {
  const label = typeof children === 'string' ? children : null;
  const content = label ? (
    <Text
      style={[
        styles.label,
        variant === 'primary' && styles.labelOnPrimary,
        variant === 'secondary' && styles.labelSecondary,
        variant === 'outline' && styles.labelOutline,
        variant === 'ghost' && styles.labelGhost,
        disabled && styles.labelDisabled,
        textStyle,
      ]}
    >
      {label}
    </Text>
  ) : (
    children
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        disabled={disabled || loading}
        onPress={onPress}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={gradients.ctaPurple}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.pill,
            styles.primaryPill,
            fullWidth && styles.fullWidth,
            disabled && styles.disabledOpacity,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            content
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        disabled={disabled || loading}
        onPress={onPress}
        style={[
          styles.pill,
          styles.secondaryPill,
          fullWidth && styles.fullWidth,
          disabled && styles.disabledOpacity,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={styleGuide.fillBrand} />
        ) : (
          content
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        disabled={disabled || loading}
        onPress={onPress}
        style={[
          styles.pill,
          styles.outlinePill,
          fullWidth && styles.fullWidth,
          disabled && styles.disabledOpacity,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={styleGuide.borderBrand} />
        ) : (
          content
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.ghostWrap, fullWidth && styles.fullWidth, style]}
    >
      {loading ? (
        <ActivityIndicator color={styleGuide.fillBrand} />
      ) : (
        content
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  pill: {
    minHeight: 52,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPill: {},
  secondaryPill: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
  },
  outlinePill: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: styleGuide.borderBrand,
  },
  ghostWrap: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  labelOnPrimary: { color: colors.white },
  labelSecondary: { color: styleGuide.fillBrand },
  labelOutline: { color: styleGuide.fillBrand },
  labelGhost: {
    color: styleGuide.fillBrand,
    fontWeight: '600',
  },
  labelDisabled: { opacity: 0.55 },
  disabledOpacity: { opacity: 0.55 },
});

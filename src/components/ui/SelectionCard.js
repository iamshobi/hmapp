import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { styleGuide } from '../../theme/styleGuide';

export function SelectionCard({ label, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <View style={styles.inner}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: styleGuide.borderBrand,
    borderWidth: 2,
    backgroundColor: styleGuide.surfaceSoft,
  },
  cardPressed: { opacity: 0.92 },
  inner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: 16,
    color: styleGuide.textHeading,
    fontWeight: '500',
  },
  labelSelected: { fontWeight: '700', color: styleGuide.borderBrand },
});

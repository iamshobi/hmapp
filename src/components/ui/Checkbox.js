import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { styleGuide } from '../../theme/styleGuide';

export function Checkbox({ label, checked, onValueChange, style }) {
  return (
    <Pressable
      style={[styles.row, style]}
      onPress={() => onValueChange?.(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
        ]}
      >
        {checked ? (
          <Check size={16} color={colors.white} strokeWidth={3} />
        ) : null}
      </View>
      {label ? <Text style={[styles.label, styles.labelAfter]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: styleGuide.borderBrand,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: styleGuide.borderBrand,
    borderColor: styleGuide.borderBrand,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: styleGuide.textHeading,
  },
  labelAfter: { marginLeft: spacing.md },
});

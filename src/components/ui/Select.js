import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { styleGuide } from '../../theme/styleGuide';

export function Select({
  label,
  options = [],
  value,
  onValueChange,
  placeholder = 'Select…',
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : placeholder;

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Text
          style={[styles.valueText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {display}
        </Text>
        <ChevronDown size={22} color={styleGuide.borderBrand} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((o) => (
                <TouchableOpacity
                  key={String(o.value)}
                  style={styles.optionRow}
                  onPress={() => {
                    onValueChange?.(o.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      o.value === value && styles.optionTextActive,
                    ]}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: styleGuide.textHeading,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: styleGuide.borderBrand,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  valueText: { flex: 1, fontSize: 16, color: styleGuide.textHeading },
  placeholder: { color: colors.textMuted },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '50%',
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
  },
  optionRow: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  optionText: { fontSize: 16, color: styleGuide.textHeading },
  optionTextActive: { fontWeight: '700', color: styleGuide.borderBrand },
});

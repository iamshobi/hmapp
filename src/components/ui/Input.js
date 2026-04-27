import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { styleGuide } from '../../theme/styleGuide';

export function Input({
  label,
  placeholder,
  defaultValue,
  value,
  onChangeText,
  isPassword,
  error,
  editable = true,
  keyboardType,
  autoCapitalize,
  containerStyle,
}) {
  const [hidden, setHidden] = useState(true);
  const secure = isPassword && hidden;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.fieldRow,
          error ? styles.fieldError : null,
          !editable && styles.fieldDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          defaultValue={defaultValue}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!!secure}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            style={styles.eye}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            {hidden ? (
              <Eye size={22} color={styleGuide.borderBrand} />
            ) : (
              <EyeOff size={22} color={styleGuide.borderBrand} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: styleGuide.borderBrand,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  fieldError: {
    borderColor: '#E53935',
  },
  fieldDisabled: { opacity: 0.6 },
  input: {
    flex: 1,
    fontSize: 16,
    color: styleGuide.textHeading,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
  },
  eye: { paddingLeft: spacing.sm },
  errorText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: '#E53935',
    fontWeight: '500',
  },
});

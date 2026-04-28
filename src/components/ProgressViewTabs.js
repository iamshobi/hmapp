import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, TrendingUp, Lightbulb } from 'lucide-react-native';
import { borderRadius, spacing } from '../theme';

const PROGRESS_FONT_BOLD = 'Sailec-Bold';

const TABS = [
  { key: 'trend', label: 'Trends', Icon: TrendingUp },
  { key: 'checkins', label: 'Activity', Icon: CalendarDays },
  { key: 'insights', label: 'Notes', Icon: Lightbulb },
];

export default function ProgressViewTabs({ activeTab = 'trend', onChange, embedded = false, disabledTabs = [] }) {
  const { width } = useWindowDimensions();
  const isCompact = width <= 360;
  const iconSize = isCompact ? 11 : 13;
  const labelFontSize = isCompact ? 13 : 14;
  const labelLineHeight = 26;

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      {TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        const disabled = disabledTabs.includes(key);
        return (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, isCompact && styles.tabBtnCompact, disabled && styles.tabBtnDisabled]}
            onPress={() => {
              if (disabled) return;
              onChange?.(key);
            }}
            activeOpacity={disabled ? 1 : 0.86}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            disabled={disabled}
          >
            {active ? (
              <LinearGradient
                colors={['#F6A400', '#F18A1F', '#EB6A33']}
                start={{ x: 0.06, y: 0.1 }}
                end={{ x: 0.94, y: 0.9 }}
                style={styles.tabBtnActive}
              >
                <Icon size={iconSize} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={[
                    styles.tabTxt,
                    { fontSize: labelFontSize, lineHeight: labelLineHeight },
                    styles.tabTxtActive,
                    disabled && styles.tabTxtDisabled,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {label}
                </Text>
              </LinearGradient>
            ) : (
              <>
                <Icon size={iconSize} color={disabled ? 'rgba(52,37,61,0.42)' : 'rgba(52,37,61,0.8)'} strokeWidth={2} />
                <Text
                  style={[
                    styles.tabTxt,
                    { fontSize: labelFontSize, lineHeight: labelLineHeight },
                    disabled && styles.tabTxtDisabled,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  wrapEmbedded: {
    marginBottom: 0,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  tabBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 6,
    minWidth: 0,
  },
  tabBtnCompact: {
    gap: 4,
    paddingHorizontal: 4,
  },
  tabBtnActive: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  tabBtnDisabled: {
    opacity: 0.72,
  },
  tabTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: 'rgba(52,37,61,0.86)',
    fontWeight: '700',
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  tabTxtActive: {
    color: '#FFFFFF',
  },
  tabTxtDisabled: {
    color: 'rgba(52,37,61,0.45)',
  },
});


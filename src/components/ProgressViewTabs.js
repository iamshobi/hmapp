import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarDays, TrendingUp, Lightbulb } from 'lucide-react-native';
import { borderRadius, spacing } from '../theme';

const PROGRESS_FONT_BOLD = 'Sailec-Bold';

const TABS = [
  { key: 'trend', label: 'Trends', Icon: TrendingUp },
  { key: 'checkins', label: 'Check-ins', Icon: CalendarDays },
  { key: 'insights', label: 'Notes', Icon: Lightbulb },
];

export default function ProgressViewTabs({ activeTab = 'trend', onChange, embedded = false }) {
  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      {TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, active && styles.tabBtnActive]}
            onPress={() => onChange?.(key)}
            activeOpacity={0.86}
          >
            <Icon size={13} color={active ? '#E18B31' : 'rgba(52,37,61,0.65)'} strokeWidth={2} />
            <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{label}</Text>
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
    height: 36,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#F2F2F5',
  },
  tabTxt: {
    fontFamily: PROGRESS_FONT_BOLD,
    color: 'rgba(52,37,61,0.72)',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  tabTxtActive: {
    color: '#E18B31',
  },
});


import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import SettingsHeaderBrandIcon from '../components/icons/SettingsHeaderBrandIcon';


const PAGE_BG = '#F9F9F9';
const TITLE_MAGENTA = '#A1167F';
const TITLE_ROW = '#212121';
const SUBTITLE_ROW = '#757575';
const CHEVRON = '#C4C4C4';
const DIVIDER = 'rgba(0,0,0,0.1)';
const H_PADDING = 22;

function SettingsBrandMark() {
  return (
    <View style={styles.brandBadge} accessibilityRole="image" accessibilityLabel="HeartMath">
      <SettingsHeaderBrandIcon width={35} height={24} />
    </View>
  );
}

function SettingsRow({ title, subtitle, onPress }) {
  const tall = Boolean(subtitle);
  return (
    <TouchableOpacity
      style={[styles.row, tall ? styles.rowWithSubtitle : styles.rowSingle]}
      onPress={onPress}
      activeOpacity={0.55}
    >
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <ChevronRight size={20} color={CHEVRON} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const placeholder = (label) => () => Alert.alert(label, 'Coming soon.');

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: PAGE_BG }]}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14} style={styles.topBarBtn} accessibilityLabel="Go back">
          <ChevronLeft size={28} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <SettingsBrandMark />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Settings</Text>

        <SettingsRow
          title="Session Settings"
          subtitle="Reminders, Green Zone, Breath Pacer, Progress Tracking"
          onPress={placeholder('Session Settings')}
        />
        <SettingsRow title="Get a Sensor" subtitle="Explore other HeartMath products" onPress={placeholder('Get a Sensor')} />
        <SettingsRow
          title="Get a Mentor or Coach"
          subtitle="Find a HeartMath certified coach"
          onPress={placeholder('Get a Mentor or Coach')}
        />
        <SettingsRow title="Contact Us!" subtitle="We're here to support you!" onPress={placeholder('Contact Us')} />

        <View style={styles.sectionDivider} />

        <SettingsRow title="Account Info" onPress={placeholder('Account Info')} />
        <SettingsRow title="App and Sensor" onPress={placeholder('App and Sensor')} />
        <SettingsRow title="Tutorials" onPress={placeholder('Tutorials')} />
        <SettingsRow
          title="Session History"
          onPress={() => navigation.navigate('Progress', { screen: 'SessionHistory' })}
        />
        <SettingsRow title="About Us" onPress={placeholder('About Us')} />
        <SettingsRow title="Terms of Service" onPress={placeholder('Terms of Service')} />
        <SettingsRow title="Privacy Policy" onPress={placeholder('Privacy Policy')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingTop: 4,
    paddingBottom: 12,
  },
  topBarBtn: {
    paddingVertical: 4,
    marginLeft: -2,
  },
  brandBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -2,
  },
  scroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollInner: {
    paddingHorizontal: H_PADDING,
    paddingTop: 4,
  },
  pageTitle: {
    fontFamily: 'Sailec-Bold',
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: TITLE_MAGENTA,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  rowWithSubtitle: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  rowSingle: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 14,
  },
  rowTitle: {
    fontFamily: 'Sailec-Bold',
    fontSize: 16,
    lineHeight: 22,
    color: TITLE_ROW,
  },
  rowSubtitle: {
    fontFamily: 'Sailec-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: SUBTITLE_ROW,
    marginTop: 6,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginTop: 12,
    marginBottom: 12,
  },
});

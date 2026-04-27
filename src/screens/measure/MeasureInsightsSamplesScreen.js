import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

export default function MeasureInsightsSamplesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#D91E79', '#7A2EA5']} style={styles.root}>
      <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.nav}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Insights Samples</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.sub}>Preview all insight layouts with dummy data.</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('SessionInsights', {
              variant: 'firstTime',
              sessionCount: 1,
              stressBefore: 7,
              stressAfter: 4,
              energyBefore: 3,
              energyAfter: 6,
              moodBefore: 4,
              moodAfter: 7,
            })
          }
        >
          <Text style={styles.cardTitle}>First Session sample</Text>
          <Text style={styles.cardBody}>Single-session before/after reflection with milestone dots.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('SessionInsights', {
              variant: 'beginner',
              sessionCount: 14,
              milestoneTarget: 21,
              averages: {
                stressBefore: 6,
                stressAfter: 4,
                energyBefore: 4,
                energyAfter: 6,
                moodBefore: 5,
                moodAfter: 7,
              },
            })
          }
        >
          <Text style={styles.cardTitle}>Beginner sample</Text>
          <Text style={styles.cardBody}>Shows the compact triple-shift summary and milestone progress bar.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('SessionInsights', {
              variant: 'pro',
              sessionCount: 128,
              averages: {
                stressBefore: 6,
                stressAfter: 3,
                energyBefore: 4,
                energyAfter: 7,
                moodBefore: 5,
                moodAfter: 8,
              },
              standoutInsight: 'Your strongest pattern is a clear stress drop after regular sessions.',
            })
          }
        >
          <Text style={styles.cardTitle}>Pro sample</Text>
          <Text style={styles.cardBody}>Includes standout insight and commitment acknowledgment blocks.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('SessionInsights', {
              variant: 'fewSessions',
              sessionCount: 2,
              averages: {
                stressBefore: 7,
                stressAfter: 5,
                energyBefore: 4,
                energyAfter: 5,
                moodBefore: 4,
                moodAfter: 6,
              },
            })
          }
        >
          <Text style={styles.cardTitle}>Very few sessions sample</Text>
          <Text style={styles.cardBody}>Motivational coaching for users with 1-2 sessions so far.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('SessionInsights', {
              variant: 'incompleteSessions',
              incompleteCount: 3,
              completedCount: 1,
            })
          }
        >
          <Text style={styles.cardTitle}>Incomplete sessions sample</Text>
          <Text style={styles.cardBody}>Encourages users to complete sessions for stronger wellness outcomes.</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 20 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#FFF', fontSize: 23, fontWeight: '700' },
  sub: {
    marginTop: 16,
    marginBottom: 18,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  cardBody: { marginTop: 6, color: 'rgba(255,255,255,0.84)', fontSize: 13, lineHeight: 19 },
});

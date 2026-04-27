import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

export default function MeasureGettingStartedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <LinearGradient colors={['#D91E79', '#7A2EA5']} style={styles.root}>
      <View style={{ paddingTop: insets.top + 8, flex: 1 }}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#fff" size={22} />
        </TouchableOpacity>
        <Text style={styles.header}>Getting Started</Text>
        <View style={styles.sheet}>
          <Text style={styles.title}>Measure Your Heart Coherence</Text>
          <Text style={styles.duration}>5 MIN</Text>
          <Text style={styles.body}>
            Align your posture. Prepare to sync your rhythm.
          </Text>
          <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('MeasureConnected')}>
            <Text style={styles.ctaTxt}>Begin alignment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { width: 40, height: 40, marginLeft: 16, justifyContent: 'center' },
  header: { color: '#fff', fontSize: 48, fontWeight: '700', textAlign: 'center', marginTop: 30 },
  sheet: {
    marginTop: 84,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 26,
    paddingVertical: 30,
    flex: 1,
  },
  title: { fontSize: 53, fontWeight: '700', color: '#932277', textAlign: 'center', lineHeight: 64 },
  duration: { fontSize: 36 / 2, color: '#A0A0A7', textAlign: 'center', marginTop: 10, letterSpacing: 0.8 },
  body: { marginTop: 26, fontSize: 21 * 1.8, lineHeight: 63, color: '#26262B', textAlign: 'center' },
  cta: {
    marginTop: 38,
    backgroundColor: '#6F3098',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaTxt: { color: '#fff', fontSize: 21 * 1.2, fontWeight: '700' },
});

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SESSION_MOOD_OPTIONS } from '../constants/sessionMoodOptions';

export default function MoodChooserModal({
  visible,
  title,
  subtitle,
  onSelectMood,
  onSkip,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
          <View style={styles.grid}>
            {SESSION_MOOD_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.moodBtn}
                activeOpacity={0.82}
                onPress={() => onSelectMood && onSelectMood(m.id)}
              >
                <Text style={styles.emoji}>{m.emoji}</Text>
                <Text style={styles.label}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.82}>
            <Text style={styles.skipTxt}>Skip (save as gray)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 24, 0.66)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#142133',
    textAlign: 'center',
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    color: '#5A6672',
    textAlign: 'center',
  },
  grid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodBtn: {
    width: '24%',
    minWidth: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F8FBFF',
  },
  emoji: { fontSize: 22, marginBottom: 4 },
  label: { fontSize: 11, color: '#2A3645', fontWeight: '600', textAlign: 'center' },
  skipBtn: {
    marginTop: 2,
    borderRadius: 12,
    backgroundColor: '#E9EDF2',
    alignItems: 'center',
    paddingVertical: 11,
  },
  skipTxt: { fontSize: 13, fontWeight: '700', color: '#3A4656' },
});

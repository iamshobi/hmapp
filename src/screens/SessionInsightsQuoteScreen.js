import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sessionInsightsTokens } from '../constants/sessionInsights';

const QUOTE_DURATION_MS = 2400;

export default function SessionInsightsQuoteScreen({ quote, onContinue }) {
  useEffect(() => {
    const id = setTimeout(() => {
      onContinue?.();
    }, QUOTE_DURATION_MS);
    return () => clearTimeout(id);
  }, [onContinue]);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[sessionInsightsTokens.colors.gradientTop, sessionInsightsTokens.colors.gradientBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        style={styles.root}
        onPress={onContinue}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Continue to insights"
      >
        <Text style={styles.quote}>{quote}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  quote: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

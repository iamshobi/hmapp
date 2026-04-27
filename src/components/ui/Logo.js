import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const SOURCE = require('../../../assets/icon.png');

/**
 * Brand mark — same asset as launcher (gradient + wordmark), scalable.
 */
export function Logo({ size = 40, style }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={SOURCE}
        style={styles.img}
        resizeMode="contain"
        accessibilityLabel="HeartMath"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
});

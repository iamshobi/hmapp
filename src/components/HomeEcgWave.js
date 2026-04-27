/**
 * Faint ECG-style line for the home hero (Heart Math reference).
 */
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Single-period ECG-ish path, viewBox 0 0 400 56 */
const WAVE_D =
  'M0 28 L24 28 L30 10 L36 46 L42 28 L68 28 L74 8 L80 50 L86 28 L112 28 L118 12 L124 44 L130 28 L156 28 L162 9 L168 48 L174 28 L200 28 L206 11 L212 45 L218 28 L244 28 L250 14 L256 42 L262 28 L288 28 L294 7 L300 48 L306 28 L332 28 L338 13 L344 43 L350 28 L376 28 L382 10 L388 46 L394 28 L420 28';

export default function HomeEcgWave() {
  const { width } = useWindowDimensions();
  const w = Math.max(width, 360);
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={w} height={56} viewBox="0 0 420 56">
        <Path
          d={WAVE_D}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 112,
    alignItems: 'center',
    opacity: 0.9,
  },
});

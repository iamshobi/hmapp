import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CONNECTED_D =
  'M0 46 C16 56, 26 18, 40 28 C54 37, 70 35, 86 30 C100 25, 112 55, 126 44 C140 32, 156 30, 170 38 C186 48, 204 54, 222 37 C236 25, 252 26, 266 31 C284 38, 300 42, 318 34 C332 28, 346 18, 360 12 C374 7, 388 20, 402 33 C416 44, 432 62, 448 48 C462 35, 474 20, 480 16';
const LIVE_D =
  'M0 178 L36 190 L54 204 L72 212 L90 222 L108 228 L126 216 L144 198 L162 174 L180 162 L198 152 L216 158 L234 172 L252 176 L270 179 L288 181 L306 176 L324 170 L342 162 L360 150 L378 142 L396 148 L414 166 L432 182 L450 196 L468 206 L480 212';

export default function MeasurePulseLine({ variant = 'connected' }) {
  const d = variant === 'live' ? LIVE_D : CONNECTED_D;
  const height = variant === 'live' ? 240 : 90;
  const stroke = variant === 'live' ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.92)';
  const strokeWidth = variant === 'live' ? 4 : 3;
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 480 ${height}`} preserveAspectRatio="none">
        <Path
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});

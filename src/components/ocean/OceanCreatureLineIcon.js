/**
 * Fallback when `iconKey` has no PNG in `oceanIconAssets` (unknown / future keys).
 */
import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export default function OceanCreatureLineIcon({ size = 40, color = '#FFFFFF', strokeWidth = 1.6 }) {
  const s = size;
  const vb = 48;
  const common = { stroke: color, strokeWidth, fill: 'none' };
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${vb} ${vb}`}>
      <Circle {...common} cx={24} cy={24} r={14} />
    </Svg>
  );
}

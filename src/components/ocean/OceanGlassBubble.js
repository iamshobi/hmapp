/**
 * Glassy underwater bubble — SVG highlight + soft cyan glass (ocean UI motif).
 */
import React, { useId, useMemo } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export default function OceanGlassBubble({ size = 24, opacity = 1 }) {
  const reactId = useId().replace(/:/g, '');
  const ids = useMemo(
    () => ({
      fill: `ogb_f_${reactId}`,
      edge: `ogb_e_${reactId}`,
      spec: `ogb_s_${reactId}`,
    }),
    [reactId]
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" opacity={opacity}>
      <Defs>
        <RadialGradient id={ids.fill} cx="30%" cy="26%" r="68%" fx="26%" fy="22%">
          <Stop offset="0%" stopColor="#F0FCFF" stopOpacity="0.9" />
          <Stop offset="38%" stopColor="#8FD4F0" stopOpacity="0.42" />
          <Stop offset="100%" stopColor="#1A6FA8" stopOpacity="0.18" />
        </RadialGradient>
        <LinearGradient id={ids.edge} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="rgba(200,240,255,0.95)" />
          <Stop offset="55%" stopColor="rgba(100,190,235,0.55)" />
          <Stop offset="100%" stopColor="rgba(40,120,180,0.45)" />
        </LinearGradient>
        <RadialGradient id={ids.spec} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle
        cx="16"
        cy="16"
        r="13.2"
        fill={`url(#${ids.fill})`}
        stroke={`url(#${ids.edge})`}
        strokeWidth="1.05"
      />
      <Ellipse
        cx="11.2"
        cy="10"
        rx="5.2"
        ry="3.4"
        fill={`url(#${ids.spec})`}
        opacity={0.62}
      />
      <Circle cx="20" cy="21.5" r="2.2" fill="rgba(255,255,255,0.28)" />
    </Svg>
  );
}

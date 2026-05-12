import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';



const VB = 24;


const HEART_FILL_PATH =
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';

function toneToColor(variant) {
  if (variant === 'completed' || variant === 'active') return '#FFFFFF';
  if (variant === 'zero') return '#A9A9B1';
  return '#171717AD';
}


function buildParallelWavePath(centerY, amplitude, x0, x1, fullCycles, segments = 28) {
  let d = '';
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const x = x0 + t * (x1 - x0);
    const y = centerY - amplitude * Math.sin(t * fullCycles * 2 * Math.PI);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  return d;
}

function buildSpiralPath(cx, cy, turns, maxR, segments = 56) {
  let d = '';
  for (let i = 0; i <= segments; i += 1) {
    const u = i / segments;
    const theta = u * turns * 2 * Math.PI;
    const r = u * maxR;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  return d;
}

function SettleGlyph({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <Circle cx={12} cy={12} r={4.25} fill={color} />
    </Svg>
  );
}

function FlowGlyph({ color, size }) {
  const amp = 2.25;
  const upper = buildParallelWavePath(9.6, amp, 3, 21, 2);
  const lower = buildParallelWavePath(14.4, amp, 3, 21, 2);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} fill="none">
      <Path
        d={upper}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={lower}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DeepGlyph({ color, size }) {
  const spiral = buildSpiralPath(12, 12, 3.1, 9.2, 58);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} fill="none">
      <Path
        d={spiral}
        stroke={color}
        strokeWidth={1.65}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


const STILL_INACTIVE_STROKE = '#9B9BA8';
const STILL_INACTIVE_FILL = 'rgba(155, 155, 168, 0.28)';

function StillGlyph({ color, size, variant }) {
  const isInactive = variant === 'future' || variant === 'zero';

  if (isInactive) {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} fill="none">
        <Path
          d={HEART_FILL_PATH}
          fill={STILL_INACTIVE_FILL}
          stroke={STILL_INACTIVE_STROKE}
          strokeWidth={1.55}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const bodyGradId = `stillBody${uid}`;
  const shineGradId = `stillShine${uid}`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} fill="none">
      <Defs>
        <LinearGradient
          id={bodyGradId}
          x1="5"
          y1="5"
          x2="21"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="0.38" stopColor="#FFF8F0" stopOpacity="1" />
          <Stop offset="1" stopColor="#F0E4DC" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient
          id={shineGradId}
          x1="3"
          y1="4"
          x2="17"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="0.28" stopColor="#FFFFFF" stopOpacity="0.22" />
          <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.04" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path
        d={HEART_FILL_PATH}
        fill={`url(#${bodyGradId})`}
        stroke={color}
        strokeWidth={0.55}
        strokeOpacity={0.95}
        strokeLinejoin="round"
      />
      <Path d={HEART_FILL_PATH} fill={`url(#${shineGradId})`} />
    </Svg>
  );
}

const GLYPHS = {
  Settle: SettleGlyph,
  Flow: FlowGlyph,
  Deep: DeepGlyph,
  Still: StillGlyph,
};


function ActivePhasePulseWrap({ size, children }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.stopAnimation();
      pulse.setValue(1);
    };
  }, [pulse]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pulse }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * @param {object} props
 * @param {'Settle'|'Flow'|'Deep'|'Still'} props.phase
 * @param {'completed'|'active'|'future'|'zero'} props.variant
 * @param {number} [props.size]
 */
export function JourneyPhaseIcon({ phase, variant, size = 18 }) {
  const Glyph = GLYPHS[phase] || SettleGlyph;
  const color = toneToColor(variant);
  const glyph = <Glyph color={color} size={size} variant={variant} />;
  if (variant === 'active') {
    return <ActivePhasePulseWrap size={size}>{glyph}</ActivePhasePulseWrap>;
  }
  return glyph;
}

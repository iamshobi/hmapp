import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Stop,
  Path,
} from 'react-native-svg';
import {
  Heart,
  Activity,
  BarChart2,
  Shield,
  Star,
  Award,
  Flame,
  Zap,
  Target,
  RefreshCw,
  Gem,
  Lock,
} from 'lucide-react-native';

function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(' ');
}

function AsteriskMark({ size, color, strokeWidth = 2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const ICON_MAP = {
  Heart,
  Activity,
  BarChart2,
  Shield,
  Star,
  Award,
  Flame,
  Zap,
  Target,
  RefreshCw,
  Gem,
};

/**
 * @param {object} props
 * @param {import('../../data/heartMathBadges').HeartMathBadge} props.badge
 * @param {number} [props.size]
 * @param {boolean} props.unlocked
 */
export default function HexBadgeRN({ badge, size = 68, unlocked }) {
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const points = hexPoints(cx, cy, r);
  const gradId = `hbgrad${badge.id.replace(/-/g, '')}`;
  const iconSize = Math.round(size * 0.36);
  const IconComp = ICON_MAP[badge.iconKey];
  const lockedGray = ['#D1D5DB', '#9CA3AF'];

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: unlocked ? badge.glowColor : 'transparent',
        shadowOpacity: unlocked ? 0.35 : 0,
        shadowRadius: unlocked ? 10 : 0,
        shadowOffset: { width: 0, height: 4 },
        elevation: unlocked ? 6 : 0,
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={unlocked ? badge.gradient[0] : lockedGray[0]} />
            <Stop offset="100%" stopColor={unlocked ? badge.gradient[1] : lockedGray[1]} />
          </SvgLinearGradient>
        </Defs>
        <Polygon points={points} fill={`url(#${gradId})`} />
      </Svg>
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pointerEvents="none"
      >
        {unlocked ? (
          badge.iconKey === 'Asterisk' ? (
            <AsteriskMark size={iconSize} color="rgba(255,255,255,0.97)" />
          ) : IconComp ? (
            <IconComp size={iconSize} color="rgba(255,255,255,0.97)" strokeWidth={2} />
          ) : null
        ) : (
          <Lock size={Math.round(iconSize * 0.75)} color="rgba(255,255,255,0.45)" strokeWidth={2} />
        )}
      </View>
    </View>
  );
}

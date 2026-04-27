/**
 * Open shell with pearl — white line art for “My Shell Collection” (Ocean Dive).
 * Vector matches the oyster/clam + pearl motif; `color` defaults to theme white.
 */
import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export default function MyShellCollectionIcon({ size = 22, color = '#FFFFFF' }) {
  const c = color;
  const sw = 2.35;
  const ridge = 1.35;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Top valve — fan / scalloped dome */}
      <Path
        d="M14 32c0-16 9-24 18-24s18 8 18 24"
        fill="none"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 32c2-12 9-18 16-18s14 6 16 18"
        fill="none"
        stroke={c}
        strokeWidth={sw * 0.78}
        strokeLinecap="round"
      />
      {/* Bottom valve — bowl */}
      <Path
        d="M14 32c0 16 9 24 18 24s18-8 18-24"
        fill="none"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 32c2 12 9 18 16 18s14-6 16-18"
        fill="none"
        stroke={c}
        strokeWidth={sw * 0.78}
        strokeLinecap="round"
      />
      {/* Ridges — upper valve */}
      <Line x1="32" y1="30" x2="32" y2="12" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      <Line x1="24" y1="28" x2="18" y2="16" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      <Line x1="40" y1="28" x2="46" y2="16" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      <Line x1="28" y1="29" x2="24" y2="14" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      {/* Ridges — lower valve */}
      <Line x1="32" y1="34" x2="32" y2="52" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      <Line x1="24" y1="36" x2="18" y2="48" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      <Line x1="40" y1="36" x2="46" y2="48" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      <Line x1="28" y1="35" x2="24" y2="50" stroke={c} strokeWidth={ridge} strokeLinecap="round" />
      {/* Pearl */}
      <Circle cx="32" cy="38" r="4" fill={c} />
    </Svg>
  );
}

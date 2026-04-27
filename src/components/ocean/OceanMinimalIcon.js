/**
 * Minimal line icons — ocean / marine / nautical. Stroke-only, HM shell friendly.
 */
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function OceanMinimalIcon({
  iconKey,
  size = 40,
  color = '#FFFFFF',
  strokeWidth = 1.55,
}) {
  const p = {
    stroke: color,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const shapes = (() => {
    switch (iconKey) {
      case 'oceanSunlit':
        return (
          <>
            <Circle cx="10" cy="8.5" r="3.25" {...p} />
            <Path d="M2 17.5c2.3-1.7 4.8-1.7 7.1 0s4.8 1.7 7.1 0 4.8-1.7 7.1 0" {...p} />
          </>
        );
      case 'oceanTwilight':
        return (
          <>
            <Path d="M12 5.5c3.2 0 5.5 2.5 5.5 5.3S15.2 16 12 16 6.5 13.5 6.5 10.8 8.8 5.5 12 5.5z" {...p} />
            <Path d="M9 15.5v3M12 16.5v3.5M15 15.5v3" {...p} />
          </>
        );
      case 'oceanJellyBloom':
        return (
          <>
            <Path d="M12 5c3.6 0 6.5 2.7 6.5 6.1 0 2.2-1.2 4.1-3 5.2" {...p} />
            <Path d="M8.5 16.2c-1-1.8-1.5-3.7-1.5-5.1C7 8.9 9.3 6 12 6" {...p} />
            <Path d="M9 17v4M12 17.5v4M15 17v4" {...p} />
          </>
        );
      case 'oceanAnchor':
        return (
          <>
            <Path d="M12 3.5v14M8.5 10.5h7" {...p} />
            <Path d="M9.5 16.5c1.2 2 2.5 3 2.5 3s1.3-1 2.5-3" {...p} />
            <Circle cx="12" cy="6" r="1.8" {...p} />
          </>
        );
      case 'oceanDeepFish':
        return (
          <>
            <Path d="M3 12.5c4-2.2 8.2-2.2 12.5 0-1.8 1.8-3.8 2.8-6 3.2" {...p} />
            <Path d="M15.5 9.5l5-2.5v10l-5-2.5" {...p} />
            <Circle cx="7.5" cy="11" r="0.9" fill={color} stroke="none" />
          </>
        );
      case 'oceanTrench':
        return (
          <>
            <Path d="M7 7l5 11 5-11" {...p} />
            <Path d="M5.5 19.5h13" {...p} />
          </>
        );
      case 'oceanWave':
        return <Path d="M2 14c2.5-2.5 5.5-2.5 8 0s5.5 2.5 8 0 2.5-2.5 6-2.5" {...p} />;
      case 'oceanShell':
        return (
          <Path
            d="M12 19.5c-4 0-6.5-3-6.5-6.5S9.5 6.5 12 4.5c2.5 2 6.5 4.8 6.5 8.5S16 19.5 12 19.5z"
            {...p}
          />
        );
      case 'oceanPearl':
        return (
          <>
            <Circle cx="12" cy="12" r="6.2" {...p} />
            <Circle cx="10" cy="10" r="2.1" fill="rgba(255,255,255,0.42)" stroke="none" />
          </>
        );
      case 'oceanCompass':
        return (
          <>
            <Circle cx="12" cy="12" r="8" {...p} />
            <Path d="M12 6.5l1.8 4.7 4.7 1.8-4.7 1.8L12 18.5l-1.8-4.7L5.5 12l4.7-1.8z" {...p} />
          </>
        );
      case 'oceanWheel':
        return (
          <>
            <Circle cx="12" cy="12" r="7" {...p} />
            <Circle cx="12" cy="12" r="1.8" {...p} />
            <Path d="M12 5v14M5 12h14M7 7l10 10M17 7L7 17" {...p} />
          </>
        );
      case 'oceanBuoy':
        return (
          <>
            <Path d="M12 4v3.5" {...p} />
            <Path d="M9 9.5h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2z" {...p} />
            <Path d="M12 19.5V22" {...p} />
          </>
        );
      case 'oceanFin':
        return <Path d="M12 4.5c-1.5 4-1.5 8 0 12 2-2.5 3.5-6 3.5-9.5S14 7 12 4.5z" {...p} />;
      case 'oceanKnot':
        return (
          <Path
            d="M8.5 8.5c2-2 5-2 7 0s2 5 0 7-5 2-7 0-2-5 0-7zm0 7c2 2 5 2 7 0s2-5 0-7-5-2-7 0-2 5 0 7z"
            {...p}
          />
        );
      default:
        return <Circle cx="12" cy="12" r="6" {...p} />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes}
    </Svg>
  );
}

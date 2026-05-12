import React, { useId } from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { settingsBrandBadgeSvgGradient } from '../../theme';

export default function SettingsHeaderBrandIcon({ width = 35, height = 24 }) {
  const reactId = useId();
  const gradId = `settingsBrandGrad_${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const g = settingsBrandBadgeSvgGradient;

  return (
    <Svg width={width} height={height} viewBox="0 0 35 24" fill="none">
      <Defs>
        <LinearGradient
          id={gradId}
          x1={g.x1}
          y1={g.y1}
          x2={g.x2}
          y2={g.y2}
          gradientUnits="userSpaceOnUse"
        >
          {g.stops.map((s, i) => (
            <Stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </LinearGradient>
      </Defs>
      <Path
        d="M10.4833 16.0162H6.01614V20.5488H4.46711V16.0162H0V14.4444H4.46711V9.91182H6.01614V14.4444H10.4833V16.0162ZM27.287 12.372C27.3305 7.72963 21.8067 6.67085 19.8199 9.78357C17.8331 6.67085 12.3093 7.72963 12.3528 12.372C12.3963 17.0062 18.9594 21.0536 19.7784 21.5409L19.8199 21.5655L19.8614 21.5409C20.6804 21.0536 27.2435 17.0062 27.287 12.372Z"
        fill={`url(#${gradId})`}
      />
      <Path
        d="M30.2534 0L30.2856 0.126832C30.8775 2.45952 32.6778 4.29386 34.999 4.92937C32.6778 5.56487 30.8775 7.39922 30.2856 9.73191L30.2534 9.85874L30.2212 9.73191C29.6293 7.39922 27.829 5.56487 25.5078 4.92937C27.829 4.29386 29.6293 2.45952 30.2212 0.126832L30.2534 0Z"
        fill={`url(#${gradId})`}
      />
      <Path
        d="M10.7082 17.8379L10.7283 17.9172C11.0983 19.3751 12.2235 20.5216 13.6742 20.9187C12.2235 21.3159 11.0983 22.4624 10.7283 23.9203L10.7082 23.9996L10.6881 23.9203C10.3181 22.4624 9.19293 21.3159 7.74219 20.9187C9.19293 20.5216 10.3181 19.3751 10.6881 17.9172L10.7082 17.8379Z"
        fill={`url(#${gradId})`}
      />
    </Svg>
  );
}

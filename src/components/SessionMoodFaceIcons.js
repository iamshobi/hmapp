/**
 * Session Complete — "How do you feel now?" faces (30×30 viewBox, scaled to `size`).
 */
import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';

/** @typedef {'verySad' | 'sad' | 'neutral' | 'happy' | 'veryHappy'} SessionMoodFaceKey */

export default function SessionMoodFaceIcon({ size = 30, faceKey, dimmed = false }) {
  const op = dimmed ? 0.78 : 1;
  const common = { width: size, height: size, viewBox: '0 0 30 30', opacity: op };

  switch (faceKey) {
    case 'verySad':
      return (
        <Svg {...common}>
          <Circle cx={15} cy={15} r={14} fill="#5B7CE6" stroke="#4A63B8" strokeWidth={1} />
          <Circle cx={10} cy={12} r={1.5} fill="#2D3E7F" />
          <Circle cx={20} cy={12} r={1.5} fill="#2D3E7F" />
          <Path
            d="M9 21C9 21 11 18 15 18C19 18 21 21 21 21"
            stroke="#2D3E7F"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
    case 'sad':
      return (
        <Svg {...common}>
          <Circle cx={15} cy={15} r={14} fill="#6B9FF5" stroke="#5586D8" strokeWidth={1} />
          <Circle cx={10} cy={12} r={1.5} fill="#2D4A8A" />
          <Circle cx={20} cy={12} r={1.5} fill="#2D4A8A" />
          <Path
            d="M10 20C10 20 11.5 19 15 19C18.5 19 20 20 20 20"
            stroke="#2D4A8A"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
    case 'neutral':
      return (
        <Svg {...common}>
          <Circle cx={15} cy={15} r={14} fill="#7DC4E4" stroke="#63A8C4" strokeWidth={1} />
          <Circle cx={10} cy={12} r={1.5} fill="#2D5A6E" />
          <Circle cx={20} cy={12} r={1.5} fill="#2D5A6E" />
          <Line x1={10} y1={19.5} x2={20} y2={19.5} stroke="#2D5A6E" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );
    case 'happy':
      return (
        <Svg {...common}>
          <Circle cx={15} cy={15} r={14} fill="#66C6A6" stroke="#52A088" strokeWidth={1} />
          <Circle cx={10} cy={12} r={1.5} fill="#2D5F4E" />
          <Circle cx={20} cy={12} r={1.5} fill="#2D5F4E" />
          <Path
            d="M10 18C10 18 11.5 21 15 21C18.5 21 20 18 20 18"
            stroke="#2D5F4E"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
    case 'veryHappy':
      return (
        <Svg {...common}>
          <Circle cx={15} cy={15} r={14} fill="#A3D97B" stroke="#85BA60" strokeWidth={1} />
          <Circle cx={10} cy={12} r={1.5} fill="#3F6B2D" />
          <Circle cx={20} cy={12} r={1.5} fill="#3F6B2D" />
          <Path
            d="M9 17C9 17 11 22 15 22C19 22 21 17 21 17"
            stroke="#3F6B2D"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      );
    default:
      return null;
  }
}

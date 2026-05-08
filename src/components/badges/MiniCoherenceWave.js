import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

const PATH_HIGH =
  'M0,20 Q8,8 16,20 Q22,28 28,20 L31,20 L34,3 L37,37 L40,20 Q48,8 56,20 Q62,30 68,20 L71,20 L74,3 L77,37 L80,20 Q88,8 96,20 Q102,30 108,20 L111,20 L114,3 L117,37 L120,20 Q128,8 136,20 Q142,30 148,20 L151,20 L154,3 L157,37 L160,20 Q168,8 176,20 L200,20';
const PATH_MID =
  'M0,20 Q12,8 24,20 Q32,28 40,20 L44,20 L48,4 L52,36 L56,20 Q68,8 80,20 Q88,30 96,20 L100,20 L104,4 L108,36 L112,20 Q124,8 136,20 Q144,30 152,20 L156,20 L160,4 L164,36 L168,20 Q180,8 200,20';
const PATH_LOW =
  'M0,20 Q15,10 30,20 Q40,26 50,20 L55,20 L60,5 L65,35 L70,20 Q85,12 100,20 Q110,26 120,20 L125,20 L130,5 L135,35 L140,20 Q155,12 170,20 Q182,26 200,20';

export default function MiniCoherenceWave({ coherence = 2 }) {
  const d = coherence >= 4 ? PATH_HIGH : coherence >= 2.5 ? PATH_MID : PATH_LOW;
  return (
    <View style={{ width: '100%', height: 40 }}>
      <Svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="wave-grad-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <Stop offset="10%" stopColor="rgba(255,255,255,0.7)" />
            <Stop offset="90%" stopColor="rgba(255,255,255,0.7)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={d}
          stroke="url(#wave-grad-b)"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

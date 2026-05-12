
import React from 'react';
import { View, Platform } from 'react-native';
import { isOceanMinimalIconKey } from '../../constants/oceanIconAssets';
import OceanCreatureLineIcon from './OceanCreatureLineIcon';
import OceanIconDrift from './OceanIconDrift';
import OceanMinimalIcon from './OceanMinimalIcon';


function outerHaloStyle(size, glowColor) {
  return {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.72,
        shadowRadius: size * 0.55,
      },
      android: {
        elevation: 18,
        shadowColor: glowColor,
      },
      default: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.68,
        shadowRadius: size * 0.52,
      },
    }),
  };
}


function innerCoreStyle(glowColor) {
  return {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1.0,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
        shadowColor: glowColor,
      },
      default: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.95,
        shadowRadius: 6,
      },
    }),
  };
}

function BioGlowWrap({ size, glowColor, children }) {
  return (
    <View style={outerHaloStyle(size, glowColor)}>
      <View style={innerCoreStyle(glowColor)}>
        {children}
      </View>
    </View>
  );
}

export default function OceanLineIcon({
  iconKey,
  size = 40,
  color = '#FFFFFF',
  strokeWidth = 1.6,
  animated = true,
  glow = false,
  glowColor = '#8FEFFF',
}) {
  if (isOceanMinimalIconKey(iconKey)) {
    const svg = (
      <OceanMinimalIcon iconKey={iconKey} size={size} color={color} strokeWidth={strokeWidth} />
    );
    const inner = glow
      ? <BioGlowWrap size={size} glowColor={glowColor}>{svg}</BioGlowWrap>
      : svg;
    return (
      <OceanIconDrift size={size} enabled={animated}>
        {inner}
      </OceanIconDrift>
    );
  }
  return (
    <OceanIconDrift size={size} enabled={animated}>
      <OceanCreatureLineIcon size={size} color={color} strokeWidth={strokeWidth} />
    </OceanIconDrift>
  );
}

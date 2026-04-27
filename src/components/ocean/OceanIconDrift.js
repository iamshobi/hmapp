/**
 * Subtle floating motion for ocean PNG/SVG icons (native-driver friendly).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export default function OceanIconDrift({ children, size, enabled = true }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [enabled, t]);

  if (!enabled) return children;

  const translateY = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -3, 0],
  });
  const translateX = t.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 1.6, 0, -1.6, 0],
  });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: ['-0.85deg', '0.85deg'],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    >
      {children}
    </Animated.View>
  );
}

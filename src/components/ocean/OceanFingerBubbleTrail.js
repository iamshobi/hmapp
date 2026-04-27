/**
 * Finger-drag micro-interaction: short-lived bubbles along the stroke (below shell hit layer).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const MIN_STEP_PX = 7;
const MAX_TRAIL = 36;
const FADE_MS = 520;

function TrailDot({ dotId, x, y, size, removeDot }) {
  const opacity = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const t = Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    });
    t.start(({ finished }) => {
      if (finished) removeDot(dotId);
    });
    return () => t.stop();
  }, [dotId, opacity, removeDot]);

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left: x - half,
          top: y - half,
          width: size,
          height: size,
          borderRadius: half,
          opacity,
        },
      ]}
    />
  );
}

export default function OceanFingerBubbleTrail() {
  const [dots, setDots] = useState([]);
  const idRef = useRef(0);
  const lastRef = useRef({ x: null, y: null });

  const spawn = useCallback((x, y) => {
    const id = idRef.current++;
    const size = 5 + ((id * 17) % 5);
    setDots((prev) => {
      const next = [...prev, { id, x, y, size }];
      if (next.length > MAX_TRAIL) next.splice(0, next.length - MAX_TRAIL);
      return next;
    });
  }, []);

  const removeDot = useCallback((id) => {
    setDots((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          lastRef.current = { x: locationX, y: locationY };
          spawn(locationX, locationY);
        },
        onPanResponderMove: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          const lx = lastRef.current.x;
          const ly = lastRef.current.y;
          if (lx == null || ly == null) {
            lastRef.current = { x: locationX, y: locationY };
            spawn(locationX, locationY);
            return;
          }
          const dx = locationX - lx;
          const dy = locationY - ly;
          if (dx * dx + dy * dy >= MIN_STEP_PX * MIN_STEP_PX) {
            spawn(locationX, locationY);
            lastRef.current = { x: locationX, y: locationY };
          }
        },
        onPanResponderRelease: () => {
          lastRef.current = { x: null, y: null };
        },
        onPanResponderTerminate: () => {
          lastRef.current = { x: null, y: null };
        },
      }),
    [spawn]
  );

  return (
    <View style={styles.layer} {...panResponder.panHandlers}>
      {dots.map((d) => (
        <TrailDot
          key={d.id}
          dotId={d.id}
          x={d.x}
          y={d.y}
          size={d.size}
          removeDot={removeDot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
    elevation: 15,
  },
  dot: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 240, 255, 0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.38)',
  },
});

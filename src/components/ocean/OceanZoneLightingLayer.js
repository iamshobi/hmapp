
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const NUM_RAYS = 9;

const RAY_ANGLES = [-40, -28, -18, -9, 0, 9, 18, 28, 40];

const RAY_SWAY = 3.2;
const NUM_CAUSTICS = 20;


const CAUSTICS = Array.from({ length: NUM_CAUSTICS }, (_, i) => {
  const t = i * 2.3999; // golden-angle-like spacing
  return {
    xFrac:    Math.sin(t * 1.31) * 0.42 + 0.5,        // 0.08 … 0.92
    yFrac:    (Math.cos(t * 0.79) * 0.5 + 0.5) * 0.46, // 0 … 0.46
    size:     2.8 + (i % 5) * 1.3,
    pulseDur: 620 + (i * 173) % 740,
    delay:    (i * 127) % 950,
  };
});


function clamp01(v) { return Math.max(0, Math.min(1, v)); }


function rayIntensity(depthM) {
  if (depthM <= 0)   return 1;
  if (depthM >= 920) return 0;
  if (depthM <= 200) return clamp01(1 - 0.52 * (depthM / 200));
  return clamp01(0.48 * (1 - (depthM - 200) / 720));
}


function causticIntensity(depthM) {
  if (depthM <= 0)   return 1;
  if (depthM >= 185) return 0;
  return clamp01(1 - depthM / 185);
}


function blueWashIntensity(depthM) {
  if (depthM <= 200 || depthM >= 1000) return 0;
  const t = (depthM - 200) / 800;
  return clamp01(Math.sin(t * Math.PI) * 0.38);
}

export default function OceanZoneLightingLayer({ depthM = 0 }) {
  const { width: W, height: H } = useWindowDimensions();

  
  const swayAnims   = useRef(RAY_ANGLES.map(() => new Animated.Value(0))).current;
  const pulseAnims  = useRef(CAUSTICS.map(() => new Animated.Value(0))).current;
  const driftAnims  = useRef(CAUSTICS.map(() => new Animated.Value(0))).current;

  
  useEffect(() => {
    let loops = [];
    const t = setTimeout(() => {
      loops = swayAnims.map((anim, i) => {
        const dur = 3400 + i * 310;
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1, duration: dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: -1, duration: dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
      });
      loops.forEach(l => l.start());
    }, 600);
    return () => { clearTimeout(t); loops.forEach(l => l.stop()); };
  }, [swayAnims]);

  
  useEffect(() => {
    let loops = [];
    const t = setTimeout(() => {
      loops = [
        ...pulseAnims.map((anim, i) => {
          const { pulseDur, delay } = CAUSTICS[i];
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(anim, { toValue: 1, duration: pulseDur, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0.08, duration: pulseDur, useNativeDriver: true }),
            ])
          );
        }),
        ...driftAnims.map((anim, i) => {
          const dur = 2800 + (i * 211) % 1600;
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1, duration: dur,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: -1, duration: dur,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
            ])
          );
        }),
      ];
      loops.forEach(l => l.start());
    }, 600);
    return () => { clearTimeout(t); loops.forEach(l => l.stop()); };
  }, [pulseAnims, driftAnims]);

  
  const rI  = rayIntensity(depthM);
  const cI  = causticIntensity(depthM);
  const bwI = blueWashIntensity(depthM);

  
  if (rI < 0.005 && cI < 0.005 && bwI < 0.005) return null;

  const rayH    = H * 0.88;
  const rayTopW = 10;
  const rayBotW = Math.max(W * 0.1, 32);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      
      {rI > 0 && (
        <LinearGradient
          colors={[
            `rgba(160,215,255,${0.13 * rI})`,
            `rgba(100,175,255,${0.06 * rI})`,
            'transparent',
          ]}
          style={[StyleSheet.absoluteFill, { height: H * 0.5 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      )}

      {rI > 0 &&
        RAY_ANGLES.map((baseDeg, i) => {
          const rotate = swayAnims[i].interpolate({
            inputRange: [-1, 1],
            outputRange: [`${baseDeg - RAY_SWAY}deg`, `${baseDeg + RAY_SWAY}deg`],
          });
          return (
            <Animated.View
              key={`ray-${i}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: W / 2 - rayBotW / 2,
                width: rayBotW,
                height: rayH,
                transform: [{ rotate }],
              }}
            >
              <LinearGradient
                colors={[
                  'rgba(255,248,210,0.30)',
                  'rgba(190,225,255,0.13)',
                  'rgba(130,195,255,0.05)',
                  'transparent',
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ width: '100%', height: '100%' }}
                pointerEvents="none"
              />
            </Animated.View>
          );
        })}

      
      {cI > 0 && CAUSTICS.map((c, i) => {
        const dotOpacity = pulseAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, cI * 0.7],
        });
        const driftY = driftAnims[i].interpolate({
          inputRange: [-1, 1],
          outputRange: [-4, 4],
        });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: c.xFrac * W - c.size / 2,
              top:  c.yFrac * H,
              width:  c.size,
              height: c.size,
              borderRadius: c.size / 2,
              backgroundColor: 'rgba(215,240,255,0.95)',
              opacity: dotOpacity,
              transform: [{ translateY: driftY }],
            }}
          />
        );
      })}

      
      {bwI > 0 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(8, 28, 76, ${bwI})` },
          ]}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({});

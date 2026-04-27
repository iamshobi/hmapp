/**
 * OceanSeafloorLayer — coral, kelp, anemones, and rocks rendered at the
 * bottom of the screen, matching the HTML reference's coral-canvas layer.
 *
 * Visible zones:
 *   Epipelagic  (0–200 m)  → full  (warm tropical coral + kelp)
 *   Mesopelagic (200–650 m)→ fades (cool tones, then gone)
 *   Below 650 m            → invisible (returns null)
 *
 * Animations:
 *   · Kelp blades — each sways via Animated.Value rotation pivoted at the base.
 *   · Anemone caps — slow gentle sway.
 *   · All on native driver.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Ellipse, Circle, Line } from 'react-native-svg';

/* ── Depth → intensity ─────────────────────────────────────── */
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function floorIntensity(depthM) {
  if (depthM <= 80)  return 1;
  if (depthM >= 650) return 0;
  return clamp01(1 - (depthM - 80) / 570);
}

/* Color shift: warm at surface → cool below 200 m */
function colorShift(depthM) {
  return clamp01((depthM - 100) / 200); // 0 = epipelagic palette, 1 = meso palette
}

/* ── Kelp blade data ──────────────────────────────────────── */
const KELP = [
  { x: 0.03,  h: 115, w: 6,  clr: '#2D6840', sway: 8,  period: 3800, delay: 0    },
  { x: 0.07,  h: 88,  w: 5,  clr: '#3A7848', sway: 10, period: 4300, delay: 900  },
  { x: 0.12,  h: 130, w: 5,  clr: '#204E30', sway: 7,  period: 3500, delay: 400  },
  { x: 0.18,  h: 95,  w: 6,  clr: '#367040', sway: 9,  period: 4600, delay: 1400 },
  { x: 0.23,  h: 75,  w: 4,  clr: '#2D6840', sway: 11, period: 3200, delay: 700  },
  { x: 0.61,  h: 118, w: 6,  clr: '#2D6840', sway: 8,  period: 4100, delay: 200  },
  { x: 0.66,  h: 90,  w: 5,  clr: '#3A7848', sway: 10, period: 3700, delay: 1100 },
  { x: 0.71,  h: 106, w: 5,  clr: '#204E30', sway: 7,  period: 4400, delay: 600  },
  { x: 0.84,  h: 94,  w: 6,  clr: '#3A7848', sway: 9,  period: 3900, delay: 300  },
  { x: 0.89,  h: 78,  w: 4,  clr: '#2D6840', sway: 11, period: 4300, delay: 1700 },
  { x: 0.94,  h: 116, w: 5,  clr: '#367040', sway: 8,  period: 3600, delay: 800  },
];

/* ── Single animated kelp blade ────────────────────────────── */
function KelpBlade({ x, h, w, clr, sway, period, delay, W }) {
  const anim      = useRef(new Animated.Value(0)).current;
  // Use Animated.Values for the pivot offsets so ALL transforms in the array are
  // animated values — mixing static numbers with native-animated values in the same
  // transform array crashes the Android New Architecture native compositor.
  const pivotDown = useRef(new Animated.Value(h / 2)).current;
  const pivotUp   = useRef(new Animated.Value(-h / 2)).current;

  useEffect(() => {
    let loop = null;
    const t = setTimeout(() => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1, duration: period,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -1, duration: period,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    }, 300);
    return () => { clearTimeout(t); loop && loop.stop(); };
  }, [anim, delay, period]);

  const rot = anim.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${sway}deg`, `${sway}deg`],
  });

  /* Pivot at base — all three transforms are Animated values (native driver safe) */
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: x * W - w / 2,
        width: w,
        height: h,
        borderTopLeftRadius: w / 2,
        borderTopRightRadius: w / 2,
        overflow: 'hidden',
        transform: [
          { translateY: pivotDown },
          { rotate: rot },
          { translateY: pivotUp },
        ],
      }}
    >
      <LinearGradient
        colors={[`${clr}28`, `${clr}CC`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

/* ── Anemone cap sway ─────────────────────────────────────── */
function AnemoneSwayWrap({ cx, cy, period, delay, swayDeg, children }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop = null;
    const t = setTimeout(() => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1, duration: period,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -1, duration: period,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    }, 300);
    return () => { clearTimeout(t); loop && loop.stop(); };
  }, [anim, delay, period]);

  const rot = anim.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${swayDeg}deg`, `${swayDeg}deg`],
  });

  /* Pivot at (cx, cy) — shift to pivot, rotate, shift back */
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        width: 0,
        height: 0,
        transform: [{ rotate: rot }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function OceanSeafloorLayer({ depthM = 0 }) {
  const { width: W, height: H } = useWindowDimensions();

  const intensity = floorIntensity(depthM);
  if (intensity < 0.01) return null;

  /* Coral color tone: warm (epipelagic) or cool (mesopelagic) */
  const cs = colorShift(depthM);
  const fanColor   = cs < 0.5 ? '#C85060' : '#487098';
  const anemColor  = cs < 0.5 ? '#E070B8' : '#6080B8';
  const anemStem   = cs < 0.5 ? '#A04080' : '#385888';
  const petalGlow  = cs < 0.5 ? '#FF90D0' : '#90C0E8';

  /* SVG strip: full width, 180px from bottom */
  const SH = 180; // SVG height
  const sy = H - SH; // top of SVG strip

  /* Fan coral branch helper — returns an SVG Path d string */
  const branch = (x0, y0, x1, y1) =>
    `M ${x0.toFixed(1)},${y0.toFixed(1)} Q ${((x0+x1)/2 + (y1-y0)*0.18).toFixed(1)},${((y0+y1)/2).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;

  /* Anemone tentacle paths radiating from (0, 0) — 8 arms */
  const tentacles = (r) => {
    const n = 8;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const ex = Math.cos(a) * r;
      const ey = Math.sin(a) * r * 0.6;
      return `M 0,0 Q ${(ex * 0.5).toFixed(1)},${(ey * 0.5 - 4).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: intensity }]}
    >
      {/* ── Sand / seafloor base gradient ── */}
      <LinearGradient
        colors={['transparent', 'rgba(12,28,44,0.65)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28 }}
        pointerEvents="none"
      />

      {/* ── Animated kelp blades ── */}
      {KELP.map((k, i) => <KelpBlade key={i} {...k} W={W} />)}

      {/* ── Static SVG: rocks, fan corals, anemone bases ── */}
      <Svg
        width={W}
        height={SH}
        style={{ position: 'absolute', bottom: 0, left: 0 }}
        pointerEvents="none"
      >
        {/* ── Rocks ── */}
        <Ellipse cx={W * 0.10} cy={SH - 9}  rx={22} ry={13} fill="#1C2C3A" opacity={0.85}/>
        <Ellipse cx={W * 0.29} cy={SH - 6}  rx={14} ry={8}  fill="#243444" opacity={0.8} />
        <Ellipse cx={W * 0.50} cy={SH - 8}  rx={20} ry={12} fill="#1A2A38" opacity={0.85}/>
        <Ellipse cx={W * 0.73} cy={SH - 7}  rx={26} ry={14} fill="#182838" opacity={0.85}/>
        <Ellipse cx={W * 0.91} cy={SH - 6}  rx={15} ry={9}  fill="#243444" opacity={0.8} />
        {/* Small pebbles */}
        <Ellipse cx={W * 0.42} cy={SH - 4}  rx={7}  ry={4}  fill="#1E2E3C" opacity={0.65}/>
        <Ellipse cx={W * 0.56} cy={SH - 3}  rx={5}  ry={3}  fill="#1E2E3C" opacity={0.55}/>

        {/* ── Fan coral 1 ── (left-centre cluster) */}
        {/* Main stem */}
        <Path d={`M ${W*0.36},${SH} L ${W*0.36},${SH-78}`}
          stroke={fanColor} strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={0.85}/>
        {/* Left branch */}
        <Path d={branch(W*0.36, SH-55, W*0.22, SH-82)}
          stroke={fanColor} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.8}/>
        {/* Right branch */}
        <Path d={branch(W*0.36, SH-55, W*0.50, SH-84)}
          stroke={fanColor} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.8}/>
        {/* Top-left */}
        <Path d={branch(W*0.36, SH-78, W*0.24, SH-112)}
          stroke={fanColor} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.75}/>
        {/* Top-right */}
        <Path d={branch(W*0.36, SH-78, W*0.48, SH-114)}
          stroke={fanColor} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.75}/>
        {/* Sub-branches */}
        <Path d={branch(W*0.24, SH-112, W*0.17, SH-130)}
          stroke={fanColor} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.6}/>
        <Path d={branch(W*0.24, SH-112, W*0.28, SH-133)}
          stroke={fanColor} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.6}/>
        <Path d={branch(W*0.48, SH-114, W*0.44, SH-134)}
          stroke={fanColor} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.6}/>
        <Path d={branch(W*0.48, SH-114, W*0.52, SH-132)}
          stroke={fanColor} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.6}/>

        {/* ── Fan coral 2 ── (right cluster) */}
        <Path d={`M ${W*0.78},${SH} L ${W*0.78},${SH-68}`}
          stroke={fanColor} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8}/>
        <Path d={branch(W*0.78, SH-46, W*0.66, SH-72)}
          stroke={fanColor} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.75}/>
        <Path d={branch(W*0.78, SH-46, W*0.88, SH-74)}
          stroke={fanColor} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.75}/>
        <Path d={branch(W*0.78, SH-68, W*0.68, SH-98)}
          stroke={fanColor} strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.7}/>
        <Path d={branch(W*0.78, SH-68, W*0.88, SH-100)}
          stroke={fanColor} strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.7}/>

        {/* ── Anemone stems ── (static base, caps will animate above) */}
        {/* Anemone 1 at ~44% */}
        <Path d={`M ${W*0.44},${SH} Q ${W*0.43},${SH-22} ${W*0.44},${SH-42}`}
          stroke={anemStem} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.8}/>
        {/* Anemone 2 at ~58% */}
        <Path d={`M ${W*0.58},${SH} Q ${W*0.60},${SH-18} ${W*0.58},${SH-36}`}
          stroke={anemStem} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.75}/>
      </Svg>

      {/* ── Animated anemone cap 1 ── */}
      <AnemoneSwayWrap
        cx={W * 0.44}
        cy={H - 42}
        period={3600}
        delay={500}
        swayDeg={6}
      >
        <Svg
          width={40} height={40}
          style={{ position: 'absolute', left: -20, top: -20 }}
          pointerEvents="none"
        >
          <Circle cx={20} cy={20} r={7} fill={anemColor} opacity={0.85} />
          <Circle cx={20} cy={20} r={3.5} fill="rgba(255,240,200,0.7)" />
          <Path
            d={`M 20,20 L 20,6 M 20,20 L ${(20+9.9).toFixed(1)},${(20-9.9*0.6).toFixed(1)} M 20,20 L 30,20 M 20,20 L ${(20+9.9).toFixed(1)},${(20+9.9*0.6).toFixed(1)} M 20,20 L 20,34 M 20,20 L ${(20-9.9).toFixed(1)},${(20+9.9*0.6).toFixed(1)} M 20,20 L 10,20 M 20,20 L ${(20-9.9).toFixed(1)},${(20-9.9*0.6).toFixed(1)}`}
            stroke={petalGlow} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8}
          />
        </Svg>
      </AnemoneSwayWrap>

      {/* ── Animated anemone cap 2 ── */}
      <AnemoneSwayWrap
        cx={W * 0.58}
        cy={H - 36}
        period={4100}
        delay={1300}
        swayDeg={7}
      >
        <Svg
          width={34} height={34}
          style={{ position: 'absolute', left: -17, top: -17 }}
          pointerEvents="none"
        >
          <Circle cx={17} cy={17} r={6} fill={anemColor} opacity={0.8} />
          <Circle cx={17} cy={17} r={3} fill="rgba(255,240,200,0.65)" />
          <Path
            d={`M 17,17 L 17,5 M 17,17 L ${(17+8.4).toFixed(1)},${(17-8.4*0.6).toFixed(1)} M 17,17 L 26,17 M 17,17 L ${(17+8.4).toFixed(1)},${(17+8.4*0.6).toFixed(1)} M 17,17 L 17,29 M 17,17 L ${(17-8.4).toFixed(1)},${(17+8.4*0.6).toFixed(1)} M 17,17 L 8,17 M 17,17 L ${(17-8.4).toFixed(1)},${(17-8.4*0.6).toFixed(1)}`}
            stroke={petalGlow} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.75}
          />
        </Svg>
      </AnemoneSwayWrap>

    </View>
  );
}

const styles = StyleSheet.create({});

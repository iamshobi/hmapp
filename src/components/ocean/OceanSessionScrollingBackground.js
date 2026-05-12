
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { OCEAN_BACKDROP_DEPTH_MAX_M } from '../../constants/oceanDepthLevels';
import { oceanSessionBackdropEasedU } from '../../constants/oceanSessionScrollMath';
import { OCEAN_FULL_COLUMN_BACKDROP_SVG } from '../../constants/oceanSessionMedia';

function depthMToImageFrac(depthM) {
  const lo = 0;
  const hi = OCEAN_BACKDROP_DEPTH_MAX_M;
  const d = Math.min(hi, Math.max(lo, depthM));
  return (d - lo) / (hi - lo);
}


const FULL_COLUMN_NATURAL_W = 470;
const FULL_COLUMN_NATURAL_H = 2980;


const MIN_SCROLLABLE_HEIGHT_MULT = 1.22;

const MIN_BAND_VIEWPORT_MULT = 1.92;


const MAX_BAND_ZOOM = 22;


const MAX_BACKDROP_DISPLAY_PX = Platform.OS === 'android' ? 4096 : 6144;


const SCALE_AT_START = 1.07;
const SCALE_AT_END = 0.985;

function buildLevelLayout(W, H, zoneStartDepthM, zoneEndDepthM, naturalW, naturalH) {
  const widthFitH = naturalH * (W / naturalW);
  const minH = H * MIN_SCROLLABLE_HEIGHT_MULT;
  const baseZoom = widthFitH < minH ? minH / widthFitH : 1;
  const baseDisplayW = W * baseZoom;
  const baseDisplayH = widthFitH * baseZoom;

  const f0 = depthMToImageFrac(zoneStartDepthM);
  const f1 = depthMToImageFrac(zoneEndDepthM);
  const sliceH = Math.max(1e-6, f1 - f0) * baseDisplayH;

  let bandZoom = Math.min(
    MAX_BAND_ZOOM,
    Math.max(1, (H * MIN_BAND_VIEWPORT_MULT) / sliceH)
  );
  let sW = baseDisplayW * bandZoom;
  let sH = baseDisplayH * bandZoom;

  
  const peak = Math.max(sW, sH);
  if (peak > MAX_BACKDROP_DISPLAY_PX) {
    const shrink = MAX_BACKDROP_DISPLAY_PX / peak;
    sW *= shrink;
    sH *= shrink;
  }

  const y0s = f0 * sH;
  const y1s = f1 * sH;

  
  const tyStart = -y0s;
  
  const tyEnd = H - y1s;

  const centerX = (W - sW) / 2;

  
  const imgTyMax = 0;
  const imgTyMin = H - sH;

  return {
    sW,
    sH,
    centerX,
    tyStart,
    tyEnd,
    imgTyMin,
    imgTyMax,
  };
}

export default function OceanSessionScrollingBackground({
  sessionProgress = 0,
  phase = 'calibrating',
  dimOverlayOpacity = 0,
  hrvNormalized: _hrvNormalized = 0.5,
  zoneStartDepthM = 0,
  zoneEndDepthM = 200,
  
  fullColumnMode: _fullColumnMode = false,
}) {
  const { width: W, height: H } = useWindowDimensions();

  const layout = useMemo(
    () => buildLevelLayout(W, H, zoneStartDepthM, zoneEndDepthM, FULL_COLUMN_NATURAL_W, FULL_COLUMN_NATURAL_H),
    [W, H, zoneStartDepthM, zoneEndDepthM]
  );

  const [svgXml, setSvgXml] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(OCEAN_FULL_COLUMN_BACKDROP_SVG);
        await asset.downloadAsync();
        const uri = asset.localUri;
        if (!uri || cancelled) return;
        const xml = await readAsStringAsync(uri);
        if (!cancelled) setSvgXml(xml);
      } catch {
        if (!cancelled) setSvgXml(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const transY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(SCALE_AT_START)).current;
  const progressRef = useRef(0);
  const phaseRef = useRef(phase);
  const deepestTransYRef = useRef(null);
  const rafRef = useRef(null);
  const layoutRef = useRef(layout);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    progressRef.current = sessionProgress;
  }, [sessionProgress]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const tick = () => {
      const p = progressRef.current;
      const ph = phaseRef.current;

      if (ph !== 'active') {
        deepestTransYRef.current = null;
        const { tyStart: ys, imgTyMin: yMin, imgTyMax: yMax } = layoutRef.current;
        transY.setValue(Math.max(yMin, Math.min(yMax, ys)));
        scale.setValue(SCALE_AT_START);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const easedU = oceanSessionBackdropEasedU(p);
      scale.setValue(SCALE_AT_START + easedU * (SCALE_AT_END - SCALE_AT_START));
      const { tyStart, tyEnd, imgTyMin, imgTyMax } = layoutRef.current;
      const targetY = tyStart + easedU * (tyEnd - tyStart);
      const clamped = Math.max(imgTyMin, Math.min(imgTyMax, targetY));
      const prev = deepestTransYRef.current;
      const next = prev == null ? clamped : Math.min(prev, clamped);
      deepestTransYRef.current = next;
      transY.setValue(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [transY, scale]);

  const { sW, sH, centerX } = layout;

  return (
    <View style={[StyleSheet.absoluteFill, styles.clip]} pointerEvents="none">
      
      <View style={{ position: 'absolute', left: centerX, top: 0 }}>
        <Animated.View
          style={{
            width: sW,
            height: sH,
            transform: [{ translateY: transY }, { scale }],
          }}
        >
          {svgXml ? (
            <SvgXml xml={svgXml} width={sW} height={sH} preserveAspectRatio="none" />
          ) : (
            <View style={[styles.fallback, { width: sW, height: sH }]} />
          )}
          {dimOverlayOpacity > 0 ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dimOverlayOpacity})` }]}
              pointerEvents="none"
            />
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: '#172A4A',
  },
});

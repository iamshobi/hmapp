/**
 * Portrait: ocean session backdrop — one pelagic *level* at a time.
 *
 * Only the vertical slice for the selected zone [zoneStartDepthM … zoneEndDepthM] is used;
 * the camera starts at the *top* of that band and pans down to the *bottom* over the session.
 * Thin bands (e.g. 0–200 m) are zoomed so motion stays visible.
 *
 * Depth on art: **surface (0 m) at image top** → **hadal floor** at bottom — matches the infographic.
 * (Pelagic tint / HUD may still use the wider −8000… axis elsewhere.)
 */
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

/** `ocean-full-column-surface.svg` — used for all session modes */
const FULL_COLUMN_NATURAL_W = 470;
const FULL_COLUMN_NATURAL_H = 2980;

/** Full-frame: ensure some vertical pan when using entire strip */
const MIN_SCROLLABLE_HEIGHT_MULT = 1.22;
/**
 * Per-level band: scaled height of [zoneStart…zoneEnd] along the art must be at least
 * this × viewport so the dive reads clearly (infographic slice may be a small % of image).
 */
const MIN_BAND_VIEWPORT_MULT = 1.92;

/**
 * Caps how far we magnify a thin depth band. Uncapped zoom plus GPU shrink could make f1*sH
 * smaller than the viewport height, yielding invalid positive translateY and inverted clamp bounds.
 */
const MAX_BAND_ZOOM = 22;

/** Safer max bitmap dimension (SvgXml / GPU); zone dives were still fragile at 8192 on some devices */
const MAX_BACKDROP_DISPLAY_PX = Platform.OS === 'android' ? 4096 : 6144;

/** Subtle zoom: slight “closing in” as the dive advances (read as pressure / depth). */
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

  /**
   * Thin zones (e.g. 0–200 m) push bandZoom very high → sH/sW in the 50k+ px range.
   * That blows past GPU / Surface limits and crashes native on many devices.
   * Full-column dives use ~100% of the art height, so bandZoom ≈ 1 and stay under the cap.
   */
  const peak = Math.max(sW, sH);
  if (peak > MAX_BACKDROP_DISPLAY_PX) {
    const shrink = MAX_BACKDROP_DISPLAY_PX / peak;
    sW *= shrink;
    sH *= shrink;
  }

  const y0s = f0 * sH;
  const y1s = f1 * sH;

  /** Top of zone at top of screen */
  const tyStart = -y0s;
  /** Bottom of zone at bottom of screen */
  const tyEnd = H - y1s;

  const centerX = (W - sW) / 2;

  /** Scrollable translateY range for this scaled image (top of bitmap vs viewport). */
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
  /** Reserved for future asset split (full strip vs zone art); layout always uses full SVG. */
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
      {/* Static X offset on a plain View — avoids mixing static + animated transforms on one node (RN New Arch crash path). */}
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

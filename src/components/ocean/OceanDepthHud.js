/**
 * Instrument-style depth readout — makes descent legible even when the art is subtle.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

export default function OceanDepthHud({
  depthM = 0,
  zoneStartM = 0,
  zoneEndM = 200,
  zoneTitle = '',
  accentColor = '#8FEFFF',
  visible = false,
}) {
  const span = useMemo(() => Math.max(1, zoneEndM - zoneStartM), [zoneEndM, zoneStartM]);
  const fillU = clamp01((depthM - zoneStartM) / span);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text style={styles.kicker}>Depth</Text>
      <Text style={styles.meters}>{Math.max(0, Math.round(depthM)).toLocaleString()} m</Text>
      <View style={[styles.track, { borderColor: `${accentColor}44` }]}>
        <View
          style={[
            styles.fill,
            { width: `${fillU * 100}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
      <Text style={[styles.zone, { color: `${accentColor}dd` }]} numberOfLines={2}>
        {zoneTitle}
      </Text>
      <Text style={styles.range}>
        {zoneStartM.toLocaleString()} – {zoneEndM.toLocaleString()} m
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: undefined,
    top: '26%',
    maxWidth: 148,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 12, 28, 0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(180, 220, 255, 0.22)',
  },
  kicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: 'rgba(230, 242, 255, 0.65)',
    marginBottom: 2,
  },
  meters: {
    fontSize: 26,
    fontWeight: '200',
    letterSpacing: -0.5,
    color: 'rgba(255, 255, 255, 0.96)',
  },
  track: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  zone: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    color: 'rgba(248, 252, 255, 0.92)',
  },
  range: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(200, 220, 235, 0.55)',
  },
});

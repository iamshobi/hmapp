/**
 * HeartCoherencePills — three heart icons for Low / Medium / High coherence.
 *
 * Uses the exact SVG path from the provided heart files (viewBox 0 0 24 24):
 *   Low    — #FFCB9D  (peach-orange)
 *   Medium — #9DD9FF  (sky-blue)
 *   High   — #6EDDA0  (mint-green)
 *
 * The HRV % is rendered with SvgText centred inside the heart shape.
 * No PNG, no clipping bleed.
 * Pass `compact={true}` for the small bottom-of-screen widget.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

/* ─────────────────────────────────────────────────────────────────
   Exact path from the provided SVG files.  ViewBox: 0 0 24 24.
   The heart spans x ≈ 1.6 – 23.4, y ≈ 3.1 – 22.1.
   Visual body-centre (good text anchor): x=12.5  y=14.6
   ───────────────────────────────────────────────────────────────── */
const HEART_PATH =
  'M21.7083 4.80208C21.1763 4.2698 20.5446 3.84755 19.8493 3.55946' +
  'C19.1541 3.27138 18.4088 3.1231 17.6563 3.1231' +
  'C16.9037 3.1231 16.1584 3.27138 15.4632 3.55946' +
  'C14.7679 3.84755 14.1362 4.2698 13.6042 4.80208L12.5 5.90625L11.3958 4.80208' +
  'C10.3212 3.7274 8.86358 3.12366 7.34375 3.12366' +
  'C5.82392 3.12366 4.36635 3.7274 3.29167 4.80208' +
  'C2.21699 5.87676 1.61324 7.33434 1.61324 8.85417' +
  'C1.61324 10.374 2.21699 11.8316 3.29167 12.9063' +
  'L12.5 22.1146L21.7083 12.9063' +
  'C22.2406 12.3742 22.6629 11.7425 22.951 11.0472' +
  'C23.239 10.352 23.3873 9.60676 23.3873 8.85417' +
  'C23.3873 8.10157 23.239 7.35636 22.951 6.66109' +
  'C22.6629 5.96582 22.2406 5.33412 21.7083 4.80208Z';

/* ── Tier definitions ─────────────────────────────────────────── */
const TIERS = [
  { id: 'low',  label: 'Low',  fill: '#FFCB9D', textColor: '#7A3800' },
  { id: 'med',  label: 'Med',  fill: '#9DD9FF', textColor: '#0B4F7A' },
  { id: 'high', label: 'High', fill: '#6EDDA0', textColor: '#0B5A2E' },
];

/* ── Single heart ─────────────────────────────────────────────── */
function HeartIcon({ tier, pct, active, compact }) {
  const { label, fill, textColor } = tier;

  // Display size of the rendered SVG
  const iconW    = compact ? 44 : 60;
  const iconH    = iconW;  // viewBox is square (24×24)

  // fontSize in SVG-user-units (viewBox coords). The heart body is ~22 units wide.
  // compact 44px → scale 44/24=1.83 → fontSize 6.2 renders at ~11.4px on screen
  // normal  60px → scale 60/24=2.5  → fontSize 6.2 renders at ~15.5px on screen
  const svgFontSize = compact ? 6.2 : 5.8;

  // Text baseline sits at y=14.6 (visual centre of the heart body).
  // The widest part of the heart at that y is ~18 user-units — well clear of "99%"
  // which at fontSize 6.2 is ~11 units wide.
  const TEXT_X = '12.5';
  const TEXT_Y = '14.6';

  return (
    <View style={styles.col}>
      <View style={{ opacity: active ? 1.0 : 0.28 }}>
        <Svg width={iconW} height={iconH} viewBox="0 0 24 24">
          {/* Heart fill */}
          <Path d={HEART_PATH} fill={fill} />

          {/* Centred HRV % — dark tinted text that reads well on pastel fills */}
          <SvgText
            x={TEXT_X}
            y={TEXT_Y}
            textAnchor="middle"
            fill={textColor}
            fontSize={svgFontSize}
            fontWeight="800"
          >
            {pct != null ? `${pct}%` : '--'}
          </SvgText>
        </Svg>
      </View>

      <Text
        style={[
          styles.label,
          compact ? styles.labelCompact : null,
          { color: active ? fill : 'rgba(255,255,255,0.32)' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* ── Main export ──────────────────────────────────────────────── */
export default function HeartCoherencePills({
  lowPct,
  medPct,
  highPct,
  activeTier    = 'low',
  paddingBottom = 0,
  compact       = false,
}) {
  const tierData = [
    { ...TIERS[0], pct: lowPct,  active: activeTier === 'low'    },
    { ...TIERS[1], pct: medPct,  active: activeTier === 'medium' },
    { ...TIERS[2], pct: highPct, active: activeTier === 'high'   },
  ];

  return (
    <View
      style={[
        styles.row,
        compact ? styles.rowCompact : null,
        { paddingBottom: Math.max(0, paddingBottom) },
      ]}
    >
      {tierData.map((t) => (
        <HeartIcon
          key={t.id}
          tier={t}
          pct={t.pct}
          active={t.active}
          compact={compact}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    justifyContent:    'center',
    alignItems:        'flex-start',
    gap:               28,
    paddingHorizontal: 20,
  },
  rowCompact: {
    gap:               12,
    paddingHorizontal: 4,
  },
  col: {
    alignItems: 'center',
  },
  label: {
    fontSize:      10,
    fontWeight:    '600',
    letterSpacing: 0.5,
    marginTop:     3,
  },
  labelCompact: {
    fontSize:  7,
    marginTop: 1,
  },
});

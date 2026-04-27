/**
 * HeartMath app tokens. Shell colors/gradients map to
 * `src/constants/hmDesignLibrary.tokens.json` (HM Design Library: theme.css + ColorsPage).
 * Figma Make canvas/frame: `src/constants/designLibrary.js`.
 * Game / session (zen, coherence) keep legacy stacks where not specified in HM JSON.
 */
import { StyleSheet } from 'react-native';
import { DESIGN_LIBRARY_CANVAS } from './constants/designLibrary';
import hm from './constants/hmDesignLibrary.tokens.json';

export { DESIGN_LIBRARY_FILE_NAME, DESIGN_LIBRARY_CANVAS, DESIGN_LIBRARY_FRAME, DESIGN_LIBRARY_THUMB } from './constants/designLibrary';
export { default as hmDesignLibraryTokens } from './constants/hmDesignLibrary.tokens.json';

const B = hm.brand;
const N = hm.neutral;
const G = hm.gradients;
const SH = hm.shell.fromThemeCss;

/** Canonical palette — HM library tokens + legacy keys for games / sessions */
export const palette = {
  white: N.white.hex,
  black: '#212121',

  /** HM Design Library — brand (ColorsPage) */
  hmBrandPurple: B.brandPurple.hex,
  hmBrandMagenta: B.brandMagenta.hex,
  hmDeepPurple: B.deepPurple.hex,
  hmAppBlue: B.appBlue.hex,
  hmAppOrange: B.appOrange.hex,
  hmAppGreen: B.appGreen.hex,
  hmLightPurple: B.lightPurple.hex,
  hmSurfacePurple: B.surfacePurple.hex,

  /** Primary brand axis — aligned where overlapping; keep for gradients / games */
  hmMagenta: B.brandMagenta.hex,
  hmPink: '#EC407A',
  hmPurple: '#6A1B9A',
  hmPurpleDark: '#311B92',
  hmPurpleMid: '#8E24AA',
  hmViolet: '#7C4DFF',

  /** Progress / My Progress warm header */
  orangeDeep: '#F57C00',
  orangeBright: '#FF9800',
  yellowWarm: '#FFB74D',
  yellowLight: '#FFCA28',

  /** Teal / cyan accents */
  teal: '#00897B',
  cyan: '#00ACC1',
  tealBright: '#00BFA5',
  blueBright: '#0091EA',

  /** Session / measure (burgundy) */
  maroonSession: '#4A0E2E',
  magentaDeep: '#C2185B',

  /** Coherence education card */
  greenZone: N.successGreen.hex,
  zoneBlue: '#2196F3',
  zoneOrange: '#FF9800',

  /** UI chrome */
  navyControl: '#1E2A3B',
  designLibraryCanvas: DESIGN_LIBRARY_CANVAS,
  /** Shell text — HM dark + muted (secondary = mid gray for subtitles) */
  textOnLight: N.darkText.hex,
  textSecondary: '#616161',
  textMuted: N.mutedText.hex,
  borderLight: SH.border,
  overlayBokeh: 'rgba(255,255,255,0.35)',
  inputBackground: SH.inputBackground,

  /** Sage zen (Play / Breath session only) */
  sage: '#91A88C',
  sageDark: '#6B8B6E',
};

/** Native splash — first stop must match `gradients.shellHeader[0]` (`app.json` splash). */
export const splashNativeBackground = palette.hmPurpleDark;

export const gradients = {
  /** Legacy — teal → blue → purple */
  home: ['#00BFA5', '#0091EA', '#651FFF'],
  /** Learn tab — HM “Guided Techniques” (ColorsPage) */
  learn: [...G.guidedTechniques.stops],
  /** Coherence session — magenta → purple stack */
  session: ['#D81B60', '#AB47BC', '#6A1B9A', '#311B92'],
  sessionCalibrating: ['#C2185B', '#8E24AA', '#4527A0'],
  /** My Progress — warm header */
  progressHeader: ['#FF9800', '#FFB74D', '#FFCA28'],
  /** Session complete */
  complete: ['#00897B', '#00ACC1', '#5E35B1'],

  /** Home header — deep violet → magenta (library + splash) */
  shellHeader: ['#311B92', '#4527A0', '#6A1B9A', '#8E24AA', '#AB47BC'],
  magentaPurple: ['#D81B60', '#AB47BC', '#6A1B9A'],
  congratsModal: ['#D81B60', '#8E24AA', '#4527A0'],
  introCyanPurple: ['#3BB2D0', '#5E35B1', '#6A3093'],
  burgundyField: ['#4A0E2E', '#541B31'],
  measureMagenta: ['#C2185B', '#AD1457'],

  /** Daily Practice — HM ColorsPage gradients */
  dailyLearn: [...G.guidedTechniques.stops, B.deepPurple.hex],
  dailyMeasure: [...G.measure.stops],
  dailyPlay: [...G.play.stops],
  /** CTA — purple ramp (between HM brand + material) */
  ctaPurple: [B.brandPurple.hex, B.deepPurple.hex, '#4A148C'],

  zenGameSession: ['#FDF9F0', '#EEF4EE', '#DCE8DC'],
  zenGameCalibrating: ['#F8F4EC', '#E8F0E8', '#D8E6D8'],
  zenGameComplete: ['#E8F0E8', '#C8DCC8', '#91A88C'],

  /** GradientActionCard — HM tokens */
  actionLearn: [...G.guidedTechniques.stops, B.deepPurple.hex],
  actionMeasure: [...G.measure.stops],
  actionPlay: [...G.play.stops],
  actionMulti: [...G.multiDay.stops],
  actionGuided: [B.appGreen.hex, ...G.guidedTechniques.stops],
  actionCourses: [B.appBlue.hex, '#5E35B1', B.deepPurple.hex],
  actionAudiobooks: ['#5C6BC0', '#3949AB', '#283593'],

  /** Play / BreathSession — universe (Sacred Geometry): deep purple ramp */
  gameSessionUniverse: [palette.hmPurpleDark, '#4527A0', B.deepPurple.hex, B.brandPurple.hex],
  /** Play / BreathSession — ocean: HM app blue + guided-techniques axis */
  gameSessionOcean: ['#031a2e', '#042898', B.appBlue.hex, '#11A8B2'],
};

/**
 * Ocean decorative icons: tint = depth accent; glow mixes accent with session cyan (HM shell highlight).
 */
export function oceanDepthIconGlow(accentHex) {
  const a = accentHex.replace('#', '');
  if (a.length !== 6) return accentHex;
  const hi = gradients.gameSessionOcean[gradients.gameSessionOcean.length - 1].replace('#', '');
  const t = 0.42;
  const r = Math.round(parseInt(a.slice(0, 2), 16) * (1 - t) + parseInt(hi.slice(0, 2), 16) * t);
  const g = Math.round(parseInt(a.slice(2, 4), 16) * (1 - t) + parseInt(hi.slice(2, 4), 16) * t);
  const b = Math.round(parseInt(a.slice(4, 6), 16) * (1 - t) + parseInt(hi.slice(4, 6), 16) * t);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export const coherenceCardGradient = ['#FF8A65', '#EC407A', '#AB47BC'];
export const zenCoherenceCardGradient = ['#E8F2F1', '#D9E9E8'];

export const zenGame = {
  cream: '#FDF9F0',
  forest: '#2D4739',
  sage: '#91A88C',
  sageDark: '#6B8B6E',
  sageMuted: '#7A8F78',
  cardTeal: '#D9E9E8',
  track: '#E0E8E0',
  trackFill: '#91A88C',
  wave: '#6B8B6E',
  zoneLow: '#D4A84B',
  zoneMed: '#6B9FBD',
  zoneHigh: '#91A88C',
};

/** @deprecated Prefer `palette` / semantic keys; kept for existing imports */
export const colors = {
  orange: '#F57C00',
  orangeLight: '#FFB74D',
  purple: '#7C4DFF',
  purpleLight: '#B388FF',
  purpleDark: '#6A1B9A',
  /** HM Design Library — active tab / links */
  navActive: palette.hmBrandPurple,
  teal: '#00897B',
  cyan: '#00ACC1',
  indigo: '#3F51B5',
  zoneLow: '#FFC107',
  zoneMed: '#2196F3',
  zoneHigh: '#66BB6A',
  sageAccent: '#7A9E7E',
  gradientTop: '#00BFA5',
  gradientMid: '#0091EA',
  gradientBottom: '#651FFF',
  gradientTeal: '#00897B',
  gradientNavy: '#1A237E',
  gradientPurple: '#4A148C',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(255, 255, 255, 0.3)',
  textDark: palette.textOnLight,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,
  textWhite: '#FFFFFF',

  hmMagenta: palette.hmMagenta,
  hmPurple: palette.hmPurple,
  hmPurpleDark: palette.hmPurpleDark,
  greenZone: palette.greenZone,
  navyControl: palette.navyControl,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  /** Bottom sheets / large cards (reference ~32–40px) */
  sheet: 32,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLift: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  soft: {
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

/**
 * Typography — reference: geometric sans, white on gradients, dark on white cards.
 * Use with `Text style={[typography.heroTitle, typography.onDark]}` etc.
 */
export const typography = {
  /**
   * Splash / wordmark on brand gradients — geometric sans, strong weight, slight tracking.
   * Align `app.json` splash `backgroundColor` with `gradients.shellHeader[0]` for a seamless handoff.
   */
  brandWordmark: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: palette.white,
  },
  heroTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
  coherence: { fontSize: 34, fontWeight: '200', letterSpacing: -0.5 },
  /** Modal / screen titles on white */
  modalTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.2 },
  /** Greeting line on shell */
  greeting: { fontSize: 26, fontWeight: '600', letterSpacing: 0.2 },
  greetingSub: { fontSize: 17, fontWeight: '400' },
  /** Section headers on light bg */
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSub: { fontSize: 14, fontWeight: '400' },
  /** CTA button label */
  buttonPrimary: { fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },
  /** EXIT / secondary caps */
  exitLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  /** Coherence / timer on session */
  timer: { fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  /** Body on dark gradient */
  bodyOnDark: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  /** Body on white */
  bodyOnLight: { fontSize: 16, color: palette.textOnLight, lineHeight: 24 },
};

/**
 * Reusable component recipes (plain objects — spread into StyleSheet or merge).
 * Ghost pill: white border, transparent fill (Done on congrats modals).
 */
export const components = {
  ghostButton: {
    borderWidth: 2,
    borderColor: palette.white,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  primaryPill: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteCard: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
};

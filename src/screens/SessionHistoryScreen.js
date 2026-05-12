import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Filter, Trash2 } from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, RadialGradient, Rect, Path, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMysession } from '../context/mysessionContext';
import { borderRadius, spacing } from '../theme';

const FONT_REGULAR = 'Sailec-Medium';
const FONT_BOLD = 'Sailec-Bold';
const PAGE_BG = '#F3F3F5';
const SUBTITLE_TEXT_COLOR = '#171717';
const META_TEXT_COLOR = '#171717AD';
const TYPE = {
  title: 28,
  h2: 16,
  body: 13,
  caption: 12,
};
const WARM = {
  gradA: '#F6A400',
  gradB: '#F18A1F',
  gradC: '#EB6A33',
  textStrong: '#6E3A16',
  textMuted: '#8D5A33',
  chipBg: '#FCE7D1',
  chipActive: '#E18B31',
  chipActiveText: '#FFFFFF',
  surface: '#FFF5EC',
  cardBorder: 'rgba(225,139,49,0.28)',
  cardShadow: '#E18B31',
};
const HM_PURPLE = {
  gradA: '#F6A400',
  gradB: '#EE7D29',
  gradC: '#DA5C32',
  textStrong: '#6E3A16',
  textMuted: '#8D5A33',
  chipBg: '#FBE2CB',
  chipActive: '#D9782A',
  chipActiveText: '#FFFFFF',
  surface: '#FFF3E8',
  cardBorder: 'rgba(225,139,49,0.28)',
};
const TREND_WRAP_HEIGHT = 312;
const TREND_GRID_TOP = 24;
const TREND_GRID_BOTTOM = 60;
const TREND_BASELINE_BOTTOM = 60;
const TREND_X_AXIS_BOTTOM = 20;
const TREND_TRACK_LEFT = '30%';
const TREND_TOOLTIP_LEFT = '22%';

const SESSION_SWIPE_COL_WIDTH = 58;
const HEADER_TO_FILTER_GAP = 36;
const FILTER_ROW_BOTTOM_GAP = 36;

const RANGE_FILTER_CHIPS = [
  { key: '7d', label: 'Last 7 Days', Icon: CalendarDays },
  { key: 'month', label: 'This Month', Icon: null },
  { key: 'all', label: 'All', Icon: null },
];

function SessionSwipeRow({
  children,
  onDelete,
  swipeRowId,
  activeSwipeRowId,
  onSwipeOpened,
  onSwipeClosed,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);
  const openedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const swipeWidthRef = useRef(SESSION_SWIPE_COL_WIDTH);
  const animateToRef = useRef(() => {});
  const swipeCallbacksRef = useRef({ onSwipeOpened: undefined, onSwipeClosed: undefined });

  const stripWidth = SESSION_SWIPE_COL_WIDTH;
  swipeWidthRef.current = stripWidth;
  swipeCallbacksRef.current = { onSwipeOpened, onSwipeClosed };

  animateToRef.current = (toValue) => {
    const prevOpen = openedRef.current;
    currentX.current = toValue;
    openedRef.current = toValue !== 0;
    if (toValue !== 0 && !prevOpen) {
      swipeCallbacksRef.current.onSwipeOpened?.();
    } else if (toValue === 0 && prevOpen) {
      swipeCallbacksRef.current.onSwipeClosed?.();
    }
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
      speed: 18,
    }).start();
  };

  useEffect(() => {
    if (activeSwipeRowId != null && activeSwipeRowId !== swipeRowId && openedRef.current) {
      animateToRef.current(0);
    }
  }, [activeSwipeRowId, swipeRowId]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
        onPanResponderGrant: () => {
          translateX.stopAnimation();
          const W = swipeWidthRef.current;
          dragStartXRef.current = openedRef.current ? -W : 0;
        },
        onPanResponderMove: (_, gesture) => {
          const W = swipeWidthRef.current;
          const next = Math.max(-W, Math.min(0, dragStartXRef.current + gesture.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const W = swipeWidthRef.current;
          const end = dragStartXRef.current + gesture.dx;
          const vx = gesture.vx;
          if (openedRef.current) {
            const velocityClose = vx > 0.35;
            const draggedClose = end > -W / 2;
            if (velocityClose || draggedClose) animateToRef.current(0);
            else animateToRef.current(-W);
            return;
          }
          const velocityOpen = vx < -0.35;
          const draggedOpen = end < -W / 2;
          if (velocityOpen || draggedOpen) animateToRef.current(-W);
          else animateToRef.current(0);
        },
        onPanResponderTerminate: (_, gesture) => {
          const W = swipeWidthRef.current;
          const end = dragStartXRef.current + gesture.dx;
          const vx = gesture.vx;
          if (openedRef.current) {
            const velocityClose = vx > 0.35;
            const draggedClose = end > -W / 2;
            if (velocityClose || draggedClose) animateToRef.current(0);
            else animateToRef.current(-W);
            return;
          }
          const velocityOpen = vx < -0.35;
          const draggedOpen = end < -W / 2;
          if (velocityOpen || draggedOpen) animateToRef.current(-W);
          else animateToRef.current(0);
        },
      }),
    [translateX]
  );

  return (
    <View style={styles.sessionSwipeRowWrap}>
      <View style={[styles.sessionSwipeActions, { width: stripWidth }]}>
        <TouchableOpacity
          style={[styles.sessionSwipeActionBtn, styles.sessionSwipeDeleteBtn]}
          onPress={onDelete}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Delete session"
        >
          <Trash2 size={16} color="#C92262" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.sessionSwipeContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

function GradientSpike({ width = 36, height = 84, idSuffix, style }) {
  const d = `M0 ${height} C${(width * 0.08).toFixed(2)} ${(height * 0.62).toFixed(2)}, ${(width * 0.24).toFixed(2)} ${(height * 0.2).toFixed(2)}, ${(width / 2).toFixed(2)} 0 C${(width * 0.76).toFixed(2)} ${(height * 0.2).toFixed(2)}, ${(width * 0.92).toFixed(2)} ${(height * 0.62).toFixed(2)}, ${width} ${height} Z`;
  const gradId = `spike-grad-${idSuffix}`;
  return (
    <View style={[style, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#6B2D8B" />
            <Stop offset="100%" stopColor="#C31F64" />
          </SvgLinearGradient>
        </Defs>
        <Path d={d} fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

function TopBarSettingsIcon({ size = 24, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.75012 12C8.75012 10.2051 10.2052 8.75 12.0001 8.75C13.795 8.75 15.2501 10.2051 15.2501 12C15.2501 13.7949 13.795 15.25 12.0001 15.25C10.2052 15.25 8.75012 13.7949 8.75012 12Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4608 1.83851C11.7557 1.53347 12.2446 1.53347 12.5394 1.83851L15.1117 4.5H18.7501C19.1643 4.5 19.5001 4.83579 19.5001 5.25V8.8884L22.1616 11.4607C22.4667 11.7555 22.4667 12.2445 22.1616 12.5393L19.5001 15.1116V18.75C19.5001 19.1642 19.1643 19.5 18.7501 19.5H15.1117L12.5394 22.1615C12.2446 22.4665 11.7557 22.4665 11.4608 22.1615L8.88852 19.5H5.25013C4.83592 19.5 4.50013 19.1642 4.50013 18.75V15.1116L1.83864 12.5393C1.5336 12.2445 1.5336 11.7555 1.83864 11.4607L4.50013 8.88839V5.25C4.50013 4.83579 4.83592 4.5 5.25013 4.5H8.88852L11.4608 1.83851ZM12.0001 7.25C9.37677 7.25 7.25012 9.37665 7.25012 12C7.25012 14.6234 9.37677 16.75 12.0001 16.75C14.6235 16.75 16.7501 14.6234 16.7501 12C16.7501 9.37665 14.6235 7.25 12.0001 7.25Z"
        fill={color}
      />
    </Svg>
  );
}

function TopBarBackIcon({ size = 24, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.1949 6.49372C12.5625 6.15201 12.5625 5.59799 12.1949 5.25628C11.8274 4.91457 11.2315 4.91457 10.8639 5.25628L4.27566 11.3813C3.90811 11.723 3.90811 12.277 4.27566 12.6187L10.8639 18.7437C11.2315 19.0854 11.8274 19.0854 12.1949 18.7437C12.5625 18.402 12.5625 17.848 12.1949 17.5063L7.21338 12.875H19.0588C19.5786 12.875 20 12.4832 20 12C20 11.5168 19.5786 11.125 19.0588 11.125H7.21338L12.1949 6.49372Z"
        fill={color}
      />
    </Svg>
  );
}

function getCoherenceScoreFromSurvey(entry, fallback = 2.2) {
  const stress = Number(entry?.stressAfter);
  const energy = Number(entry?.energyAfter);
  const mood = Number(entry?.moodAfter);
  if (!Number.isFinite(stress) || !Number.isFinite(energy) || !Number.isFinite(mood)) return fallback;
  return Math.max(0.8, Math.min(4.9, ((11 - stress) + energy + mood) / 6));
}

function toPercent(score) {
  return Math.max(55, Math.min(99, Math.round(score * 20)));
}

function toneByPct(pct) {
  if (pct >= 90) return { bg: '#FFE6C4', text: '#8B4C12' };
  if (pct >= 82) return { bg: '#FDE2CF', text: '#9A4B26' };
  return { bg: '#F4E5DC', text: '#8F5A3A' };
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTotalDurationMinutes(totalMinutes) {
  const n = Math.max(0, Math.floor(Number(totalMinutes) || 0));
  const h = Math.floor(n / 60);
  const min = n % 60;
  if (h <= 0) return `${min}min`;
  if (min <= 0) return `${h}h`;
  return `${h}h ${min}min`;
}

function toLocalDateKey(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function findMatchedSessionNote(entry, notes) {
  if (!entry || !Array.isArray(notes)) return { body: null, noteId: null };
  const direct = entry.note ?? entry.notes ?? entry.body;
  if (typeof direct === 'string' && direct.trim()) {
    return { body: direct.trim(), noteId: null };
  }

  const entryAt = entry.at || entry.createdAt || entry.date;
  const entryTime = new Date(entryAt).getTime();
  const entryKey = toLocalDateKey(entryAt);
  if (!entryKey || !Number.isFinite(entryTime)) return { body: null, noteId: null };

  let best = null;
  let bestDelta = Infinity;
  for (const note of notes) {
    const rawTs = note?.createdAt || note?.updatedAt;
    const noteTime = new Date(rawTs).getTime();
    if (!Number.isFinite(noteTime)) continue;
    if (toLocalDateKey(rawTs) !== entryKey) continue;
    const delta = Math.abs(noteTime - entryTime);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = note;
    }
  }
  const body = best?.body;
  const trimmed = typeof body === 'string' && body.trim() ? body.trim() : null;
  return { body: trimmed, noteId: trimmed && best?.id ? best.id : null };
}

const SESSION_TYPES = ['Coherence Session', 'Constellation Game', 'Multi Day Session'];
const SESSION_ICON_VARIANTS = [
  [
    'M30.0012 30.939C30.0012 30.939 35.333 29.1087 36.3424 24.2553C36.4134 23.9093 36.4486 23.5568 36.4474 23.2035C36.4474 21.4295 35.041 20 33.3271 20C32.1246 20 30.99 20.5793 30.2516 21.5627L30.0013 21.8976L29.7509 21.5627C29.0125 20.5786 27.878 20 26.6754 20C24.9616 20 23.5552 21.4295 23.5552 23.2035C23.5541 23.5568 23.5892 23.9093 23.6603 24.2553C24.6697 29.1087 30.0014 30.939 30.0014 30.939H30.0012Z',
    'M39.7491 32.4729C39.5645 32.2534 39.3005 32.1161 39.0149 32.091C38.7291 32.0661 38.4453 32.1554 38.2254 32.3393L34.8402 35.1799V35.1912C34.8395 35.7077 34.6342 36.2029 34.2689 36.5682C33.9036 36.9334 33.4084 37.1388 32.8919 37.1395H30.0009C29.7667 37.1324 29.5806 36.9405 29.5806 36.7064C29.5806 36.4722 29.7667 36.2803 30.0009 36.2733H32.8919C33.1789 36.273 33.4539 36.1589 33.6569 35.956C33.8598 35.7532 33.974 35.4782 33.9745 35.1912C33.9745 35.1444 33.9714 35.0977 33.9654 35.0514V35.0462C33.93 34.7868 33.8019 34.5491 33.6047 34.3766C33.4077 34.2043 33.1549 34.1091 32.893 34.1086H30.2533C30.1658 34.1086 30.0804 34.0821 30.0083 34.0328L29.761 33.8629C28.8485 33.2721 27.7918 32.9425 26.7053 32.9102C25.6186 32.8778 24.5441 33.1438 23.5982 33.6792L23.4634 33.7574V39.9985L31.9323 40.0024C32.4561 40.0024 32.962 39.8124 33.3563 39.4676L39.6071 34.0034L39.6138 33.9979C39.8332 33.8135 39.9707 33.5493 39.9956 33.2637C40.0208 32.9781 39.9315 32.6942 39.7473 32.4743L39.7491 32.4729Z',
    'M20 34.3689V39.5649C20.0003 39.8039 20.1939 39.9976 20.4328 39.9979H22.5975V33.936H20.4328C20.1939 33.9362 20.0003 34.1298 20 34.3688V34.3689Z',
  ],
  [
    'M29.9908 20.0001C29.8249 20.0017 29.6663 20.0692 29.5502 20.188C29.4342 20.3065 29.37 20.4664 29.372 20.6324V38.7582H27.01C26.9884 38.757 26.9669 38.757 26.9453 38.7582C26.7219 38.7699 26.5219 38.8998 26.4202 39.0992C26.3186 39.2984 26.3309 39.5366 26.4526 39.7243C26.5742 39.9121 26.7867 40.0206 27.01 40.0093H32.9851C33.2085 40.0091 33.4148 39.8899 33.5264 39.6964C33.638 39.5029 33.638 39.2646 33.5264 39.0711C33.4148 38.8776 33.2085 38.7583 32.9851 38.7582H30.6232V20.6324C30.6251 20.464 30.5592 20.3021 30.4402 20.1831C30.3212 20.0641 30.1592 19.9981 29.9908 20L29.9908 20.0001ZM32.4358 21.9971H32.4359C32.2813 22.0125 32.1381 22.0851 32.0341 22.2003C31.93 22.3157 31.8727 22.4655 31.8731 22.6209V26.4086C31.8724 26.5752 31.9384 26.7352 32.0562 26.8529C32.174 26.9707 32.3339 27.0367 32.5005 27.036H37.1096C37.2564 27.0353 37.3981 26.983 37.51 26.8882L39.7755 24.9962V24.9963C39.9178 24.8776 40 24.7018 40 24.5165C40 24.3312 39.9178 24.1556 39.7755 24.0368L37.51 22.1412C37.3975 22.0478 37.2558 21.9968 37.1096 21.9971H32.5005C32.479 21.996 32.4574 21.996 32.4359 21.9971L32.4358 21.9971ZM22.8904 25.7848C22.7438 25.7841 22.6016 25.8351 22.4887 25.9287L20.2245 27.8245C20.0822 27.9432 20 28.119 20 28.3042C20 28.4894 20.0822 28.6651 20.2245 28.7839L22.4887 30.6796C22.6016 30.7732 22.7438 30.8242 22.8904 30.8237H27.4995C27.6645 30.823 27.8227 30.757 27.9393 30.6401C28.056 30.5232 28.1217 30.365 28.1219 30.1998V26.4085C28.1217 26.2434 28.056 26.0852 27.9393 25.9683C27.8227 25.8514 27.6645 25.7854 27.4995 25.7848L22.8904 25.7848Z',
  ],
  [
    'M38.612 24.584L34.5899 26.8961V26.15C34.5899 25.5136 34.3371 24.9031 33.8869 24.453C33.4369 24.0029 32.8264 23.75 32.1899 23.75H22.4C21.7636 23.75 21.1531 24.0029 20.703 24.453C20.2528 24.9031 20 25.5135 20 26.15V33.6221C20 34.2585 20.2528 34.869 20.703 35.3191C21.1531 35.7691 21.7635 36.0221 22.4 36.0221H32.1899C32.8264 36.0221 33.4369 35.7691 33.8869 35.3191C34.3371 34.869 34.5899 34.2586 34.5899 33.6221V32.876L38.612 35.188C39.374 35.6261 40 35.266 40 34.3881V25.3882C40 24.5061 39.376 24.1461 38.612 24.584Z',
  ],
];

function sanitizeSvgId(value) {
  return String(value || 'default').replace(/[^a-zA-Z0-9_-]/g, '-');
}

function SessionIconBg({ size = 44, opacity = 0.5, idSuffix = 'default', glyphPaths = [] }) {
  const uid = sanitizeSvgId(idSuffix);
  const gradA = `session-icon-bg-a-${uid}`;
  const gradB = `session-icon-bg-b-${uid}`;
  const gradC = `session-icon-bg-c-${uid}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ opacity }}>
      <Defs>
        <RadialGradient
          id={gradA}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(34.5113 -49.1729 61.5146 11.808 10.5263 52.6316)"
        >
          <Stop stopColor="#F6A400" />
          <Stop offset="0.515625" stopColor="#F18A1F" />
          <Stop offset="0.9375" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id={gradB}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(56.9173 43.609) rotate(-141.968) scale(60.0424 47.0707)"
        >
          <Stop stopColor="#EB6A33" />
          <Stop offset="0.494792" stopColor="#C31F64" stopOpacity="0.62" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient
          id={gradC}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(20.1504 2.10526) rotate(88.8596) scale(64.2232 86.2412)"
        >
          <Stop offset="0.109375" stopColor="#F6A400" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="60" height="60" rx="12" fill="#FFFFFF" />
      <Rect width="60" height="60" rx="12" fill={`url(#${gradA})`} />
      <Rect width="60" height="60" rx="12" fill={`url(#${gradB})`} />
      <Rect width="60" height="60" rx="12" fill={`url(#${gradC})`} />
      {glyphPaths.map((d, idx) => (
        <Path key={`glyph-${idx}`} d={d} fill="#FFFFFF" />
      ))}
    </Svg>
  );
}

function SessionListIcon({ iconKey = 'heart', size = 20, idSuffix = 'default' }) {
  const uid = sanitizeSvgId(idSuffix);
  const gradId = `session-icon-ink-grad-${uid}`;
  const iconFill = `url(#${gradId})`;
  const s = size / 20;
  const common = { fill: iconFill };
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Defs>
        <SvgLinearGradient id={gradId} x1="2" y1="18" x2="18" y2="2" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#C31F64" />
          <Stop offset="1" stopColor="#E18B31" />
        </SvgLinearGradient>
      </Defs>
      {iconKey === 'calendar' ? (
        <>
          <Path d="M18.254 1.956H16.614v.757c0 1.346-1.094 2.44-2.44 2.44-1.346 0-2.418-1.094-2.418-2.44v-.757h-3.49v.757c0 1.346-1.095 2.44-2.42 2.44-1.345 0-2.439-1.094-2.439-2.44v-.757H1.767A1.74 1.74 0 0 0 .021 3.702v3.259H20V3.702a1.74 1.74 0 0 0-1.746-1.746Z" {...common} />
          <Path d="M5.847 3.912c.673 0 1.198-.547 1.198-1.199V1.199C7.045.526 6.498 0 5.846 0 5.173 0 4.648.547 4.648 1.199v1.514c-.021.673.525 1.199 1.199 1.199Zm8.327 0c.673 0 1.199-.547 1.199-1.199V1.199C15.373.526 14.826 0 14.174 0c-.673 0-1.198.547-1.198 1.199v1.514c0 .673.525 1.199 1.198 1.199ZM.021 17.687c0 .967.778 1.745 1.746 1.745h16.466c.968 0 1.746-.778 1.746-1.745V8.181H0v9.506Zm7.55-4.816 1.304-.189a.285.285 0 0 0 .21-.168l.568-1.157c.147-.273.547-.273.694 0l.589 1.199c.042.084.126.147.21.168l1.283.189c.316.042.442.42.21.651l-.946.925a.293.293 0 0 0-.084.252l.21 1.283c.064.316-.273.547-.546.4l-1.178-.61a.305.305 0 0 0-.273 0l-1.136.61c-.273.147-.61-.084-.547-.4l.232-1.304a.293.293 0 0 0-.084-.252l-.926-.904c-.232-.253-.105-.631.21-.694Z" {...common} />
        </>
      ) : iconKey === 'book' ? (
        <Path d="M19.389 1.84a9.5 9.5 0 0 0-4.938-.404 9.6 9.6 0 0 0-4.36 2.353A9.34 9.34 0 0 0 5.606 1.393a9.26 9.26 0 0 0-5.045.618.92.92 0 0 0-.561.86v14.267c0 .283.137.549.369.711.232.162.529.2.795.102a8.75 8.75 0 0 1 3.939-.449c1.33.166 2.6.646 3.707 1.401.384.26.837.399 1.3.398a2.3 2.3 0 0 0 1.273-.383 8.82 8.82 0 0 1 3.628-1.393 8.8 8.8 0 0 1 3.872.324.92.92 0 0 0 .892-.15.94.94 0 0 0 .225-.611V2.719a.9.9 0 0 0-.611-.879ZM8.75 15.994a8.97 8.97 0 0 0-6.25-.946V3.959a7.47 7.47 0 0 1 3.117 0 7.6 7.6 0 0 1 2.687 1.579c.17.205.32.428.446.664v9.792Z" {...common} />
      ) : iconKey === 'video' ? (
        <Path d="M18.612 4.584 14.59 6.896V6.15a2.4 2.4 0 0 0-2.4-2.4H2.4A2.4 2.4 0 0 0 0 6.15v7.472a2.4 2.4 0 0 0 2.4 2.4h9.79a2.4 2.4 0 0 0 2.4-2.4v-.746l4.022 2.312c.762.438 1.388.078 1.388-.8V5.388c0-.882-.624-1.242-1.388-.804Z" {...common} />
      ) : iconKey === 'activity' ? (
        <Path d="M9.991 0c-.166.002-.325.069-.441.188a.636.636 0 0 0-.178.444v18.126H7.01a.625.625 0 0 0 0 1.251h5.975a.625.625 0 1 0 0-1.25h-2.362V.632A.625.625 0 0 0 9.99 0Zm2.445 1.997a.625.625 0 0 0-.563.624v3.788c0 .346.278.626.623.627h4.61a.625.625 0 0 0 .4-.148l2.266-1.892a.624.624 0 0 0 0-.96L17.506 2.14a.625.625 0 0 0-.4-.143H12.5a.625.625 0 0 0-.063 0Zm-9.546 3.788a.625.625 0 0 0-.401.144L.224 7.825a.624.624 0 0 0 0 .96l2.265 1.896c.113.094.255.145.401.144H7.5a.626.626 0 0 0 .623-.624V6.409a.625.625 0 0 0-.623-.624H2.89Z" {...common} />
      ) : iconKey === 'bookmark' ? (
        <Path d="M10 3.064s5.332-1.83 6.341-6.684A6.67 6.67 0 0 0 16.447-4c0-1.774-1.406-3.203-3.12-3.203-1.202 0-2.337.579-3.075 1.563L10-5.305l-.251-.335c-.739-.984-1.873-1.563-3.076-1.563C4.962-7.203 3.555-5.774 3.555-4c-.001.353.034.706.105 1.06C4.67 1.914 10 3.744 10 3.744Zm9.748 1.534a1.08 1.08 0 0 0-1.524-.134l-3.385 2.84c0 .517-.206 1.012-.571 1.378-.365.365-.861.57-1.377.57H10a.42.42 0 0 1 0-.84h2.892a1.09 1.09 0 0 0 0-2.165h-2.64a.71.71 0 0 1-.245-.076l-.247-.17A6.38 6.38 0 0 0 6.705 5.97a6.36 6.36 0 0 0-3.107.77l-.135.078v6.24l8.469.005a2.22 2.22 0 0 0 1.424-.535l6.251-5.464a1.08 1.08 0 0 0 .141-1.524ZM0 7.43v5.195c0 .24.194.434.433.434h2.165V6.997H.433A.433.433 0 0 0 0 7.43Z" {...common} />
      ) : (
        <Path d="M17.077 0C18.688 0 20 1.23 20 2.917c0 .387-.108 1.013-.234 1.353l-2.682 5.73-2.683-5.73c-.125-.34-.234-.967-.234-1.354C14.167 1.23 15.466 0 17.077 0Zm.007 1.667a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM3.34 8.75c1.84 0 3.326 1.436 3.326 3.333 0 .436-.124 1.089-.267 1.471L3.333 20 0 13.554C-.144 13.171-.267 12.52-.267 12.083-.267 10.186 1.232 8.75 3.34 8.75Zm12.955.553.371.781c-3.1.556-4.469 1.293-4.993 1.98-.275.36-.356.717-.358 1.132-.002.416.096.883.183 1.38.086.497.166 1.028.078 1.581-.088.554-.36 1.116-.905 1.602-1.05.936-3.035 1.652-6.848 2.181l.436-.911c3.38-.516 5.087-1.205 5.853-1.888.418-.373.582-.723.644-1.113.062-.39.005-.831-.078-1.309-.083-.477-.197-.992-.195-1.53.002-.538.139-1.11.534-1.628.734-.962 2.247-1.697 5.28-2.26ZM3.333 10.625a1.458 1.458 0 1 0 0 2.916 1.458 1.458 0 0 0 0-2.916Z" {...common} />
      )}
    </Svg>
  );
}

function getMilestoneListCount(totalSessions) {
  const n = Math.max(0, Math.floor(Number(totalSessions) || 0));
  if (n >= 100) return 32; // Pro
  if (n >= 31) return 24; // Still
  if (n >= 11) return 16; // Deep
  if (n >= 6) return 10; // Flow
  if (n >= 1) return 6; // Settle
  return 1; // zero/new
}

function normalizePreviewType(previewType) {
  if (!previewType) return null;
  const key = String(previewType).trim();
  return key || null;
}

function getSessionsFromPreviewType(previewType, fallbackTotal) {
  const t = normalizePreviewType(previewType);
  if (!t) return Math.max(0, Math.floor(Number(fallbackTotal) || 0));
  if (t === 'zero') return 0;
  if (t === 'settle' || t === 'foundation') return 5;
  if (t === 'flow' || t === 'seed') return 10;
  if (t === 'deep' || t === 'habit') return 30;
  if (t === 'still' || t === 'deepPractice') return 31;
  if (t === 'pro') return 100;
  if (t === 'inactiveSurvey') return 12;
  if (t === 'partialSurveyOptOut') return 18;
  return Math.max(0, Math.floor(Number(fallbackTotal) || 0));
}

export default function SessionHistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { totalSessions, surveyResults, sessionNotes } = useMysession();
  const isGraphRoute = route.params?.initialView === 'graph';
  const previewType = normalizePreviewType(route.params?.previewType);
  const effectiveSessions = useMemo(
    () => getSessionsFromPreviewType(previewType, totalSessions),
    [previewType, totalSessions]
  );
  const theme = isGraphRoute ? HM_PURPLE : WARM;
  const [range, setRange] = useState('7d');
  const [metric, setMetric] = useState('coherence');
  const [deletedRowIds, setDeletedRowIds] = useState([]);
  const [openSwipeSessionId, setOpenSwipeSessionId] = useState(null);
  const milestoneSessionCount = useMemo(() => getMilestoneListCount(effectiveSessions), [effectiveSessions]);

  const notifySwipeOpened = useCallback((id) => {
    setOpenSwipeSessionId(id);
  }, []);

  const notifySwipeClosed = useCallback((id) => {
    setOpenSwipeSessionId((prev) => (prev === id ? null : prev));
  }, []);

  const goBackOrProgress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Progress');
    }
  }, [navigation]);

  const rows = useMemo(() => {
    const list = Array.isArray(surveyResults) ? surveyResults : [];
    const notes = Array.isArray(sessionNotes) ? sessionNotes : [];
    const noteDateSet = new Set(notes.map((note) => toLocalDateKey(note?.createdAt || note?.at || note?.date)).filter(Boolean));
    const noteFallbackCount = notes.length;
    const fallbackScore = Math.max(1.7, Math.min(4.8, 1.6 + effectiveSessions * 0.04));
    const targetCount = milestoneSessionCount;
    const source = list.slice(0, targetCount);
    if (source.length < targetCount) {
      const startIdx = source.length;
      const fillers = Array.from({ length: targetCount - source.length }, (_, offset) => ({
        at: new Date(Date.now() - (startIdx + offset) * 1000 * 60 * 60 * 18).toISOString(),
      }));
      source.push(...fillers);
    }
    const allRows = source.map((entry, idx) => {
      const score = getCoherenceScoreFromSurvey(entry, fallbackScore);
      const pct = toPercent(score);
      const tone = toneByPct(pct);
      const seed = `${entry?.at || entry?.createdAt || entry?.date || ''}-${idx}`;
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      const iconVariantPaths = SESSION_ICON_VARIANTS[hash % SESSION_ICON_VARIANTS.length];
      const entryDateKey = toLocalDateKey(entry?.at || entry?.createdAt || entry?.date);
      const hasDateMatchedNote = Boolean(entryDateKey && noteDateSet.has(entryDateKey));
      const hasFallbackNote = !hasDateMatchedNote && noteFallbackCount > 0 && idx < Math.min(noteFallbackCount, targetCount);
      const noteMatch = hasDateMatchedNote || hasFallbackNote || Boolean(entry?.note || entry?.notes || entry?.body);
      const demoNote = !noteMatch && noteFallbackCount === 0 && idx % 3 === 0;
      let { body: noteBody } = findMatchedSessionNote(entry, notes);
      if (!noteBody && hasFallbackNote && notes[idx]) {
        const fb = notes[idx]?.body;
        if (typeof fb === 'string' && fb.trim()) {
          noteBody = fb.trim();
        }
      }
      const hasNote = Boolean(noteMatch || demoNote || (noteBody && noteBody.length > 0));
      return {
        id: `${entry?.at || 'now'}-${idx}`,
        at: entry?.at || entry?.createdAt || entry?.date || null,
        title: SESSION_TYPES[idx % SESSION_TYPES.length],
        date: formatDate(entry?.at || entry?.createdAt || entry?.date),
        minutes: 10 + (idx % 3) * 5,
        pct,
        tone,
        iconVariantPaths,
        hasNote,
      };
    });
    const visibleRows = allRows.filter((row) => !deletedRowIds.includes(row.id));
    if (range === 'all') return visibleRows;
    const now = Date.now();
    const start =
      range === '7d'
        ? now - 7 * 24 * 60 * 60 * 1000
        : now - 30 * 24 * 60 * 60 * 1000; // this month (rolling 30d)
    return visibleRows.filter((row) => {
      const stamp = new Date(row.at).getTime();
      return Number.isFinite(stamp) ? stamp >= start : true;
    });
  }, [surveyResults, sessionNotes, effectiveSessions, milestoneSessionCount, range, deletedRowIds]);

  const graphState = useMemo(() => {
    const seriesByRange = {
      '7d': {
        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        coherence: [68, 74, 72, 79, 83, 77, 85],
        points: [12, 16, 14, 20, 18, 22, 19],
        sessionLength: [8, 12, 10, 14, 11, 15, 13],
        quality: [66, 71, 69, 76, 80, 78, 82],
      },
      month: {
        x: ['W1', 'W2', 'W3', 'W4'],
        coherence: [70, 76, 81, 84],
        points: [48, 55, 62, 71],
        sessionLength: [36, 44, 49, 57],
        quality: [69, 74, 79, 83],
      },
      all: {
        x: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'],
        coherence: [62, 66, 71, 75, 79, 82, 86],
        points: [80, 96, 110, 124, 138, 151, 166],
        sessionLength: [28, 33, 41, 47, 52, 58, 64],
        quality: [60, 64, 69, 73, 77, 81, 85],
      },
    };
    const active = seriesByRange[range] || seriesByRange['7d'];
    const raw = active[metric];
    const activeIndexByRange = { '7d': active.x.length - 1, month: active.x.length - 1, all: Math.min(2, active.x.length - 1) };
    const activeIndex = activeIndexByRange[range] ?? (active.x.length - 1);
    const max = metric === 'points' ? Math.max(180, ...raw) : metric === 'sessionLength' ? Math.max(70, ...raw) : 100;
    const bars = raw.map((v) => Math.max(16, Math.min(96, Math.round((v / max) * 100))));

    if (metric === 'points') {
      const total = raw.reduce((s, v) => s + v, 0);
      return {
        title: `Total Points: ${total}`,
        subtitle: '',
        rightMeta: '',
        yTicks: ['150', '120', '90', '60', '30'],
        bars,
        xLabels: active.x,
        activeIndex,
        pointsSum: total,
      };
    }
    if (metric === 'sessionLength') {
      const totalMin = raw.reduce((s, v) => s + v, 0);
      const timeLabel = formatTotalDurationMinutes(totalMin);
      return {
        title: `Sessions: ${raw.length}`,
        subtitle: '',
        rightMeta: `Total time: ${timeLabel}`,
        yTicks: ['15 m', '12 m', '9 m', '6 m', '3 m'],
        bars,
        xLabels: active.x,
        activeIndex,
        minutesTotal: totalMin,
        minutesSessions: raw.length,
        minutesTotalLabel: timeLabel,
      };
    }
    if (metric === 'quality') {
      const avg = Math.round(raw.reduce((s, v) => s + v, 0) / raw.length);
      const zoneLegend = [
        { key: 'orange', color: '#F59E0B', value: Math.max(8, Math.round((100 - avg) * 0.35)) },
        { key: 'blue', color: '#3B82F6', value: Math.max(8, Math.round((100 - avg) * 0.25)) },
        { key: 'green', color: '#22C55E', value: avg },
      ];
      return {
        title: 'Yearly Avg:',
        subtitle: '',
        rightMeta: '',
        yTicks: ['100%', '80%', '60%', '40%', '20%'],
        bars,
        xLabels: active.x,
        activeIndex,
        zoneLegend,
      };
    }
    const highest = Math.max(...raw);
    const avg = (raw.reduce((s, v) => s + v, 0) / raw.length / 100 * 5).toFixed(1);
    return {
      title: `Highest ${range === '7d' ? 'Day' : range === 'month' ? 'Week' : 'Month'}: ${(highest / 100 * 5).toFixed(1)}`,
      subtitle: '',
      rightMeta: `Avg: ${avg}`,
      yTicks: ['5', '4', '3', '2', '1'],
      bars,
      xLabels: active.x,
      activeIndex,
      coherenceAvg: avg,
    };
  }, [metric, range]);

  return (
    <View style={[styles.root, { backgroundColor: PAGE_BG }]}>
      <LinearGradient
        colors={[theme.gradA, theme.gradB, theme.gradC]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[
          styles.headerBg,
          styles.headerBgStackInset,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.headerTrendsWrap}>
          <TouchableOpacity
            style={[styles.headerIconBtn, styles.headerIconBtnTrends]}
            accessibilityLabel="Go back"
            onPress={goBackOrProgress}
            activeOpacity={0.84}
          >
            <TopBarBackIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleTrends}>{isGraphRoute ? 'Trends' : 'Session History'}</Text>
          <Text style={styles.trendsHeaderSub}>
            {isGraphRoute ? 'Review your practice trends' : 'Review your Coherence Sessions'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: PAGE_BG }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 22 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterStripWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {RANGE_FILTER_CHIPS.map(({ key: rangeKey, label, Icon }) => {
              const active = range === rangeKey;
              return (
                <TouchableOpacity
                  key={rangeKey}
                  style={[
                    styles.metricChip,
                    Icon ? styles.filterChipIconRow : null,
                    { backgroundColor: theme.chipBg },
                    active && [styles.metricChipActive, { backgroundColor: theme.chipActive }],
                  ]}
                  onPress={() => setRange(rangeKey)}
                  activeOpacity={0.88}
                >
                  {Icon ? (
                    <Icon size={14} color={active ? theme.chipActiveText : theme.textMuted} strokeWidth={2.25} />
                  ) : null}
                  <Text
                    style={[
                      styles.metricChipTxt,
                      { color: theme.textMuted },
                      active && [styles.metricChipTxtActive, { color: theme.chipActiveText }],
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[styles.metricChip, styles.filterChipIconRow, { backgroundColor: theme.chipBg }]} activeOpacity={0.88}>
              <Filter size={14} color={theme.textMuted} strokeWidth={2.25} />
              <Text style={[styles.metricChipTxt, { color: theme.textMuted }]}>Session Type</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {!isGraphRoute ? (
          <>
            {rows.map((row) => (
              <SessionSwipeRow
                key={row.id}
                swipeRowId={row.id}
                activeSwipeRowId={openSwipeSessionId}
                onSwipeOpened={() => notifySwipeOpened(row.id)}
                onSwipeClosed={() => notifySwipeClosed(row.id)}
                onDelete={() =>
                  Alert.alert('Delete session?', 'This will remove the row from your history list.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        setOpenSwipeSessionId((prev) => (prev === row.id ? null : prev));
                        setDeletedRowIds((prev) => (prev.includes(row.id) ? prev : [...prev, row.id]));
                      },
                    },
                  ])
                }
              >
                <View style={[styles.sessionCard, styles.sessionCardInSwipeRow]}>
                  <View style={styles.sessionLeft}>
                    <View style={styles.sessionIconWrap}>
                      <SessionIconBg size={44} opacity={1} idSuffix={row.id} glyphPaths={row.iconVariantPaths} />
                    </View>
                    <View style={styles.sessionTextBlock}>
                      <View style={styles.sessionTitleRow}>
                        <Text style={[styles.sessionName, styles.sessionTitleFlex]} numberOfLines={2}>
                          {row.title}
                        </Text>
                        {row.hasNote ? (
                          <View style={[styles.sessionNoteBadge, styles.sessionNoteBadgeInline]}>
                            <Text style={styles.sessionNoteBadgeTxt}>Has note</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.sessionMetaRow}>
                        <Text style={[styles.sessionMeta, styles.sessionMetaFlex]} numberOfLines={1}>
                          {row.date}
                        </Text>
                        <View style={styles.sessionCohDurationRow}>
                          <View style={[styles.sessionMetaPill, { backgroundColor: row.tone.bg }]}>
                            <Text style={[styles.sessionMetaPillMinutes, { color: row.tone.text }]}>
                              {`${row.minutes} min, `}
                            </Text>
                            <Text style={[styles.cohPillTxt, { color: row.tone.text }]}>{row.pct}% COH</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </SessionSwipeRow>
            ))}
          </>
        ) : (
          <View style={styles.graphCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricChipRow}>
              {[
                { key: 'coherence', label: 'Coherence' },
                { key: 'points', label: 'Points' },
                { key: 'sessionLength', label: 'Minutes' },
                { key: 'quality', label: 'Zone' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.metricChip, { backgroundColor: theme.chipBg }, metric === m.key && [styles.metricChipActive, { backgroundColor: theme.chipActive }]]}
                  onPress={() => setMetric(m.key)}
                  activeOpacity={0.88}
                >
                  <Text style={[styles.metricChipTxt, { color: theme.textMuted }, metric === m.key && [styles.metricChipTxtActive, { color: theme.chipActiveText }]]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {metric !== 'quality' ? (
              <View style={styles.graphHeaderRow}>
                <View style={styles.graphMetaRow}>
                  <Text style={styles.graphTitle}>{graphState.title}</Text>
                  {graphState.rightMeta ? <Text style={styles.graphMetaRight}>{graphState.rightMeta}</Text> : null}
                </View>
                {graphState.subtitle ? <Text style={styles.graphSub}>{graphState.subtitle}</Text> : null}
              </View>
            ) : null}

            {metric === 'coherence' ? (
              <View style={[styles.coherenceChartWrap, { borderColor: theme.cardBorder }]}>
                <View style={styles.coherenceGrid}>
                  <View style={styles.coherenceGridRow}>
                    <Text style={styles.coherenceTick}>2</Text>
                    <View style={styles.coherenceGridLine} />
                  </View>
                </View>

                <View style={styles.coherenceMayTrack} />
                <GradientSpike style={styles.coherenceSpike} idSuffix="coh" />
                <LinearGradient
                  colors={['#FCD303', '#ED8B00', '#D50056']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={styles.coherencePeakDot}
                />

                <View style={styles.coherenceTooltip}>
                  <Text style={styles.coherenceTooltipTxt} numberOfLines={1}>Avg: {graphState.coherenceAvg || '1.1'}</Text>
                  <LinearGradient
                    colors={['#FCD303', '#ED8B00', '#D50056']}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={styles.coherenceTooltipStar}
                  />
                </View>

                <View style={styles.coherenceXAxis}>
                  {graphState.xLabels.map((label, idx) => (
                    <React.Fragment key={`coh-x-${label}-${idx}`}>
                      {idx === graphState.activeIndex ? (
                        <LinearGradient
                          colors={['#FCD303', '#ED8B00', '#D50056']}
                          start={{ x: 0.2, y: 0 }}
                          end={{ x: 0.85, y: 1 }}
                          style={styles.coherenceMayPill}
                        />
                      ) : null}
                      <Text style={styles.coherenceXLabel} numberOfLines={1}>{label}</Text>
                      {idx < graphState.xLabels.length - 1 ? <Text style={styles.coherenceXBullet}>●</Text> : null}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ) : metric === 'points' ? (
              <View style={[styles.pointsChartWrap, { borderColor: theme.cardBorder }]}>
                <View style={styles.pointsGrid}>
                  {['150', '120', '90', '60', '30'].map((tick, i) => (
                    <View key={`points-grid-${i}`} style={styles.pointsGridRow}>
                      <Text style={styles.pointsTick}>{tick}</Text>
                      <View style={styles.pointsGridLine} />
                    </View>
                  ))}
                </View>

                <View style={styles.pointsMayTrack} />
                <GradientSpike style={styles.pointsSpike} height={42} idSuffix="points" />
                <LinearGradient
                  colors={['#FCD303', '#ED8B00', '#D50056']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={styles.pointsPeakDot}
                />

                <View style={styles.pointsTooltip}>
                  <Text style={styles.pointsTooltipTxt} numberOfLines={1}>Sum: {graphState.pointsSum ?? 16}</Text>
                </View>

                <View style={styles.pointsXAxis}>
                  {graphState.xLabels.map((label, idx) => (
                    <React.Fragment key={`points-x-${label}-${idx}`}>
                      {idx === graphState.activeIndex ? (
                        <LinearGradient
                          colors={['#FCD303', '#ED8B00', '#D50056']}
                          start={{ x: 0.2, y: 0 }}
                          end={{ x: 0.85, y: 1 }}
                          style={styles.pointsMayPill}
                        />
                      ) : null}
                      <Text style={styles.pointsXLabel} numberOfLines={1}>{label}</Text>
                      {idx < graphState.xLabels.length - 1 ? <Text style={styles.pointsXBullet}>●</Text> : null}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ) : metric === 'sessionLength' ? (
              <View style={[styles.minutesChartWrap, { borderColor: theme.cardBorder }]}>
                <View style={styles.minutesGrid}>
                  {['15 m', '12 m', '9 m', '6 m', '3 m'].map((tick, i) => (
                    <View key={`minutes-grid-${i}`} style={styles.minutesGridRow}>
                      <Text style={styles.minutesTick}>{tick}</Text>
                      <View style={styles.minutesGridLine} />
                    </View>
                  ))}
                </View>

                <View style={styles.minutesMayTrack} />
                <GradientSpike style={styles.minutesSpike} idSuffix="mins" />
                <LinearGradient
                  colors={['#FCD303', '#ED8B00', '#D50056']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={styles.minutesPeakDot}
                />

                <View style={styles.minutesTooltip}>
                  <View style={styles.minutesTooltipCol}>
                    <Text style={styles.minutesTooltipKey} numberOfLines={1}>Sessions</Text>
                    <Text style={styles.minutesTooltipVal} numberOfLines={1}>{graphState.minutesSessions ?? 2}</Text>
                  </View>
                  <View style={styles.minutesTooltipDivider} />
                  <View style={styles.minutesTooltipCol}>
                    <Text style={styles.minutesTooltipKey} numberOfLines={1}>Time</Text>
                    <Text style={styles.minutesTooltipVal} numberOfLines={1}>
                      {graphState.minutesTotalLabel ?? formatTotalDurationMinutes(graphState.minutesTotal ?? 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.minutesXAxis}>
                  {graphState.xLabels.map((label, idx) => (
                    <React.Fragment key={`mins-x-${label}-${idx}`}>
                      {idx === graphState.activeIndex ? (
                        <LinearGradient
                          colors={['#FCD303', '#ED8B00', '#D50056']}
                          start={{ x: 0.2, y: 0 }}
                          end={{ x: 0.85, y: 1 }}
                          style={styles.minutesMayPill}
                        />
                      ) : null}
                      <Text style={styles.minutesXLabel} numberOfLines={1}>{label}</Text>
                      {idx < graphState.xLabels.length - 1 ? <Text style={styles.minutesXBullet}>●</Text> : null}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ) : metric === 'quality' ? (
              <>
                <View style={styles.zoneHeaderRow}>
                  <Text style={styles.zoneTopTitle} numberOfLines={1}>
                    {graphState.title}
                  </Text>
                  <View style={styles.zoneLegendRow}>
                    {(graphState.zoneLegend || []).map((z) => (
                      <View key={z.key} style={styles.zoneLegendItem}>
                        <View style={[styles.zoneLegendDot, { backgroundColor: z.color }]} />
                        <Text style={styles.zoneLegendValue} numberOfLines={1}>
                          {z.value}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[styles.zoneChartWrap, { borderColor: theme.cardBorder }]}>
                  <View style={styles.zoneGrid}>
                    {['100%', '80%', '60%', '40%', '20%', '0'].map((tick, i) => (
                      <View key={`zone-grid-${i}`} style={styles.zoneGridRow}>
                        <Text style={[styles.zoneTick, tick === '80%' && styles.zoneTickGreen]}>{tick}</Text>
                        <View style={[styles.zoneGridLine, tick === '80%' && styles.zoneGridLineGreen]} />
                      </View>
                    ))}
                  </View>

                  <View style={styles.zoneMayTrack} />
                  <View style={styles.zoneBarsWrap}>
                    {(graphState.zoneLegend || []).map((z) => (
                      <View
                        key={`zone-bar-${z.key}`}
                        style={[styles.zoneBar, { backgroundColor: z.color, height: `${Math.max(10, z.value)}%` }]}
                      />
                    ))}
                  </View>

                  <View style={styles.zoneTooltip}>
                    {(graphState.zoneLegend || []).map((z) => (
                      <View key={`zone-tip-${z.key}`} style={styles.zoneTooltipRow}>
                        <View style={[styles.zoneLegendDot, { backgroundColor: z.color }]} />
                        <Text style={[styles.zoneTooltipTxt, { color: z.color }]} numberOfLines={1}>
                          {z.key.charAt(0).toUpperCase() + z.key.slice(1)}:{z.value}%
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.zoneXAxis}>
                    {graphState.xLabels.map((label, idx) => (
                      <React.Fragment key={`zone-x-${label}-${idx}`}>
                        {idx === graphState.activeIndex ? (
                          <LinearGradient
                            colors={['#FCD303', '#ED8B00', '#D50056']}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.85, y: 1 }}
                            style={styles.zoneMayPill}
                          />
                        ) : null}
                        <Text style={styles.zoneXLabel} numberOfLines={1}>
                          {label}
                        </Text>
                        {idx < graphState.xLabels.length - 1 ? <Text style={styles.zoneXBullet}>●</Text> : null}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <View style={[styles.chartWrap, { borderColor: theme.cardBorder }]}>
                <View style={styles.chartGrid}>
                  {graphState.yTicks.map((tick, i) => (
                    <View key={`grid-${i}`} style={styles.chartGridLineRow}>
                      <Text style={styles.chartTick}>{tick}</Text>
                      <View style={styles.chartGridLine} />
                    </View>
                  ))}
                </View>
                <View style={styles.chartBars}>
                  {graphState.bars.map((h, idx) => (
                    <View key={`g-${idx}`} style={styles.chartBarCol}>
                      <View style={[styles.chartBar, idx % 2 ? styles.chartBarSoft : null, { height: `${h}%`, opacity: h === 0 ? 0.14 : 1 }]} />
                      <Text style={styles.chartDay}>{graphState.xLabels[idx]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  headerBg: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + 6,
    borderBottomLeftRadius: borderRadius.sheet,
    borderBottomRightRadius: borderRadius.sheet,
  },
  headerBgStackInset: {
    paddingLeft: 36,
  },
  headerTrendsWrap: {
    width: '100%',
    alignItems: 'flex-start',
  },
  headerTitleTrends: {
    marginTop: spacing.sm,
    width: '100%',
    fontFamily: FONT_REGULAR,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '500',
    letterSpacing: 0,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  trendsHeaderSub: {
    marginTop: spacing.xs,
    width: '100%',
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0,
    textAlign: 'left',
  },
  headerIconBtn: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  headerIconBtnTrends: { paddingLeft: 0, paddingRight: 6, paddingVertical: 6 },
  content: { paddingHorizontal: spacing.lg },
  filterStripWrap: {
    alignSelf: 'stretch',
    paddingTop: HEADER_TO_FILTER_GAP,
  },
  filterRow: {
    gap: 10,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: FILTER_ROW_BOTTOM_GAP,
  },
  filterChipIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 0,
    borderWidth: 1,
    borderColor: WARM.cardBorder,
    shadowColor: WARM.cardShadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 12,
    elevation: 2,
  },
  sessionCardInSwipeRow: {
    alignSelf: 'stretch',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderWidth: 0,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sessionSwipeRowWrap: {
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: PAGE_BG,
    borderWidth: 1,
    borderColor: WARM.cardBorder,
  },
  sessionSwipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    zIndex: 0,
    elevation: 0,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  sessionSwipeContent: {
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    elevation: 0,
    width: '100%',
  },
  sessionSwipeActionBtn: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionSwipeDeleteBtn: {
    backgroundColor: '#FFE6D6',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    flex: 1,
    minWidth: 0,
  },
  sessionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sessionTitleFlex: {
    flex: 1,
    minWidth: 0,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    width: '100%',
  },
  sessionMetaFlex: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  sessionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  sessionName: {
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: SUBTITLE_TEXT_COLOR,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  sessionMeta: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption,
    lineHeight: 16,
    color: META_TEXT_COLOR,
    fontWeight: '400',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  sessionNoteBadge: {
    marginBottom: 6,
    paddingHorizontal: 8,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(225,139,49,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(225,139,49,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionNoteBadgeTxt: {
    fontFamily: FONT_BOLD,
    fontSize: 10,
    lineHeight: 12,
    color: '#9B4E16',
  },
  sessionNoteBadgeInline: {
    marginBottom: 0,
    flexShrink: 0,
    marginTop: 1,
  },
  sessionMetaPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  sessionMetaPillMinutes: {
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  cohPillTxt: {
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
    fontWeight: '600',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  sessionCohDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  graphCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.lg + 2,
    paddingBottom: spacing.lg + 4,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: WARM.cardBorder,
    shadowColor: WARM.cardShadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 12,
    elevation: 2,
  },
  graphTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: '#2C2C2E',
  },
  graphMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  graphHeaderRow: {
    paddingHorizontal: 8,
    marginTop: spacing.sm,
    marginBottom: 8,
    paddingVertical: 6,
  },
  graphMetaRight: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: '#2C2C2E',
  },
  graphSub: {
    marginTop: 0,
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.body,
    lineHeight: 18,
    color: SUBTITLE_TEXT_COLOR,
  },
  metricChipRow: {
    gap: 10,
    marginTop: spacing.lg,
    paddingBottom: 36,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  metricChip: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    backgroundColor: WARM.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricChipActive: { backgroundColor: WARM.chipActive },
  metricChipTxt: {
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: WARM.textMuted,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  metricChipTxtActive: { color: WARM.chipActiveText, fontFamily: FONT_BOLD },
  chartWrap: {
    marginTop: spacing.md,
    height: 378,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: WARM.cardBorder,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 70,
  },
  chartGridLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chartTick: {
    width: 44,
    fontFamily: FONT_REGULAR,
    fontSize: 13,
    lineHeight: 16,
    color: '#473B32',
    textAlign: 'right',
  },
  chartGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(225,139,49,0.15)',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: spacing.xl + 14,
    paddingRight: spacing.lg,
    paddingBottom: spacing.xl + 4,
    paddingTop: spacing.md + 4,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  chartBar: {
    width: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#E18B31',
  },
  chartBarSoft: {
    backgroundColor: '#F7BB7C',
  },
  chartDay: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: '#4A3E35',
  },
  zoneChartWrap: {
    marginTop: 0,
    height: TREND_WRAP_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    paddingTop: 10,
  },
  zoneTopTitle: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: '#2C2C2E',
    flexShrink: 1,
  },
  zoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: spacing.sm,
    marginBottom: 8,
    paddingVertical: 6,
  },
  zoneLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  zoneLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  zoneLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  zoneLegendValue: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption - 1,
    lineHeight: 15,
    color: '#4B4255',
  },
  zoneGrid: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: TREND_GRID_TOP,
    bottom: TREND_GRID_BOTTOM,
    justifyContent: 'space-between',
  },
  zoneGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneTick: {
    width: 48,
    textAlign: 'right',
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    lineHeight: 16,
    color: '#2C2C2E',
  },
  zoneTickGreen: {
    color: '#22C55E',
  },
  zoneGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D1',
  },
  zoneGridLineGreen: {
    backgroundColor: '#22C55E',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#22C55E',
    height: 0,
  },
  zoneMayTrack: {
    position: 'absolute',
    top: 94,
    bottom: TREND_BASELINE_BOTTOM,
    left: TREND_TRACK_LEFT,
    width: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(23,23,23,0.16)',
  },
  zoneBarsWrap: {
    position: 'absolute',
    left: TREND_TRACK_LEFT,
    bottom: TREND_BASELINE_BOTTOM,
    width: 28,
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
  },
  zoneBar: {
    width: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  zoneTooltip: {
    position: 'absolute',
    left: '11%',
    top: 70,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(107,45,139,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  zoneTooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneTooltipTxt: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption,
    lineHeight: 16,
  },
  zoneXAxis: {
    position: 'absolute',
    left: 36,
    right: 8,
    bottom: TREND_X_AXIS_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneXLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption,
    lineHeight: 16,
    color: '#000000',
  },
  zoneXBullet: {
    fontFamily: FONT_BOLD,
    fontSize: 12,
    color: '#000000',
  },
  zoneMayPill: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  minutesChartWrap: {
    marginTop: spacing.md,
    height: TREND_WRAP_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    paddingTop: 12,
  },
  minutesGrid: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: TREND_GRID_TOP,
    bottom: TREND_GRID_BOTTOM,
    justifyContent: 'space-between',
  },
  minutesGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  minutesTick: {
    width: 36,
    textAlign: 'right',
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 14,
    color: '#2C2C2E',
  },
  minutesGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D1',
  },
  minutesMayTrack: {
    position: 'absolute',
    top: 168,
    bottom: TREND_BASELINE_BOTTOM,
    left: TREND_TRACK_LEFT,
    width: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(23,23,23,0.14)',
  },
  minutesSpike: {
    position: 'absolute',
    left: TREND_TRACK_LEFT,
    marginLeft: 2,
    bottom: TREND_BASELINE_BOTTOM,
    width: 36,
    height: 84,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
  },
  minutesPeakDot: {
    position: 'absolute',
    left: '30%',
    marginLeft: 12,
    bottom: 138,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  minutesTooltip: {
    position: 'absolute',
    left: TREND_TOOLTIP_LEFT,
    top: 74,
    width: 144,
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107,45,139,0.35)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  minutesTooltipCol: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  minutesTooltipKey: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    color: '#6B2D8B',
    lineHeight: 16,
  },
  minutesTooltipVal: {
    marginTop: 2,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    color: '#6B2D8B',
    lineHeight: 20,
  },
  minutesTooltipDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(107,45,139,0.24)',
    marginVertical: 10,
  },
  minutesXAxis: {
    position: 'absolute',
    left: 36,
    right: 8,
    bottom: TREND_X_AXIS_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  minutesXLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption,
    lineHeight: 16,
    color: '#000000',
  },
  minutesXBullet: {
    fontFamily: FONT_BOLD,
    fontSize: 12,
    color: '#000000',
  },
  minutesMayPill: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  pointsChartWrap: {
    marginTop: spacing.md,
    height: TREND_WRAP_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    paddingTop: 12,
  },
  pointsGrid: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: TREND_GRID_TOP,
    bottom: TREND_GRID_BOTTOM,
    justifyContent: 'space-between',
  },
  pointsGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsTick: {
    width: 36,
    textAlign: 'right',
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 14,
    color: '#2C2C2E',
  },
  pointsGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D1',
  },
  pointsMayTrack: {
    position: 'absolute',
    top: 168,
    bottom: TREND_BASELINE_BOTTOM,
    left: TREND_TRACK_LEFT,
    width: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(23,23,23,0.14)',
  },
  pointsSpike: {
    position: 'absolute',
    left: TREND_TRACK_LEFT,
    marginLeft: 2,
    bottom: TREND_BASELINE_BOTTOM,
    width: 36,
    height: 42,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  pointsPeakDot: {
    position: 'absolute',
    left: '30%',
    marginLeft: 12,
    bottom: 94,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  pointsTooltip: {
    position: 'absolute',
    left: TREND_TOOLTIP_LEFT,
    top: 122,
    minWidth: 66,
    height: 34,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107,45,139,0.35)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pointsTooltipTxt: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.body,
    color: '#6B2D8B',
    lineHeight: 18,
  },
  pointsXAxis: {
    position: 'absolute',
    left: 36,
    right: 8,
    bottom: TREND_X_AXIS_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsXLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption,
    lineHeight: 16,
    color: '#000000',
  },
  pointsXBullet: {
    fontFamily: FONT_BOLD,
    fontSize: 12,
    color: '#000000',
  },
  pointsMayPill: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  coherenceChartWrap: {
    marginTop: spacing.md,
    height: TREND_WRAP_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    paddingTop: 12,
  },
  coherenceGrid: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 126,
  },
  coherenceGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coherenceTick: {
    width: 36,
    textAlign: 'right',
    fontFamily: FONT_REGULAR,
    fontSize: 11,
    lineHeight: 14,
    color: '#2C2C2E',
  },
  coherenceGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D1',
  },
  coherenceMayTrack: {
    position: 'absolute',
    top: 172,
    bottom: TREND_BASELINE_BOTTOM,
    left: TREND_TRACK_LEFT,
    width: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(23,23,23,0.14)',
  },
  coherenceSpike: {
    position: 'absolute',
    left: TREND_TRACK_LEFT,
    marginLeft: 2,
    bottom: TREND_BASELINE_BOTTOM,
    width: 36,
    height: 84,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
  },
  coherencePeakDot: {
    position: 'absolute',
    left: '30%',
    marginLeft: 12,
    bottom: 138,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  coherenceTooltip: {
    position: 'absolute',
    left: TREND_TOOLTIP_LEFT,
    top: 76,
    width: 74,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107,45,139,0.35)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  coherenceTooltipTxt: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.body,
    color: '#6B2D8B',
    lineHeight: 18,
  },
  coherenceTooltipStar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  coherenceXAxis: {
    position: 'absolute',
    left: 36,
    right: 8,
    bottom: TREND_X_AXIS_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coherenceXLabel: {
    fontFamily: FONT_REGULAR,
    fontSize: TYPE.caption,
    lineHeight: 16,
    color: '#000000',
  },
  coherenceXBullet: {
    fontFamily: FONT_BOLD,
    fontSize: 12,
    color: '#000000',
  },
  coherenceMayPill: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
});

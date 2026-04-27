/**
 * Session insights tokens + value helpers for survey-linked reflection screens.
 */
export const sessionInsightsTokens = {
  spacing: { 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 32: 32 },
  radius: { sm: 16, md: 20, lg: 24, pill: 999, cta: 26 },
  colors: {
    gradientTop: '#FF4FB3',
    gradientBottom: '#C77DFF',
    glass: 'rgba(255,255,255,0.14)',
    glassStrong: 'rgba(255,255,255,0.18)',
    glassStroke: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.82)',
    textMuted: 'rgba(255,255,255,0.64)',
    buttonBg: '#F3EFD9',
    buttonText: '#7A3F6B',
    dotInactive: 'rgba(255,255,255,0.24)',
    dotActive: '#F3EFD9',
  },
  sizes: {
    topBarHeight: 56,
    ctaHeight: 52,
    heroMinHeight: 132,
    cardPadding: 16,
    screenHorizontalPadding: 20,
    contentBottomPadding: 120,
    scaleDot: 16,
    scaleDotCompact: 14,
  },
};

export const SESSION_INSIGHT_METRIC_LABELS = {
  stress: { leftLabel: 'Low stress', rightLabel: 'High stress' },
  energy: { leftLabel: 'Drained', rightLabel: 'Energized' },
  mood: { leftLabel: 'Feel bad', rightLabel: 'Feel good' },
};

export function normalizeScaleValue(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(1, Math.min(10, Math.round(value)));
}

export function hasScalePair(beforeValue, afterValue) {
  return normalizeScaleValue(beforeValue) != null && normalizeScaleValue(afterValue) != null;
}

export function getMetricEndpointLabels(metric, leftLabel, rightLabel) {
  const defaults = SESSION_INSIGHT_METRIC_LABELS[metric] ?? {};
  return {
    leftLabel: leftLabel ?? defaults.leftLabel ?? '',
    rightLabel: rightLabel ?? defaults.rightLabel ?? '',
  };
}

/**
 * Percent of movable tension toward “low stress” when stress decreases (scale 1–10).
 * Uses the distance from current toward 1 as the denominator.
 */
export function computeTensionOffloadPercent(beforeValue, afterValue) {
  const before = normalizeScaleValue(beforeValue);
  const after = normalizeScaleValue(afterValue);
  if (before == null || after == null || before <= 1 || after >= before) return 0;
  const room = before - 1;
  return Math.min(100, Math.round(((before - after) / room) * 100));
}

export function hasAnyStateShiftMetric(stressBefore, stressAfter, energyBefore, energyAfter, moodBefore, moodAfter) {
  return (
    hasScalePair(stressBefore, stressAfter) ||
    hasScalePair(energyBefore, energyAfter) ||
    hasScalePair(moodBefore, moodAfter)
  );
}

/**
 * Narrative lines for positive stress recovery, energy lift, and mood lift (this session).
 */
export function getStateShiftMessages({
  stressBefore,
  stressAfter,
  energyBefore,
  energyAfter,
  moodBefore,
  moodAfter,
}) {
  const messages = [];

  const sb = normalizeScaleValue(stressBefore);
  const sa = normalizeScaleValue(stressAfter);
  if (sb != null && sa != null && sa < sb) {
    const x = computeTensionOffloadPercent(stressBefore, stressAfter);
    messages.push(
      `You successfully offloaded ${x}% of your tension. Your nervous system is now in recovery mode.`
    );
  }

  const eb = normalizeScaleValue(energyBefore);
  const ea = normalizeScaleValue(energyAfter);
  if (eb != null && ea != null && ea > eb) {
    messages.push(
      "Oxygenation complete. You've shifted from 'Drained' to 'Stable'—a sustainable lift for your afternoon."
    );
  }

  const mb = normalizeScaleValue(moodBefore);
  const ma = normalizeScaleValue(moodAfter);
  if (mb != null && ma != null && ma > mb) {
    messages.push(
      'The heart-mind connection has strengthened. You are leaving the session with more emotional headspace.'
    );
  }

  return messages;
}

/** Single block for compact State shift card (headline + summary under the hero). */
export function getStateShiftSummaryBody({
  stressBefore,
  stressAfter,
  energyBefore,
  energyAfter,
  moodBefore,
  moodAfter,
}) {
  const messages = getStateShiftMessages({
    stressBefore,
    stressAfter,
    energyBefore,
    energyAfter,
    moodBefore,
    moodAfter,
  });
  if (messages.length > 0) return messages[0];
  return "Your check-in shows this session's before and after positions—another full session will sharpen the trend.";
}

export function getShiftInsight(metric, beforeValue, afterValue) {
  const before = normalizeScaleValue(beforeValue);
  const after = normalizeScaleValue(afterValue);
  if (before == null || after == null) return '';

  if (metric === 'stress') {
    if (after < before) return 'You felt a little calmer after the session.';
    if (after > before) return 'Your stress felt a bit higher after the session.';
    return 'Your stress stayed about the same after the session.';
  }

  if (metric === 'energy') {
    if (after > before) return 'Your energy moved upward after the session.';
    if (after < before) return 'Your energy dipped a little after the session.';
    return 'Your energy stayed about the same after the session.';
  }

  if (metric === 'mood') {
    if (after > before) return 'Your mood lifted after the session.';
    if (after < before) return 'Your mood felt a little lower after the session.';
    return 'Your mood stayed about the same after the session.';
  }

  return '';
}

export function getInsightsVariant({ variant, sessionCount = 1 }) {
  if (variant === 'firstTime' || variant === 'beginner' || variant === 'pro') return variant;
  if (sessionCount >= 100) return 'pro';
  if (sessionCount >= 10) return 'beginner';
  return 'firstTime';
}

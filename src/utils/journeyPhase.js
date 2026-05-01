/**
 * My Progress journey levels / substates by sessions completed.
 *
 * Level 1 Foundation: 0–5 — start @0, middle 1–4, end @5
 * Level 2 Seed: 6–10 — start @6, middle 7–9, end @10
 * Level 3 Habit: 11–30 — start @11, middle 12–29, end @30
 * Level 4 Deep Practice: 31+ — start @31, ongoing @32+ (spec "end" state)
 * Level 5 Pro: 100+ sessions (legacy milestone tier)
 */

/** @typedef {'start' | 'middle' | 'end'} JourneyPhaseState */
/** @typedef {'foundation' | 'seed' | 'habit' | 'deepPractice' | 'pro'} JourneyLevelKey */

/**
 * @param {number} sessionCount
 * @returns {{
 *   sessions: number,
 *   level: number,
 *   levelKey: JourneyLevelKey,
 *   phaseState: JourneyPhaseState | 'ongoing',
 * }}
 */
export function getJourneyPhaseDetail(sessionCount) {
  const n = Math.max(0, Math.floor(Number(sessionCount) || 0));

  if (n >= 100) {
    return { sessions: n, level: 5, levelKey: 'pro', phaseState: 'ongoing' };
  }
  if (n >= 32) {
    return { sessions: n, level: 4, levelKey: 'deepPractice', phaseState: 'ongoing' };
  }
  if (n === 31) {
    return { sessions: n, level: 4, levelKey: 'deepPractice', phaseState: 'start' };
  }
  if (n === 30) {
    return { sessions: n, level: 3, levelKey: 'habit', phaseState: 'end' };
  }
  if (n >= 12 && n <= 29) {
    return { sessions: n, level: 3, levelKey: 'habit', phaseState: 'middle' };
  }
  if (n === 11) {
    return { sessions: n, level: 3, levelKey: 'habit', phaseState: 'start' };
  }
  if (n === 10) {
    return { sessions: n, level: 2, levelKey: 'seed', phaseState: 'end' };
  }
  if (n >= 7 && n <= 9) {
    return { sessions: n, level: 2, levelKey: 'seed', phaseState: 'middle' };
  }
  if (n === 6) {
    return { sessions: n, level: 2, levelKey: 'seed', phaseState: 'start' };
  }
  if (n === 5) {
    return { sessions: n, level: 1, levelKey: 'foundation', phaseState: 'end' };
  }
  if (n >= 1 && n <= 4) {
    return { sessions: n, level: 1, levelKey: 'foundation', phaseState: 'middle' };
  }
  return { sessions: n, level: 1, levelKey: 'foundation', phaseState: 'start' };
}

/**
 * Editorial quote pool key for ProgressMainScreen.
 * @param {ReturnType<typeof getJourneyPhaseDetail>} detail
 * @param {boolean} hasSurveyInsightsOptOut
 */
export function getEditorialQuotePoolKey(detail, hasSurveyInsightsOptOut) {
  if (hasSurveyInsightsOptOut) return 'inactive';
  if (detail.levelKey === 'pro' || detail.levelKey === 'deepPractice') return 'deep';
  if (detail.levelKey === 'habit' && detail.phaseState === 'end') return 'deep';
  if (detail.levelKey === 'habit') return 'building';
  if (detail.levelKey === 'seed') return 'building';
  if (detail.levelKey === 'foundation' && detail.phaseState === 'end') return 'building';
  if (detail.levelKey === 'foundation' && detail.phaseState === 'start') return 'early';
  return 'early';
}

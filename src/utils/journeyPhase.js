/**
 * Progress journey levels / substates by unique practice days.
 *
 * Settle (Foundation): 2–5 unique days
 * Flow (Seed): 6–12 unique days
 * Deep (Habit): 13–19 unique days
 * Still (Deep Practice): 20+ unique days
 *
 * Values below 2 are treated as pre-Settle (foundation "start").
 */

/** @typedef {'start' | 'middle' | 'end'} JourneyPhaseState */
/** @typedef {'foundation' | 'seed' | 'habit' | 'deepPractice'} JourneyLevelKey */

/**
 * @param {number} practiceDayCount
 * @returns {{
 *   practiceDays: number,
 *   level: number,
 *   levelKey: JourneyLevelKey,
 *   phaseState: JourneyPhaseState | 'ongoing',
 * }}
 */
export function getJourneyPhaseDetail(practiceDayCount) {
  const n = Math.max(0, Math.floor(Number(practiceDayCount) || 0));

  if (n >= 21) {
    return { practiceDays: n, level: 4, levelKey: 'deepPractice', phaseState: 'ongoing' };
  }
  if (n === 20) {
    return { practiceDays: n, level: 4, levelKey: 'deepPractice', phaseState: 'start' };
  }
  if (n === 19) {
    return { practiceDays: n, level: 3, levelKey: 'habit', phaseState: 'end' };
  }
  if (n >= 14 && n <= 18) {
    return { practiceDays: n, level: 3, levelKey: 'habit', phaseState: 'middle' };
  }
  if (n === 13) {
    return { practiceDays: n, level: 3, levelKey: 'habit', phaseState: 'start' };
  }
  if (n === 12) {
    return { practiceDays: n, level: 2, levelKey: 'seed', phaseState: 'end' };
  }
  if (n >= 7 && n <= 11) {
    return { practiceDays: n, level: 2, levelKey: 'seed', phaseState: 'middle' };
  }
  if (n === 6) {
    return { practiceDays: n, level: 2, levelKey: 'seed', phaseState: 'start' };
  }
  if (n === 5) {
    return { practiceDays: n, level: 1, levelKey: 'foundation', phaseState: 'end' };
  }
  if (n >= 3 && n <= 4) {
    return { practiceDays: n, level: 1, levelKey: 'foundation', phaseState: 'middle' };
  }
  return { practiceDays: n, level: 1, levelKey: 'foundation', phaseState: 'start' };
}

/**
 * Editorial quote pool key for ProgressMainScreen.
 * @param {ReturnType<typeof getJourneyPhaseDetail>} detail
 * @param {boolean} hasSurveyInsightsOptOut
 */
export function getEditorialQuotePoolKey(detail, hasSurveyInsightsOptOut) {
  if (hasSurveyInsightsOptOut) return 'inactive';
  if (detail.levelKey === 'deepPractice') return 'deep';
  if (detail.levelKey === 'habit' && detail.phaseState === 'end') return 'deep';
  if (detail.levelKey === 'habit') return 'building';
  if (detail.levelKey === 'seed') return 'building';
  if (detail.levelKey === 'foundation' && detail.phaseState === 'end') return 'building';
  if (detail.levelKey === 'foundation' && detail.phaseState === 'start') return 'early';
  return 'early';
}

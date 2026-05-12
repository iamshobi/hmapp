/** @typedef {'start' | 'middle' | 'end'} JourneyPhaseState */
/** @typedef {'settle' | 'flow' | 'deep' | 'still'} JourneyLevelKey */

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
    return { practiceDays: n, level: 4, levelKey: 'still', phaseState: 'ongoing' };
  }
  if (n === 20) {
    return { practiceDays: n, level: 4, levelKey: 'still', phaseState: 'start' };
  }
  if (n === 19) {
    return { practiceDays: n, level: 3, levelKey: 'deep', phaseState: 'end' };
  }
  if (n >= 14 && n <= 18) {
    return { practiceDays: n, level: 3, levelKey: 'deep', phaseState: 'middle' };
  }
  if (n === 13) {
    return { practiceDays: n, level: 3, levelKey: 'deep', phaseState: 'start' };
  }
  if (n === 12) {
    return { practiceDays: n, level: 2, levelKey: 'flow', phaseState: 'end' };
  }
  if (n >= 7 && n <= 11) {
    return { practiceDays: n, level: 2, levelKey: 'flow', phaseState: 'middle' };
  }
  if (n === 6) {
    return { practiceDays: n, level: 2, levelKey: 'flow', phaseState: 'start' };
  }
  if (n === 5) {
    return { practiceDays: n, level: 1, levelKey: 'settle', phaseState: 'end' };
  }
  if (n >= 3 && n <= 4) {
    return { practiceDays: n, level: 1, levelKey: 'settle', phaseState: 'middle' };
  }
  return { practiceDays: n, level: 1, levelKey: 'settle', phaseState: 'start' };
}

/**
 * @param {ReturnType<typeof getJourneyPhaseDetail>} detail
 * @param {boolean} hasSurveyInsightsOptOut
 */
export function getEditorialQuotePoolKey(detail, hasSurveyInsightsOptOut) {
  if (hasSurveyInsightsOptOut) return 'inactive';
  if (detail.levelKey === 'still') return 'deep';
  if (detail.levelKey === 'deep' && detail.phaseState === 'end') return 'deep';
  if (detail.levelKey === 'deep') return 'building';
  if (detail.levelKey === 'flow') return 'building';
  if (detail.levelKey === 'settle' && detail.phaseState === 'end') return 'building';
  if (detail.levelKey === 'settle' && detail.phaseState === 'start') return 'early';
  return 'early';
}

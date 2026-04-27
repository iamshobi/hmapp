export const DIFFICULTY_KEYS = ['basic', 'medium', 'advanced'];

export const DIFFICULTY_LABELS = {
  basic: 'Basic',
  medium: 'Medium',
  advanced: 'Advanced',
};

/** First eight names match indices 0–7 in `sacredGeometryRewards` (Pardesco article order). */
export const SACRED_SYMBOL_NAMES_BY_DIFFICULTY = {
  basic: ['Torus / Lotus of Life', 'Flower of Life', 'Tree of Life'],
  medium: ['Sri Yantra', 'Six Petal Rosette', "Metatron's Cube"],
  advanced: ['Star of David', 'Star Tetrahedron (Merkaba)'],
};

/** Sacred geometry name for a practice step (same order as levels in that difficulty). */
export function getStepSymbolName(difficulty, localIndex) {
  const names = SACRED_SYMBOL_NAMES_BY_DIFFICULTY[difficulty] ?? [];
  return names[localIndex] ?? '—';
}

/** All sessions cap at 2 min — mandala completes with session time. */
const T120 = 120;

const BASIC_IDS = ['b1', 'b2', 'b3'];
const MEDIUM_IDS = ['m1', 'm2', 'm3'];
const ADVANCED_IDS = ['a1', 'a2'];

/** Practice steps use sacred geometry names only (matches session + collection). */
export const LEVELS_BY_DIFFICULTY = {
  basic: SACRED_SYMBOL_NAMES_BY_DIFFICULTY.basic.slice(0, 3).map((name, i) => ({
    id: BASIC_IDS[i],
    name,
    finishLabel: '2:00',
    durationSec: T120,
  })),
  medium: SACRED_SYMBOL_NAMES_BY_DIFFICULTY.medium.slice(0, 3).map((name, i) => ({
    id: MEDIUM_IDS[i],
    name,
    finishLabel: '2:00',
    durationSec: T120,
  })),
  advanced: SACRED_SYMBOL_NAMES_BY_DIFFICULTY.advanced.slice(0, 2).map((name, i) => ({
    id: ADVANCED_IDS[i],
    name,
    finishLabel: '2:00',
    durationSec: T120,
  })),
};

/** Linear progression: basic → medium → advanced (unlock next after each completion). */
export const FLAT_LEVELS = [];
for (const difficulty of DIFFICULTY_KEYS) {
  const arr = LEVELS_BY_DIFFICULTY[difficulty] ?? [];
  arr.forEach((level) => {
    FLAT_LEVELS.push({
      ...level,
      difficulty,
      globalIndex: FLAT_LEVELS.length,
    });
  });
}

export const GLOBAL_LEVEL_COUNT = FLAT_LEVELS.length;

export function getGlobalLevelIndex(difficulty, localIndex) {
  const level = LEVELS_BY_DIFFICULTY[difficulty]?.[localIndex];
  if (!level) return -1;
  return FLAT_LEVELS.findIndex((x) => x.id === level.id && x.difficulty === difficulty);
}

/**
 * @param {number} localIndex — index within current difficulty tab
 * @param {number} maxUnlockedGlobalIndex — from context; only levels with globalIndex <= this are playable
 */
export function isLevelUnlockedForProgress(difficulty, localIndex, maxUnlockedGlobalIndex) {
  const g = getGlobalLevelIndex(difficulty, localIndex);
  if (g < 0) return false;
  return g <= maxUnlockedGlobalIndex;
}

/** @deprecated Use isLevelUnlockedForProgress + context */
export function isLevelUnlocked(levelIndex, totalSessions) {
  const threshold = 2 + Math.floor(totalSessions / 2);
  return levelIndex < Math.min(threshold, 99);
}

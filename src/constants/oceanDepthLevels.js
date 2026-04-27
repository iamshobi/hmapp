/**
 * Ocean depth zones — labels and depths match pelagic zone infographic
 * (Epipelagic … Hadalpelagic, boundary markers, 10,994 m hadal floor).
 *
 * Session backdrop maps image Y: top → OCEAN_BACKDROP_DEPTH_MIN_M, bottom → OCEAN_BACKDROP_DEPTH_MAX_M.
 * Pan spans only the selected zone (start → end depth) along that axis.
 */

/** Full-strip depth axis (m) — image top → hadal floor (infographic: 10,994 m) */
export const OCEAN_BACKDROP_DEPTH_MIN_M = -8000;
export const OCEAN_BACKDROP_DEPTH_MAX_M = 10994;

/** Scroll / crossing NOTE: depth (m) and label shown when dash crosses into twilight */
export const OCEAN_DEPTH_NOTE_200M_BRACKET_M = 200;
export const OCEAN_DEPTH_NOTE_200M_LABEL = 'Mesopelagic Zone';

const ZONE_SCROLL_BOUNDS_M = {
  epipelagic: { startM: 0, endM: 200 },
  mesopelagic: { startM: 200, endM: 1000 },
  bathypelagic: { startM: 1000, endM: 4000 },
  abyssopelagic: { startM: 4000, endM: 6000 },
  hadal: { startM: 6000, endM: OCEAN_BACKDROP_DEPTH_MAX_M },
};

export function getOceanZoneScrollDepthBoundsM(level) {
  const b = ZONE_SCROLL_BOUNDS_M[level?.id];
  if (!b) return { startM: 0, endM: 200 };
  return { startM: b.startM, endM: b.endM };
}

/** Virtual level: one session pans surface → hadal floor (try-out / full infographic). */
export const OCEAN_FULL_COLUMN_LEVEL_ID = 'fullColumn';

export const FULL_OCEAN_COLUMN_LEVEL = {
  id: OCEAN_FULL_COLUMN_LEVEL_ID,
  order: -1,
  zone: 'Full column dive',
  depthRange: 'Surface to 10,994 m',
  depthBoundaryTop: 'Surface',
  depthBoundaryBottom: '10,994 m',
  depthM: 5500,
  creature: 'All pelagic zones',
  sessionTitle: 'Ocean • Full column dive',
  iconKey: 'oceanTrench',
  accentToken: 'hmAppBlue',
  gradientDepth: { start: 0, end: 1 },
};

export const OCEAN_DEPTH_LEVELS = [
  {
    id: 'epipelagic',
    order: 0,
    zone: 'Epipelagic Zone',
    depthRange: 'Surface to 200 m',
    depthBoundaryTop: 'Surface',
    depthBoundaryBottom: '200 m',
    depthM: 70,
    creature: 'Whale Shark',
    sessionTitle: 'Ocean • Epipelagic Zone',
    iconKey: 'oceanSunlit',
    accentToken: 'hmAppGreen',
    gradientDepth: { start: 0, end: 0.34 },
  },
  {
    id: 'mesopelagic',
    order: 1,
    zone: 'Mesopelagic Zone',
    depthRange: '200 m to 1,000 m',
    depthBoundaryTop: '200 m',
    depthBoundaryBottom: '1,000 m',
    depthM: 946,
    creature: 'Giant Squid',
    sessionTitle: 'Ocean • Mesopelagic Zone',
    iconKey: 'oceanTwilight',
    accentToken: 'hmAppBlue',
    gradientDepth: { start: 0.12, end: 0.5 },
  },
  {
    id: 'bathypelagic',
    order: 2,
    zone: 'Bathypelagic Zone',
    depthRange: '1,000 m to 4,000 m',
    depthBoundaryTop: '1,000 m',
    depthBoundaryBottom: '4,000 m',
    depthM: 3800,
    creature: 'RMS Titanic',
    sessionTitle: 'Ocean • Bathypelagic Zone',
    iconKey: 'oceanAnchor',
    accentToken: 'hmBrandPurple',
    gradientDepth: { start: 0.26, end: 0.68 },
  },
  {
    id: 'abyssopelagic',
    order: 3,
    zone: 'Abyssopelagic Zone',
    depthRange: '4,000 m to 6,000 m',
    depthBoundaryTop: '4,000 m',
    depthBoundaryBottom: '6,000 m',
    depthM: 4500,
    creature: 'Anglerfish',
    sessionTitle: 'Ocean • Abyssopelagic Zone',
    iconKey: 'oceanDeepFish',
    accentToken: 'hmDeepPurple',
    gradientDepth: { start: 0.4, end: 0.88 },
  },
  {
    id: 'hadal',
    order: 4,
    zone: 'Hadalpelagic Zone',
    depthRange: '6,000 m to 10,994 m',
    depthBoundaryTop: '6,000 m',
    depthBoundaryBottom: '10,994 m',
    depthM: 10994,
    creature: 'Challenger Deep',
    sessionTitle: 'Ocean • Hadalpelagic Zone',
    iconKey: 'oceanTrench',
    accentToken: 'hmBrandMagenta',
    gradientDepth: { start: 0.52, end: 1 },
  },
];

export const OCEAN_LEVEL_COUNT = OCEAN_DEPTH_LEVELS.length;

/** Drift / Swim / Dive tabs ↔ pelagic levels (matches My Shell Collection groups). */
export const OCEAN_DRIFT_LEVEL_IDS = ['epipelagic', 'mesopelagic'];
export const OCEAN_SWIM_LEVEL_IDS = ['bathypelagic', 'abyssopelagic'];
export const OCEAN_DIVE_LEVEL_IDS = ['hadal', OCEAN_FULL_COLUMN_LEVEL_ID];

/**
 * Sequential unlock order on The Ocean Dive list (Epipelagic → … → Full column).
 * Index 0 is unlocked by default; completing a dive unlocks the next index.
 */
export const OCEAN_LEVEL_UNLOCK_ORDER = [
  'epipelagic',
  'mesopelagic',
  'bathypelagic',
  'abyssopelagic',
  'hadal',
  OCEAN_FULL_COLUMN_LEVEL_ID,
];

export const OCEAN_LEVEL_UNLOCK_COUNT = OCEAN_LEVEL_UNLOCK_ORDER.length;

/**
 * @param {string} levelId
 * @returns {number} 0 … OCEAN_LEVEL_UNLOCK_COUNT - 1
 */
export function getOceanLevelUnlockIndex(levelId) {
  const i = OCEAN_LEVEL_UNLOCK_ORDER.indexOf(levelId);
  return i >= 0 ? i : 0;
}

/**
 * @param {string} levelId
 * @returns {'drift' | 'swim' | 'dive'}
 */
export function getOceanLevelGroupId(levelId) {
  if (OCEAN_DRIFT_LEVEL_IDS.includes(levelId)) return 'drift';
  if (OCEAN_SWIM_LEVEL_IDS.includes(levelId)) return 'swim';
  if (OCEAN_DIVE_LEVEL_IDS.includes(levelId)) return 'dive';
  return 'drift';
}

/**
 * When switching Drift/Swim/Dive: keep the current zone if it belongs to that group; otherwise use the first zone in the group.
 * @param {'drift' | 'swim' | 'dive'} groupId
 * @param {string} currentLevelId
 */
export function resolveLevelIdForGroup(groupId, currentLevelId) {
  const ids =
    groupId === 'drift'
      ? OCEAN_DRIFT_LEVEL_IDS
      : groupId === 'swim'
        ? OCEAN_SWIM_LEVEL_IDS
        : OCEAN_DIVE_LEVEL_IDS;
  if (ids.includes(currentLevelId)) return currentLevelId;
  return ids[0];
}

export function getOceanLevelById(id) {
  if (id === OCEAN_FULL_COLUMN_LEVEL_ID) return FULL_OCEAN_COLUMN_LEVEL;
  return OCEAN_DEPTH_LEVELS.find((l) => l.id === id) ?? OCEAN_DEPTH_LEVELS[0];
}

/** 0–1: position on backdrop from linear depth map (min m … max m over image height) */
export function depthMToBackdropScrollFraction(depthM) {
  const lo = OCEAN_BACKDROP_DEPTH_MIN_M;
  const hi = OCEAN_BACKDROP_DEPTH_MAX_M;
  const span = hi - lo;
  const d = Math.min(hi, Math.max(lo, depthM));
  return (d - lo) / span;
}

/** Depth (m) at progress p ∈ [0,1] within a level’s zone span */
export function depthAtProgress(level, progress) {
  const ranges = [
    [0, 200],
    [200, 1000],
    [1000, 4000],
    [4000, 6000],
    [6000, 10994],
  ];
  const [lo, hi] = ranges[level.order] ?? [0, 200];
  return Math.round(lo + (hi - lo) * Math.min(1, Math.max(0, progress)));
}

/**
 * Per-pelagic-zone collectibles: 3 shells + 3 pearls × 5 zones = 15 + 15.
 * Level unlock: complete all shells and pearls in zone N before zone N+1 opens.
 */
import { OCEAN_FULL_COLUMN_LEVEL_ID, OCEAN_LEVEL_UNLOCK_COUNT } from './oceanDepthLevels';
import { getShellById } from './seaShells';

/** Five depth layers (matches `OCEAN_DEPTH_LEVELS` pelagic ids, excludes full column). */
export const OCEAN_COLLECTIBLE_ZONE_ORDER = [
  'epipelagic',
  'mesopelagic',
  'bathypelagic',
  'abyssopelagic',
  'hadal',
];

/**
 * Shell ids per zone — subset of `SHELLS` in seaShells.js
 * @type {Record<string, string[]>}
 */
export const OCEAN_ZONE_SHELL_IDS = {
  epipelagic: ['cowrie', 'scallop', 'conch-pink'],
  mesopelagic: ['moon-snail', 'murex', 'nautilus'],
  bathypelagic: ['triton', 'sundial', 'wentletrap'],
  abyssopelagic: ['glory-of-sea', 'junonia', 'angel-wing'],
  hadal: ['paper-nautilus', 'slit-shell', 'golden-helmet'],
};

/**
 * @typedef {{ id: string; zoneId: string; name: string; emoji: string; funFact: string }} OceanPearl
 */

/** @type {OceanPearl[]} */
export const PEARLS = [
  {
    id: 'pearl-epi-sun',
    zoneId: 'epipelagic',
    name: 'Sunlit Pearl',
    emoji: '⚪',
    funFact: 'Formed in the sunlit shallows where light dances through the waves.',
  },
  {
    id: 'pearl-epi-dawn',
    zoneId: 'epipelagic',
    name: 'Dawn Pearl',
    emoji: '🔮',
    funFact: 'Catches the first blush of morning light above the reef.',
  },
  {
    id: 'pearl-epi-surf',
    zoneId: 'epipelagic',
    name: 'Surf Pearl',
    emoji: '💠',
    funFact: 'Tumbled gently in the foam where the ocean meets the sky.',
  },
  {
    id: 'pearl-meso-twilight',
    zoneId: 'mesopelagic',
    name: 'Twilight Pearl',
    emoji: '⚪',
    funFact: 'Glows softly in the dim blue of the mesopelagic twilight.',
  },
  {
    id: 'pearl-meso-azure',
    zoneId: 'mesopelagic',
    name: 'Azure Pearl',
    emoji: '🔷',
    funFact: 'Holds the color of deep afternoon water far from shore.',
  },
  {
    id: 'pearl-meso-moon',
    zoneId: 'mesopelagic',
    name: 'Moonlit Pearl',
    emoji: '🌙',
    funFact: 'Said to brighten when bioluminescence stirs below.',
  },
  {
    id: 'pearl-bathy-storm',
    zoneId: 'bathypelagic',
    name: 'Storm Pearl',
    emoji: '⚫',
    funFact: 'Dense layers give it a weight like distant thunder.',
  },
  {
    id: 'pearl-bathy-violet',
    zoneId: 'bathypelagic',
    name: 'Violet Pearl',
    emoji: '🟣',
    funFact: 'Rare purple luster from minerals in the bathypelagic cold.',
  },
  {
    id: 'pearl-bathy-abyss',
    zoneId: 'bathypelagic',
    name: 'Abyss Pearl',
    emoji: '🔮',
    funFact: 'Forms slowly under crushing quiet far below the last rays.',
  },
  {
    id: 'pearl-abysso-void',
    zoneId: 'abyssopelagic',
    name: 'Void Pearl',
    emoji: '⚫',
    funFact: 'So dark it seems to drink the light around it.',
  },
  {
    id: 'pearl-abysso-ember',
    zoneId: 'abyssopelagic',
    name: 'Ember Pearl',
    emoji: '🔴',
    funFact: 'A faint inner warmth, like a coal in the deep.',
  },
  {
    id: 'pearl-abysso-shadow',
    zoneId: 'abyssopelagic',
    name: 'Shadow Pearl',
    emoji: '🖤',
    funFact: 'Perfectly matte until tilted — then a thread of silver appears.',
  },
  {
    id: 'pearl-hadal-trench',
    zoneId: 'hadal',
    name: 'Trench Pearl',
    emoji: '⚪',
    funFact: 'Forged in pressures that would crush ordinary shell and bone.',
  },
  {
    id: 'pearl-hadal-challenger',
    zoneId: 'hadal',
    name: 'Challenger Pearl',
    emoji: '💎',
    funFact: 'Named for the spirit of descent into the deepest places on Earth.',
  },
  {
    id: 'pearl-hadal-phantom',
    zoneId: 'hadal',
    name: 'Phantom Pearl',
    emoji: '👻',
    funFact: 'Almost invisible in water — a ghost of nacre in the hadal dark.',
  },
];

/** @type {Record<string, string[]>} */
export const OCEAN_ZONE_PEARL_IDS = OCEAN_COLLECTIBLE_ZONE_ORDER.reduce((acc, z) => {
  acc[z] = PEARLS.filter((p) => p.zoneId === z).map((p) => p.id);
  return acc;
}, {});

export const ALL_OCEAN_COLLECTIBLE_SHELL_IDS = OCEAN_COLLECTIBLE_ZONE_ORDER.flatMap(
  (z) => OCEAN_ZONE_SHELL_IDS[z] ?? []
);
export const ALL_OCEAN_COLLECTIBLE_PEARL_IDS = PEARLS.map((p) => p.id);

/**
 * @param {string} id
 * @returns {OceanPearl | null}
 */
export function getPearlById(id) {
  return PEARLS.find((p) => p.id === id) ?? null;
}

/**
 * @param {string} zoneId
 * @returns {OceanPearl[]}
 */
export function getPearlsForZone(zoneId) {
  return PEARLS.filter((p) => p.zoneId === zoneId);
}

/**
 * @param {string | undefined} oceanLevelId
 * @returns {string | 'all'} Collectible zone id, or 'all' for full-column dive.
 */
export function oceanLevelIdToCollectibleZone(oceanLevelId) {
  if (!oceanLevelId || oceanLevelId === OCEAN_FULL_COLUMN_LEVEL_ID) return 'all';
  if (OCEAN_COLLECTIBLE_ZONE_ORDER.includes(oceanLevelId)) return oceanLevelId;
  return 'epipelagic';
}

/**
 * @param {string} zoneId
 * @param {Set<string> | string[]} shellIds
 * @param {Set<string> | string[]} pearlIds
 */
export function isOceanZoneComplete(zoneId, shellIds, pearlIds) {
  const shells = OCEAN_ZONE_SHELL_IDS[zoneId];
  const pearls = OCEAN_ZONE_PEARL_IDS[zoneId];
  if (!shells?.length || !pearls?.length) return false;
  const s = shellIds instanceof Set ? shellIds : new Set(shellIds);
  const p = pearlIds instanceof Set ? pearlIds : new Set(pearlIds);
  return shells.every((id) => s.has(id)) && pearls.every((id) => p.has(id));
}

/**
 * Highest playable index in `OCEAN_LEVEL_UNLOCK_ORDER` from leading completed zones.
 * Index 0 always playable; index k unlocks when zones 0…k−1 are each complete (3 shells + 3 pearls).
 * @param {string[]} shellCollectionIds
 * @param {string[]} pearlCollectionIds
 * @returns {number} 0 … OCEAN_LEVEL_UNLOCK_COUNT - 1
 */
export function computeOceanMaxUnlockedLevelIndex(shellCollectionIds, pearlCollectionIds) {
  const s = new Set(Array.isArray(shellCollectionIds) ? shellCollectionIds : []);
  const p = new Set(Array.isArray(pearlCollectionIds) ? pearlCollectionIds : []);
  let max = 0;
  for (let zi = 0; zi < OCEAN_COLLECTIBLE_ZONE_ORDER.length; zi++) {
    const zoneId = OCEAN_COLLECTIBLE_ZONE_ORDER[zi];
    if (isOceanZoneComplete(zoneId, s, p)) {
      max = zi + 1;
    } else {
      break;
    }
  }
  return Math.min(max, OCEAN_LEVEL_UNLOCK_COUNT - 1);
}

/**
 * Swim / Dive mode locks: Drift zones (epi+meso) complete → Swim; Bathy+Abbysso complete → Dive.
 * @param {string[]} shellCollectionIds
 * @param {string[]} pearlCollectionIds
 */
export function getOceanSwimDiveUnlockState(shellCollectionIds, pearlCollectionIds) {
  const s = new Set(Array.isArray(shellCollectionIds) ? shellCollectionIds : []);
  const p = new Set(Array.isArray(pearlCollectionIds) ? pearlCollectionIds : []);
  const done = (z) => isOceanZoneComplete(z, s, p);
  return {
    swimUnlocked: done('epipelagic') && done('mesopelagic'),
    diveUnlocked: done('bathypelagic') && done('abyssopelagic'),
  };
}

/**
 * Weighted pick for session spawns — shell or pearl from the active zone pool only.
 * @param {string | undefined} oceanLevelId
 * @returns {{ kind: 'shell'; item: ReturnType<typeof getShellById> } | { kind: 'pearl'; item: OceanPearl }}
 */
export function pickRandomZoneCollectible(oceanLevelId) {
  const zone = oceanLevelIdToCollectibleZone(oceanLevelId);
  const pickShellId = (ids) => ids[Math.floor(Math.random() * ids.length)];
  const pickPearlId = (ids) => ids[Math.floor(Math.random() * ids.length)];

  if (zone === 'all') {
    const usePearl = Math.random() < 0.5;
    if (usePearl) {
      const id = pickPearlId(ALL_OCEAN_COLLECTIBLE_PEARL_IDS);
      const item = getPearlById(id);
      return item ? { kind: 'pearl', item } : pickRandomZoneCollectible('hadal');
    }
    const id = pickShellId(ALL_OCEAN_COLLECTIBLE_SHELL_IDS);
    return { kind: 'shell', item: getShellById(id) };
  }

  const shellIds = OCEAN_ZONE_SHELL_IDS[zone];
  const pearlIds = OCEAN_ZONE_PEARL_IDS[zone];
  if (!shellIds?.length || !pearlIds?.length) {
    return { kind: 'shell', item: getShellById('cowrie') };
  }
  if (Math.random() < 0.5) {
    const id = pickShellId(shellIds);
    return { kind: 'shell', item: getShellById(id) };
  }
  const pid = pickPearlId(pearlIds);
  const pearl = getPearlById(pid);
  return pearl ? { kind: 'pearl', item: pearl } : { kind: 'shell', item: getShellById(shellIds[0]) };
}

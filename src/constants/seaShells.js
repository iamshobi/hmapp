/**
 * Sea shell collection model (aligned with design spec).
 * @typedef {'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'} RarityTier
 */

/** @type {Record<string, RarityTier>} */
export const RARITY_TIER = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
};

/** My Shell Collection gallery only lists these tiers (not common / uncommon). */
export const SHELL_COLLECTION_DISPLAY_TIERS = new Set(['rare', 'epic', 'legendary']);

/**
 * @param {Shell[]} shells
 * @returns {Shell[]}
 */
export function filterShellsForCollectionDisplay(shells) {
  return shells.filter((s) => SHELL_COLLECTION_DISPLAY_TIERS.has(s.rarity));
}

/**
 * @typedef {{ id: string; name: string; emoji: string; rarity: RarityTier; depthRange: [number, number]; funFact: string }} Shell
 */

/** @type {Shell[]} */
export const SHELLS = [
  // Common (0-20m) — Surface Zone
  { id: 'cowrie', name: 'Golden Cowrie', emoji: '🐚', rarity: 'common', depthRange: [0, 20], funFact: 'Once used as currency across Africa and Asia for over 700 years.' },
  { id: 'scallop', name: "Lion's Paw Scallop", emoji: '🦪', rarity: 'common', depthRange: [0, 20], funFact: 'Scallops have up to 200 tiny eyes lining their shells.' },
  { id: 'conch-pink', name: 'Pink Conch', emoji: '🐚', rarity: 'common', depthRange: [0, 20], funFact: 'It takes a queen conch about 5 years to grow to full size.' },
  { id: 'moon-snail', name: 'Moon Snail', emoji: '🌙', rarity: 'common', depthRange: [0, 20], funFact: 'Moon snails drill perfect round holes in other shells to eat the animal inside.' },
  { id: 'tulip', name: 'Banded Tulip', emoji: '🌷', rarity: 'common', depthRange: [5, 20], funFact: 'Named for its beautiful flower-like spiral pattern.' },

  // Uncommon (20-50m) — Twilight Reef
  { id: 'murex', name: 'Venus Comb Murex', emoji: '✨', rarity: 'uncommon', depthRange: [20, 50], funFact: "Has over 100 delicate spines — one of nature's most elaborate shells." },
  { id: 'nautilus', name: 'Chambered Nautilus', emoji: '🔄', rarity: 'uncommon', depthRange: [20, 50], funFact: 'A living fossil unchanged for 500 million years.' },
  { id: 'triton', name: "Triton's Trumpet", emoji: '📯', rarity: 'uncommon', depthRange: [20, 50], funFact: 'Can grow over 50cm — the sound when blown can be heard for miles.' },
  { id: 'sundial', name: 'Sundial Shell', emoji: '☀️', rarity: 'uncommon', depthRange: [25, 50], funFact: 'Its perfect spiral follows the golden ratio found in galaxies.' },
  { id: 'wentletrap', name: 'Precious Wentletrap', emoji: '🌀', rarity: 'uncommon', depthRange: [20, 45], funFact: 'Once so rare that Chinese artisans made forgeries from rice paste.' },

  // Rare (50-100m) — Deep Blue
  { id: 'glory-of-sea', name: 'Glory of the Sea Cone', emoji: '👑', rarity: 'rare', depthRange: [50, 100], funFact: 'Was the rarest shell in the world for 200 years — only 6 specimens existed.' },
  { id: 'junonia', name: 'Junonia', emoji: '🔵', rarity: 'rare', depthRange: [50, 100], funFact: 'Finding one on a beach is considered a once-in-a-lifetime event.' },
  { id: 'angel-wing', name: 'Angel Wing', emoji: '🕊️', rarity: 'rare', depthRange: [50, 80], funFact: "So thin it's almost translucent — like a wing made of porcelain." },
  { id: 'paper-nautilus', name: 'Paper Nautilus', emoji: '📜', rarity: 'rare', depthRange: [60, 100], funFact: "Not a true shell — it's an egg case crafted by an octopus." },
  { id: 'slit-shell', name: 'Emperor Slit Shell', emoji: '🏛️', rarity: 'rare', depthRange: [70, 100], funFact: 'One of the most valuable shells — a single specimen sold for $65,000.' },

  // Epic (100-150m) — Twilight Zone
  { id: 'conus-gloriamaris', name: 'Conus Gloriamaris', emoji: '⭐', rarity: 'epic', depthRange: [100, 150], funFact: 'A collector once burned a duplicate to keep his specimen the rarest.' },
  { id: 'deep-murex', name: 'Abyssal Murex', emoji: '🔮', rarity: 'epic', depthRange: [100, 150], funFact: 'Produces a bio-luminescent mucus that glows in the deep ocean.' },
  { id: 'golden-helmet', name: 'Golden Helmet', emoji: '⚜️', rarity: 'epic', depthRange: [110, 150], funFact: 'The largest helmet shell — warriors once used them as actual helmets.' },

  // Legendary (150m+) — The Abyss
  { id: 'heart-of-ocean', name: 'Heart of the Ocean', emoji: '💎', rarity: 'legendary', depthRange: [150, 200], funFact: 'A mythical bioluminescent shell said to pulse in rhythm with the tides.' },
  { id: 'leviathan-spiral', name: "Leviathan's Spiral", emoji: '🌊', rarity: 'legendary', depthRange: [180, 200], funFact: 'Found only in the deepest trenches — its iridescence contains every color.' },
];

/**
 * My Shell Collection — aligned with Ocean Dive tabs / pelagic levels:
 * Drift = Epipelagic + Mesopelagic, Swim = Bathypelagic + Abyssopelagic, Dive = Hadalpelagic + Full column.
 * @type {Array<{ id: 'drift' | 'swim' | 'dive'; title: string; zoneSubtitle: string; shellIds: string[] }>}
 */
export const SHELL_COLLECTION_GROUPS = [
  {
    id: 'drift',
    title: 'Drift',
    zoneSubtitle: 'Epipelagic · Mesopelagic',
    shellIds: [
      'cowrie',
      'scallop',
      'conch-pink',
      'moon-snail',
      'tulip',
      'murex',
      'nautilus',
      'triton',
      'sundial',
      'wentletrap',
    ],
  },
  {
    id: 'swim',
    title: 'Swim',
    zoneSubtitle: 'Bathypelagic · Abyssopelagic',
    shellIds: ['glory-of-sea', 'junonia', 'angel-wing', 'paper-nautilus', 'slit-shell'],
  },
  {
    id: 'dive',
    title: 'Dive',
    zoneSubtitle: 'Hadalpelagic · Full column dive',
    shellIds: ['conus-gloriamaris', 'deep-murex', 'golden-helmet', 'heart-of-ocean', 'leviathan-spiral'],
  },
];

/**
 * @param {'drift' | 'swim' | 'dive'} groupId
 * @returns {Shell[]}
 */
export function getShellsForCollectionGroup(groupId) {
  const g = SHELL_COLLECTION_GROUPS.find((x) => x.id === groupId);
  if (!g) return [];
  return g.shellIds
    .map((id) => SHELLS.find((s) => s.id === id))
    .filter(Boolean);
}

/**
 * Collection mode → Ocean Tide level ids (same pelagic split as Drift / Swim / Dive tabs).
 * @type {Record<'drift' | 'swim' | 'dive', string[]>}
 */
export const SHELL_GROUP_TO_OCEAN_LEVEL_IDS = {
  drift: ['epipelagic', 'mesopelagic'],
  swim: ['bathypelagic', 'abyssopelagic'],
  dive: ['hadal', 'fullColumn'],
};

/**
 * Where to play in the ocean to find shells from this collection tier (Drift / Swim / Dive).
 * @param {string} shellId
 * @returns {{ groupId: string; modeLabel: string; zoneSubtitle: string; oceanLevelIds: string[] } | null}
 */
export function getShellCollectionGroupMeta(shellId) {
  const g = SHELL_COLLECTION_GROUPS.find((x) => x.shellIds.includes(shellId));
  if (!g) return null;
  const oceanLevelIds = SHELL_GROUP_TO_OCEAN_LEVEL_IDS[g.id];
  if (!oceanLevelIds) return null;
  return {
    groupId: g.id,
    modeLabel: g.title,
    zoneSubtitle: g.zoneSubtitle ?? '',
    oceanLevelIds,
  };
}

/**
 * True when every shell id in the collection group is present in collectedIds.
 * @param {'drift' | 'swim' | 'dive'} groupId
 * @param {string[]} collectedIds
 */
export function isShellGroupFullyCollected(groupId, collectedIds) {
  const g = SHELL_COLLECTION_GROUPS.find((x) => x.id === groupId);
  if (!g || g.shellIds.length === 0) return false;
  const set = new Set(Array.isArray(collectedIds) ? collectedIds : []);
  return g.shellIds.every((id) => set.has(id));
}

/** React Native–friendly styling (web used CSS variables / Tailwind classes). */
export const RARITY_CONFIG = {
  common: { label: 'Common', pillBg: 'rgba(140, 190, 220, 0.35)', pillBorder: 'rgba(200, 230, 255, 0.45)' },
  uncommon: { label: 'Uncommon', pillBg: 'rgba(100, 200, 160, 0.30)', pillBorder: 'rgba(160, 235, 200, 0.45)' },
  rare: { label: 'Rare', pillBg: 'rgba(130, 150, 255, 0.32)', pillBorder: 'rgba(180, 190, 255, 0.5)' },
  epic: { label: 'Epic', pillBg: 'rgba(220, 140, 255, 0.28)', pillBorder: 'rgba(240, 190, 255, 0.5)' },
  legendary: { label: 'Legendary', pillBg: 'rgba(255, 200, 120, 0.30)', pillBorder: 'rgba(255, 230, 180, 0.55)' },
};

/** @type {Array<{ name: string; range: [number, number]; rarity: RarityTier }>} */
export const DEPTH_ZONES = [
  { name: 'Sunlit Shallows', range: [0, 20], rarity: 'common' },
  { name: 'Twilight Reef', range: [20, 50], rarity: 'uncommon' },
  { name: 'Deep Blue', range: [50, 100], rarity: 'rare' },
  { name: 'Twilight Zone', range: [100, 150], rarity: 'epic' },
  { name: 'The Abyss', range: [150, 200], rarity: 'legendary' },
];

/**
 * Shell catalog depth is 0–200 m. Map full-ocean session depth onto this band so deeper dives still draw legendary pool.
 * @param {number} depthM
 */
export function effectiveShellDepthM(depthM) {
  const d = Number.isFinite(depthM) ? depthM : 0;
  if (d <= 200) return Math.max(0, d);
  // Map [200, 10994] → (200, 200] effectively capped at max shell band
  return 200;
}

/**
 * @param {number} depth
 * @returns {Shell[]}
 */
export function getShellsForDepth(depth) {
  const d = effectiveShellDepthM(depth);
  return SHELLS.filter((s) => d >= s.depthRange[0] && d <= s.depthRange[1]);
}

/**
 * @param {number} depth
 */
export function getDepthZone(depth) {
  const d = effectiveShellDepthM(depth);
  return DEPTH_ZONES.find((z) => d >= z.range[0] && d < z.range[1]) ?? DEPTH_ZONES[DEPTH_ZONES.length - 1];
}

/** Legacy session ids from earlier app versions → canonical hyphen ids */
const LEGACY_SHELL_IDS = {
  moon_snail: 'moon-snail',
  conch: 'conch-pink',
};

/**
 * @param {string} id
 * @returns {Shell}
 */
export function getShellById(id) {
  const canonical = LEGACY_SHELL_IDS[id] ?? id;
  return SHELLS.find((s) => s.id === canonical) ?? SHELLS.find((s) => s.id === 'moon-snail') ?? SHELLS[0];
}

/** @deprecated alias */
export const getSeaShellById = getShellById;

/**
 * Weighted pick: prefer rarer shells slightly less often within the eligible depth pool.
 * @param {number} depthM
 * @returns {Shell}
 */
export function pickShellAtDepth(depthM) {
  const pool = getShellsForDepth(depthM);
  if (pool.length === 0) {
    const zone = getDepthZone(depthM);
    const fallback = SHELLS.filter((s) => s.rarity === zone.rarity);
    if (fallback.length) return fallback[Math.floor(Math.random() * fallback.length)];
    return SHELLS[SHELLS.length - 1];
  }
  const weights = { common: 5, uncommon: 4, rare: 3, epic: 2, legendary: 1 };
  let total = 0;
  const w = pool.map((s) => {
    const wi = weights[s.rarity] ?? 3;
    total += wi;
    return wi;
  });
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= w[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** @deprecated — use pickShellAtDepth */
export function pickWeightedShell() {
  return pickShellAtDepth(10);
}

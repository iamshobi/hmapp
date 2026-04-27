/**
 * Play hub: themes → games → stack screen (e.g. SacredGeometry).
 * Ocean skips the games list — PlayThemes navigates straight to OceanLevelDetail.
 */

export const PLAY_THEMES = [
  {
    id: 'universe',
    title: 'Universe',
    blurb: 'Stars, space, and sacred patterns',
    emoji: '🌌',
  },
  {
    id: 'sky',
    title: 'Sky',
    blurb: 'Light, clouds, and open air',
    emoji: '☁️',
  },
  {
    id: 'ocean',
    title: 'Ocean',
    blurb: 'Depth, waves, and steady rhythm',
    emoji: '🌊',
  },
  {
    id: 'forest',
    title: 'Forest',
    blurb: 'Trees, shade, and grounding',
    emoji: '🌲',
  },
  {
    id: 'mountain',
    title: 'Mountain',
    blurb: 'Height, stillness, and clarity',
    emoji: '⛰️',
  },
];

/**
 * @typedef {{ id: string, title: string, subtitle?: string, screen?: string, comingSoon?: boolean }} PlayGameItem
 */

/** @type {Record<string, PlayGameItem[]>} */
export const GAMES_BY_THEME_ID = {
  universe: [
    {
      id: 'sacred-geometry',
      title: 'The Sacred Geometry',
      subtitle: 'Spiritual geometry — breath and sacred patterns',
      screen: 'SacredGeometry',
    },
  ],
  sky: [
    { id: 'sky-drift', title: 'Cloud Drift', subtitle: 'Gentle breath pacing', comingSoon: true },
  ],
  forest: [
    { id: 'canopy', title: 'Canopy Calm', subtitle: 'Grounding rhythm', comingSoon: true },
  ],
  mountain: [
    { id: 'summit', title: 'Summit Focus', subtitle: 'Steady coherence', comingSoon: true },
  ],
};

export function getThemeById(themeId) {
  return PLAY_THEMES.find((t) => t.id === themeId) ?? null;
}

export function getGamesForTheme(themeId) {
  return GAMES_BY_THEME_ID[themeId] ?? [];
}

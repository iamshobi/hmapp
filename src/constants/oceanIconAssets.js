/**
 * Minimal vector ocean icons (`OceanMinimalIcon`). Keys only — no raster assets.
 */

export const OCEAN_MINIMAL_ICON_KEYS = new Set([
  'oceanSunlit',
  'oceanTwilight',
  'oceanJellyBloom',
  'oceanAnchor',
  'oceanDeepFish',
  'oceanTrench',
  'oceanWave',
  'oceanShell',
  'oceanPearl',
  'oceanCompass',
  'oceanWheel',
  'oceanBuoy',
  'oceanFin',
  'oceanKnot',
]);

export function isOceanMinimalIconKey(iconKey) {
  return typeof iconKey === 'string' && OCEAN_MINIMAL_ICON_KEYS.has(iconKey);
}

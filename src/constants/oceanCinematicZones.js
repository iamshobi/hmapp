/**
 * Cinematic zone copy/tint metadata used by the in-session ocean overlay.
 */
export const OCEAN_CINEMATIC_ZONES = [
  {
    id: 'epipelagic',
    label: 'EPIPELAGIC',
    startM: 0,
    endM: 200,
    desc: 'Light penetrates fully',
    textColor: '#9DDBF5',
    bgColor: '#062540',
  },
  {
    id: 'mesopelagic',
    label: 'MESOPELAGIC',
    startM: 200,
    endM: 1000,
    desc: 'Faint, dim twilight',
    textColor: '#6FB8D8',
    bgColor: '#031A2C',
  },
  {
    id: 'bathypelagic',
    label: 'BATHYPELAGIC',
    startM: 1000,
    endM: 4000,
    desc: 'Complete darkness',
    textColor: '#4A7A9E',
    bgColor: '#01101E',
  },
  {
    id: 'abyssopelagic',
    label: 'ABYSSOPELAGIC',
    startM: 4000,
    endM: 6000,
    desc: 'Near-freezing abyssal plains',
    textColor: '#2E6070',
    bgColor: '#010810',
  },
  {
    id: 'hadal',
    label: 'HADALPELAGIC',
    startM: 6000,
    endM: 10994,
    desc: 'Ocean trenches · Mariana',
    textColor: '#1E4A60',
    bgColor: '#01050C',
  },
];

export function getCinematicZoneIndexByDepth(depthM = 0) {
  const d = Math.max(0, depthM);
  const idx = OCEAN_CINEMATIC_ZONES.findIndex((z) => d >= z.startM && d < z.endM);
  if (idx >= 0) return idx;
  return OCEAN_CINEMATIC_ZONES.length - 1;
}

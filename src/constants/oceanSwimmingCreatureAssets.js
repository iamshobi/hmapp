/**
 * Ocean creature registry — creature names used by OceanSwimmingCreatures.js.
 * Icons are now rendered as inline SVG silhouettes; no PNG files needed.
 *
 * Zone → creatures (matching pelagic zone descriptions):
 *   Epipelagic    0–200 m   : dolphin, sea-turtle, shark, jellyfish
 *   Mesopelagic  200–1 km   : lanternfish, squid, swordfish
 *   Bathypelagic  1–4 km    : anglerfish, viperfish, gulper-eel
 *   Abyssopelagic 4–6 km    : dumbo-octopus, basket-star, sea-pig
 *   Hadal         6–11 km   : isopod, sea-cucumber, xenophyophore
 */

export const CREATURE_NAMES = {
  epipelagic:    ['dolphin', 'sea-turtle', 'shark', 'jellyfish'],
  mesopelagic:   ['lanternfish', 'squid', 'swordfish'],
  bathypelagic:  ['anglerfish', 'viperfish', 'gulper-eel'],
  abyssopelagic: ['dumbo-octopus', 'basket-star', 'sea-pig'],
  hadal:         ['isopod', 'sea-cucumber', 'xenophyophore'],
};

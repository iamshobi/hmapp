/**
 * Pelagic zone educational copy — same as Breath Session (?) help modal.
 */

export const ZONE_INFO = {
  epipelagic: {
    title: 'Epipelagic Zone',
    subtitle: 'Sunlight Zone · 0 – 200 m (0 – 660 ft)',
    body: `This surface layer is also called the sunlight zone. It is in this zone that most of the visible light exists. With sunlight comes heat from the sun, which is responsible for wide variations in temperature — sea surface temperatures range from as high as 97°F (36°C) in the Persian Gulf to 28°F (−2°C) near the North Pole.

Wind keeps this layer mixed and allows the sun's heat to be distributed vertically. The base of this mixing layer is the beginning of a transition layer called the thermocline.

This zone supports 90% of all marine life through photosynthesis.`,
  },
  mesopelagic: {
    title: 'Mesopelagic Zone',
    subtitle: 'Twilight Zone · 200 – 1,000 m (660 – 3,300 ft)',
    body: `Below the epipelagic zone, sunlight this deep is very faint. The mesopelagic zone is sometimes referred to as the twilight zone or the midwater zone.

Temperature changes are the greatest in this zone because it contains the thermocline — a region where water temperature decreases rapidly with increasing depth. The thermocline is strongest in the tropics and becomes non-existent in the polar winter season.

Because of the lack of light, bioluminescence begins to appear on organisms in this zone. The eyes on deep-sea fishes are larger and generally upward-directed, to see silhouettes of other animals against the dim light above.`,
  },
  bathypelagic: {
    title: 'Bathypelagic Zone',
    subtitle: 'Midnight Zone · 1,000 – 4,000 m (3,300 – 13,100 ft)',
    body: `Due to its constant darkness, this zone is also called the midnight zone. The only light at this depth comes from the bioluminescence of the animals themselves.

The temperature never fluctuates far from a chilling 39°F (4°C). The pressure is extreme — at 4,000 meters it reaches over 5,850 pounds per square inch.

Yet sperm whales dive down to this level in search of food, and many remarkable creatures inhabit the darkness — anglerfish, viperfish, and gulper eels among them.`,
  },
  abyssopelagic: {
    title: 'Abyssopelagic Zone',
    subtitle: 'The Abyss · 4,000 – 6,000 m (13,100 – 19,700 ft)',
    body: `The pitch-black bottom layer of the ocean. The water temperature is constantly near freezing, and only a few creatures can be found at these crushing depths.

The name comes from the Greek word meaning "no bottom" — because early explorers thought the ocean was bottomless. Three-quarters of the area of the deep-ocean floor lies in this zone.

Basket stars, sea cucumbers, sea pigs, and tiny squids are among the rare life forms that have adapted to survive the near-freezing temperatures and extreme pressure.`,
  },
  hadal: {
    title: 'Hadalpelagic Zone',
    subtitle: 'The Trenches · 6,000 – 10,994 m (19,700 – 36,070 ft)',
    body: `The deepest zone of the ocean, extending to 10,994 meters (36,070 feet) in the Mariana Trench off the coast of Japan.

The temperature is constant, just above freezing. The weight of all the water overhead in the Mariana Trench is over 8 tons per square inch.

Even at the very bottom, life exists. In 2005, tiny single-celled organisms called foraminifera were discovered in the Challenger Deep trench. The deepest fish ever found, Abyssobrotula galatheae, was recorded in the Puerto Rico Trench at 8,372 meters (27,460 feet).`,
  },
  fullColumn: {
    title: 'Full Column Dive',
    subtitle: 'Surface to 10,994 m — all five pelagic zones',
    body: `This dive travels through all five ocean zones:

• Epipelagic (0–200 m) — the sunlit surface layer, home to 90% of marine life.

• Mesopelagic (200–1,000 m) — the twilight zone where bioluminescence begins and eyes grow large.

• Bathypelagic (1,000–4,000 m) — the midnight zone, pitch dark, constant 4°C.

• Abyssopelagic (4,000–6,000 m) — the abyss, near-freezing with crushing pressure.

• Hadalpelagic (6,000–10,994 m) — the deepest trenches on Earth, yet life persists.`,
  },
};

export function getOceanZoneInfo(levelId) {
  return ZONE_INFO[levelId] ?? ZONE_INFO.epipelagic;
}

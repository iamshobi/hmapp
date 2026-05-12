
export const SACRED_GEOMETRY_SYMBOLS = [
  { id: 'torus', title: 'Torus / Lotus of Life' },
  { id: 'flower', title: 'Flower of Life' },
  { id: 'tree', title: 'Tree of Life' },
  { id: 'sri', title: 'Sri Yantra' },
  { id: 'rosette', title: 'Six Petal Rosette' },
  { id: 'metatron', title: "Metatron's Cube" },
  { id: 'starOfDavid', title: 'Star of David' },
  { id: 'starTet', title: 'Star Tetrahedron (Merkaba)' },
  { id: 'vesica', title: 'Vesica Piscis' },
  { id: 'seed', title: 'Seed of Life' },
  { id: 'egg', title: 'Egg of Life' },
  { id: 'fruit', title: 'Fruit of Life' },
];

export const SACRED_SYMBOL_COUNT = SACRED_GEOMETRY_SYMBOLS.length;


export function getRewardSymbolIndexForTitle(title) {
  const t = (title || '').trim();
  const i = SACRED_GEOMETRY_SYMBOLS.findIndex((s) => s.title === t);
  return i >= 0 ? i : 0;
}

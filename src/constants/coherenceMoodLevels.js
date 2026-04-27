/** 5-step coherence → color + label (stressed red → excellent teal) */
export const COHERENCE_LEVELS = [
  { key: 'stressed', label: 'Stressed', color: '#E53935' },
  { key: 'low', label: 'Low', color: '#FB8C00' },
  { key: 'neutral', label: 'Neutral', color: '#42A5F5' },
  { key: 'good', label: 'Good', color: '#26C6DA' },
  { key: 'excellent', label: 'Excellent', color: '#00897B' },
];

export function levelForIndex(i) {
  return COHERENCE_LEVELS[Math.max(0, Math.min(4, i))] ?? COHERENCE_LEVELS[2];
}



/** @typedef {'Milestone' | 'Streak' | 'Performance'} BadgeCategory */

/**
 * @typedef {Object} HeartMathBadge
 * @property {string} id
 * @property {string} name
 * @property {string} subtitle
 * @property {BadgeCategory} category
 * @property {[string, string]} gradient
 * @property {string} glowColor
 * @property {string} iconKey
 * @property {string} description
 * @property {string} unlockCriteria
 * @property {string} triggerEvent
 * @property {string} keyMetric
 * @property {string} nextLevelName
 * @property {string} nextLevelCriteria
 * @property {number} nextProgress
 * @property {string} nextProgressLabel
 * @property {string} science
 * @property {string} scienceTitle
 * @property {'sessions' | 'streak'} unlockBy
 * @property {number} [minSessions]
 * @property {number} [minStreakDays]
 */

/** @type {HeartMathBadge[]} */
export const ALL_HEARTMATH_BADGES = [
  {
    id: 'first-heartbeat',
    name: 'First Heartbeat',
    subtitle: 'Your first step in heart coherence',
    category: 'Milestone',
    gradient: ['#F472B6', '#B02B72'],
    glowColor: '#B02B72',
    iconKey: 'Heart',
    description:
      'You took the most important step — you showed up for your heart. Every coherence master began exactly here.',
    unlockCriteria: 'Complete your first HeartMath session',
    triggerEvent: 'First Session Completed',
    keyMetric: '1 session · 1.7 avg coherence',
    nextLevelName: 'Resonance Seeker',
    nextLevelCriteria: 'Complete 5 HeartMath sessions to unlock Resonance Seeker',
    nextProgress: 20,
    nextProgressLabel: '1 of 5 sessions completed',
    science:
      'In your very first session, your vagus nerve begins receiving coherence signals from your heart. The heart–brain communication pathway activates within minutes, initiating measurable changes in your autonomic balance.',
    scienceTitle: 'The First Step',
    unlockBy: 'sessions',
    minSessions: 1,
  },
  {
    id: 'resonance-seeker',
    name: 'Resonance Seeker',
    subtitle: 'Building the coherence habit',
    category: 'Milestone',
    gradient: ['#38BDF8', '#0369A1'],
    glowColor: '#0369A1',
    iconKey: 'Activity',
    description:
      'Five sessions in, your nervous system is beginning to recognize HeartMath as a safe harbor. You are learning to seek resonance — and you are finding it.',
    unlockCriteria: 'Complete 5 HeartMath sessions',
    triggerEvent: '5-Session Milestone',
    keyMetric: '5 sessions · 2.1 avg coherence',
    nextLevelName: 'Coherence Builder',
    nextLevelCriteria: 'Complete 21 sessions to cross the habit threshold',
    nextProgress: 24,
    nextProgressLabel: '5 of 21 sessions completed',
    science:
      'After 5 sessions of heart coherence practice, research shows measurable reductions in salivary cortisol and improvements in mood states.',
    scienceTitle: 'Cortisol Regulation',
    unlockBy: 'sessions',
    minSessions: 5,
  },
  {
    id: 'coherence-builder',
    name: 'Coherence Builder',
    subtitle: '21-session habit crystallisation',
    category: 'Milestone',
    gradient: ['#A78BFA', '#7C3AED'],
    glowColor: '#7C3AED',
    iconKey: 'BarChart2',
    description:
      'Science confirms it — 21 sessions is where habits crystallise. Heart coherence is no longer something you do. It is who you are becoming.',
    unlockCriteria: 'Complete 21 HeartMath sessions',
    triggerEvent: 'Habit Formation Threshold',
    keyMetric: '21 sessions · 2.4 avg coherence',
    nextLevelName: 'Resilience Architect',
    nextLevelCriteria: 'Reach 50 sessions to build deep systemic resilience',
    nextProgress: 42,
    nextProgressLabel: '21 of 50 sessions completed',
    science:
      'At 21 repetitions, neural pathways for new behaviours become significantly more stable.',
    scienceTitle: 'Neural Pathway Formation',
    unlockBy: 'sessions',
    minSessions: 21,
  },
  {
    id: 'resilience-architect',
    name: 'Resilience Architect',
    subtitle: 'Deep nervous system resilience',
    category: 'Milestone',
    gradient: ['#34D399', '#059669'],
    glowColor: '#059669',
    iconKey: 'Shield',
    description:
      "Fifty sessions means you have actively rebuilt your stress architecture. You don't just recover from stress — you are building systems that prevent it from taking hold.",
    unlockCriteria: 'Complete 50 HeartMath sessions',
    triggerEvent: '50-Session Milestone',
    keyMetric: '50 sessions · 3.1 avg coherence',
    nextLevelName: 'Heart Master',
    nextLevelCriteria: 'Reach 100 sessions to enter the elite tier',
    nextProgress: 50,
    nextProgressLabel: '50 of 100 sessions completed',
    science:
      'Sustained coherence practice over 50 sessions has been linked to reduced systemic inflammation markers and improved emotional regulation.',
    scienceTitle: 'Systemic Resilience',
    unlockBy: 'sessions',
    minSessions: 50,
  },
  {
    id: 'heart-master',
    name: 'Heart Master',
    subtitle: '100-session elite practitioner',
    category: 'Milestone',
    gradient: ['#FBBF24', '#D97706'],
    glowColor: '#D97706',
    iconKey: 'Star',
    description:
      'One hundred sessions. You have spent real, intentional hours transforming your inner life. This is not a hobby — this is a practice.',
    unlockCriteria: 'Complete 100 HeartMath sessions',
    triggerEvent: '100-Session Elite Threshold',
    keyMetric: '100 sessions · 3.8 avg coherence',
    nextLevelName: 'Coherence Legend',
    nextLevelCriteria: 'Reach 365 sessions — one full year of daily practice',
    nextProgress: 27,
    nextProgressLabel: '100 of 365 sessions completed',
    science:
      'At 100 sessions, users demonstrate a statistically significant shift in baseline autonomic function.',
    scienceTitle: 'Elite Practitioner Biology',
    unlockBy: 'sessions',
    minSessions: 100,
  },
  {
    id: 'coherence-legend',
    name: 'Coherence Legend',
    subtitle: '365 days of daily practice',
    category: 'Milestone',
    gradient: ['#FB923C', '#9D174D'],
    glowColor: '#9D174D',
    iconKey: 'Award',
    description:
      'One year. Every day. Your heart coherence practice has woven itself into the fabric of who you are.',
    unlockCriteria: 'Complete 365 HeartMath sessions',
    triggerEvent: 'Full-Year Daily Practice',
    keyMetric: '365 sessions · 4.5+ avg coherence',
    nextLevelName: 'Lifetime Practitioner',
    nextLevelCriteria: 'You have reached the pinnacle. Inspire others on their journey.',
    nextProgress: 100,
    nextProgressLabel: 'Pinnacle achieved ✓',
    science:
      'After one year of sustained coherence practice, published HeartMath research documents lasting improvements in psychophysiological coherence.',
    scienceTitle: 'Longevity Science',
    unlockBy: 'sessions',
    minSessions: 365,
  },
  {
    id: 'streak-igniter',
    name: 'Streak Igniter',
    subtitle: '7 consecutive days',
    category: 'Streak',
    gradient: ['#FB923C', '#DC2626'],
    glowColor: '#DC2626',
    iconKey: 'Flame',
    description:
      'Seven days in a row. You have proven that this is not a phase — it is a commitment.',
    unlockCriteria: 'Maintain a 7-day practice streak',
    triggerEvent: '7-Day Consecutive Streak',
    keyMetric: '7 days · no sessions missed',
    nextLevelName: 'Momentum Maker',
    nextLevelCriteria: 'Extend your streak to 30 consecutive days',
    nextProgress: 23,
    nextProgressLabel: '7 of 30 days completed',
    science:
      'Reaching a 7-day streak activates reward circuitry that makes continued practice feel intrinsically motivated.',
    scienceTitle: 'Habit Loop Activation',
    unlockBy: 'streak',
    minStreakDays: 7,
  },
  {
    id: 'momentum-maker',
    name: 'Momentum Maker',
    subtitle: '30-day practice commitment',
    category: 'Streak',
    gradient: ['#FDE047', '#F59E0B'],
    glowColor: '#F59E0B',
    iconKey: 'Zap',
    description:
      'Thirty consecutive days. Practice transcends willpower and becomes identity.',
    unlockCriteria: 'Maintain a 30-day practice streak',
    triggerEvent: '30-Day Consecutive Streak',
    keyMetric: '30 days · momentum sustained',
    nextLevelName: 'Unstoppable',
    nextLevelCriteria: 'Reach 100 consecutive days to become unstoppable',
    nextProgress: 30,
    nextProgressLabel: '30 of 100 days completed',
    science:
      'At 30 days of daily practice, cortisol awakening response patterns show measurable normalisation.',
    scienceTitle: 'Circadian & HPA Regulation',
    unlockBy: 'streak',
    minStreakDays: 30,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    subtitle: '100-day legendary streak',
    category: 'Streak',
    gradient: ['#818CF8', '#4F46E5'],
    glowColor: '#4F46E5',
    iconKey: 'Target',
    description:
      'One hundred consecutive days. You have become the practice. This is what unstoppable looks like.',
    unlockCriteria: 'Maintain a 100-day practice streak',
    triggerEvent: '100-Day Legendary Streak',
    keyMetric: '100 days · zero breaks',
    nextLevelName: 'Eternal Flame',
    nextLevelCriteria: 'Reach 365 consecutive days for the ultimate streak badge',
    nextProgress: 27,
    nextProgressLabel: '100 of 365 days completed',
    science:
      'After 100 days of daily coherence practice, studies document measurable changes in amygdala reactivity and connectivity.',
    scienceTitle: 'Structural Neuroplasticity',
    unlockBy: 'streak',
    minStreakDays: 100,
  },
  {
    id: 'vagal-tone-pioneer',
    name: 'Vagal Tone Pioneer',
    subtitle: 'Peak parasympathetic resilience',
    category: 'Performance',
    gradient: ['#6EE7B7', '#0D9488'],
    glowColor: '#0D9488',
    iconKey: 'Asterisk',
    description:
      'You have demonstrated exceptional parasympathetic resilience during peak stress cycles.',
    unlockCriteria: 'Achieve 4.0+ coherence sustained for 5 minutes',
    triggerEvent: 'High Coherence Sustained',
    keyMetric: '4.0 coherence for 5:00m',
    nextLevelName: 'Autonomic Master',
    nextLevelCriteria: 'Maintain 4.5 coherence for a sustained 10-minute session',
    nextProgress: 60,
    nextProgressLabel: '3 of 5 required sessions completed',
    science:
      'Vagal tone reflects parasympathetic capacity — higher tone supports faster recovery after stress.',
    scienceTitle: 'Clinical Significance',
    unlockBy: 'sessions',
    minSessions: 15,
  },
  {
    id: 'stress-alchemist',
    name: 'Stress Alchemist',
    subtitle: 'Transforming stress into power',
    category: 'Performance',
    gradient: ['#F472B6', '#9D174D'],
    glowColor: '#9D174D',
    iconKey: 'RefreshCw',
    description:
      'You consistently reduce your stress score in session. You do not just manage stress — you transform it.',
    unlockCriteria: 'Reduce stress survey score by 5+ points in 5 consecutive sessions',
    triggerEvent: 'Consistent Stress Transformation',
    keyMetric: '5+ point stress drop · 5 sessions',
    nextLevelName: 'Autonomic Master',
    nextLevelCriteria: 'Maintain peak coherence across all three survey metrics',
    nextProgress: 40,
    nextProgressLabel: '2 of 5 qualifying sessions completed',
    science:
      'Consistently reducing subjective stress within a session demonstrates mastery of HRV biofeedback.',
    scienceTitle: 'Biofeedback Mastery',
    unlockBy: 'sessions',
    minSessions: 15,
  },
  {
    id: 'autonomic-master',
    name: 'Autonomic Master',
    subtitle: 'The highest coherence tier',
    category: 'Performance',
    gradient: ['#C084FC', '#732A87'],
    glowColor: '#732A87',
    iconKey: 'Gem',
    description:
      'This is the pinnacle. Coherence is your default — not your achievement. Welcome to the top tier of practitioners.',
    unlockCriteria: 'Complete 127+ sessions with sustained 4.5+ avg coherence',
    triggerEvent: 'Autonomic Mastery Protocol',
    keyMetric: '4.8 avg coherence · 127+ sessions',
    nextLevelName: 'Coherence Legend',
    nextLevelCriteria: 'Reach 365 sessions to complete the full year journey',
    nextProgress: 85,
    nextProgressLabel: '127 of 150 qualifying sessions completed',
    science:
      'Autonomic mastery represents a fundamental restructuring of baseline autonomic tone and stress response.',
    scienceTitle: 'Autonomic Mastery & Stress Immunity',
    unlockBy: 'sessions',
    minSessions: 127,
  },
];


export const BADGE_CATALOG = {
  Milestone: [
    'First Heartbeat',
    'Resonance Seeker',
    'Coherence Builder',
    'Resilience Architect',
    'Heart Master',
    'Coherence Legend',
  ],
  Streak: ['Streak Igniter', 'Momentum Maker', 'Unstoppable'],
  Performance: ['Vagal Tone Pioneer', 'Stress Alchemist', 'Autonomic Master'],
};


export const BADGE_SYSTEM_OVERVIEW = {
  title: 'Badge System',
  views: ['Gallery', 'Detail'],
  categories: ['Milestone', 'Streak', 'Performance'],
  behavior:
    'Users earn badges after completing sets of coherence sessions, hitting streak milestones, or achieving performance targets. The gallery shows their full collection (locked and unlocked). Tapping a badge opens detailed milestone data, next-level progress, and science context.',
};


export const BADGE_DESIGN_PRINCIPLES = [
  {
    key: 'hex-geometry',
    title: 'Hexagonal badge geometry',
    rationale:
      'Hexagons signal achievement in gaming and wellness culture and scale cleanly across sizes.',
  },
  {
    key: 'earned-gradient',
    title: 'Gradient glow = earned status',
    rationale:
      'Unlocked badges use gradient + glow; locked badges remain intentionally flat/grey.',
  },
  {
    key: 'category-tabs',
    title: 'Category filter tabs',
    rationale:
      'Milestone, Streak, and Performance tabs reduce scanning load; counts set expectations.',
  },
  {
    key: 'next-level-progress',
    title: 'Progress bar in Next Level section',
    rationale:
      "Showing 'X of Y' progress makes the next badge feel attainable and sustains momentum.",
  },
  {
    key: 'science-context',
    title: 'Science section per badge',
    rationale:
      "Every detail view includes science/clinical context so badges also educate and reinforce adherence.",
  },
  {
    key: 'visible-locked-state',
    title: 'Visible locked state = motivation',
    rationale:
      'Locked badges stay visible to create aspirational incompleteness and improve return behavior.',
  },
];

export const BADGE_CATEGORY_FILTERS = ['All', 'Milestone', 'Streak', 'Performance'];


export const BADGE_CATEGORIES = ['Milestone', 'Streak', 'Performance'];

/**
 * @type {Record<BadgeCategory, { bg: string; border: string; accent: string }>}
 */
export const GALLERY_CATEGORY_SUMMARY_STYLES = {
  Milestone: { bg: '#EDE9FE', border: 'rgba(124,58,237,0.22)', accent: '#7C3AED' },
  Streak: { bg: '#FFF7ED', border: 'rgba(234,88,12,0.22)', accent: '#EA580C' },
  Performance: { bg: '#F0FDF4', border: 'rgba(5,150,105,0.22)', accent: '#059669' },
};

/**
 * @param {Set<string>} unlockedIds
 * @returns {{ category: BadgeCategory; unlocked: number; total: number }[]}
 */
export function getPerCategorySummary(unlockedIds) {
  return BADGE_CATEGORIES.map((category) => {
    const inCat = ALL_HEARTMATH_BADGES.filter((b) => b.category === category);
    const unlocked = inCat.filter((b) => unlockedIds.has(b.id)).length;
    return { category, unlocked, total: inCat.length };
  });
}

export const CATEGORY_TAG_STYLES = {
  Milestone: { bg: 'rgba(167,139,250,0.22)', text: '#A78BFA' },
  Streak: { bg: 'rgba(251,146,60,0.22)', text: '#FB923C' },
  Performance: { bg: 'rgba(52,211,153,0.22)', text: '#34D399' },
};

/**
 * @param {number} totalSessions
 * @param {number} streakDays
 * @returns {Set<string>}
 */
export function getUnlockedBadgeIds(totalSessions, streakDays) {
  const s = Math.max(0, Math.floor(Number(totalSessions) || 0));
  const st = Math.max(0, Math.floor(Number(streakDays) || 0));
  const out = new Set();
  for (const b of ALL_HEARTMATH_BADGES) {
    if (b.unlockBy === 'streak') {
      if (st >= (b.minStreakDays ?? 9999)) out.add(b.id);
    } else {
      if (s >= (b.minSessions ?? 9999)) out.add(b.id);
    }
  }
  return out;
}

/** @typedef {'settle' | 'flow' | 'deep' | 'still'} BadgeJourneyState */

function normalizePreviewType(type) {
  if (!type) return null;
  const t = String(type);
  if (t === 'pro') return 'still';
  if (t === 'advanced') return 'deep';
  if (t === 'building') return 'settle';
  if (t === 'foundation') return 'settle';
  if (t === 'seed') return 'flow';
  if (t === 'habit') return 'deep';
  if (t === 'deepPractice') return 'still';
  return t;
}

function getPreviewSnapshot(type) {
  const t = normalizePreviewType(type);
  if (t === 'still') return { sessions: 35, streak: 10, points: 158, quality: 90 };
  if (t === 'deep') return { sessions: 18, streak: 6, points: 122, quality: 78 };
  if (t === 'flow') return { sessions: 8, streak: 4, points: 86, quality: 68 };
  if (t === 'settle') return { sessions: 3, streak: 2, points: 54, quality: 58 };
  if (t === 'firstTime') return { sessions: 1, streak: 1, points: 40, quality: 50 };
  if (t === 'zero') return { sessions: 0, streak: 0, points: 0, quality: 0 };
  return null;
}

function derivePerformanceQuality(lastSurveyResult, totalSessions) {
  const fallback = Math.min(96, Math.max(35, 40 + Math.floor((Number(totalSessions) || 0) * 1.5)));
  if (!lastSurveyResult || typeof lastSurveyResult !== 'object') return fallback;
  const pct = (before, after, kind) => {
    if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0) return null;
    const delta = kind === 'stress' ? before - after : after - before;
    return Math.max(0, Math.min(1, delta / before));
  };
  const stressPct = pct(lastSurveyResult.stressBefore, lastSurveyResult.stressAfter, 'stress');
  const energyPct = pct(lastSurveyResult.energyBefore, lastSurveyResult.energyAfter, 'energy');
  const moodPct = pct(lastSurveyResult.moodBefore, lastSurveyResult.moodAfter, 'mood');
  const values = [stressPct, energyPct, moodPct].filter((v) => Number.isFinite(v));
  if (!values.length) return fallback;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(40 + avg * 60);
}

/**
 * @param {number} sessions
 * @returns {BadgeJourneyState}
 */
export function getBadgeJourneyState(sessions) {
  const s = Math.max(0, Math.floor(Number(sessions) || 0));
  if (s >= 31) return 'still';
  if (s >= 11) return 'deep';
  if (s >= 6) return 'flow';
  return 'settle';
}

/**
 * @param {number} totalSessions
 * @param {number} streakDays
 * @param {{ previewType?: string | null, coherencePoints?: number, lastSurveyResult?: object | null }} [options]
 * @returns {{ state: BadgeJourneyState, metrics: { sessions: number, streak: number, points: number, quality: number }, unlockedIds: Set<string> }}
 */
export function getBadgeUiState(totalSessions, streakDays, options = {}) {
  const preview = getPreviewSnapshot(options.previewType);
  const sessions = preview ? preview.sessions : Math.max(0, Math.floor(Number(totalSessions) || 0));
  const streak = preview ? preview.streak : Math.max(0, Math.floor(Number(streakDays) || 0));
  const points = preview
    ? preview.points
    : Math.max(0, Math.floor(Number(options.coherencePoints) || 0));
  const quality = preview
    ? preview.quality
    : derivePerformanceQuality(options.lastSurveyResult, sessions);

  const state = getBadgeJourneyState(sessions);
  const unlockedIds = new Set();
  for (const b of ALL_HEARTMATH_BADGES) {
    if (b.category === 'Streak') {
      if (streak >= (b.minStreakDays ?? 9999)) unlockedIds.add(b.id);
      continue;
    }
    if (b.id === 'vagal-tone-pioneer') {
      if (sessions >= 15 || (quality >= 75 && points >= 80)) unlockedIds.add(b.id);
      continue;
    }
    if (b.id === 'stress-alchemist') {
      if (sessions >= 15 && quality >= 82 && points >= 110) unlockedIds.add(b.id);
      continue;
    }
    if (b.id === 'autonomic-master') {
      if (sessions >= 127 || (quality >= 92 && points >= 300 && streak >= 21)) unlockedIds.add(b.id);
      continue;
    }
    if (sessions >= (b.minSessions ?? 9999)) unlockedIds.add(b.id);
  }

  return { state, metrics: { sessions, streak, points, quality }, unlockedIds };
}

/**
 * @param {string} id
 * @returns {HeartMathBadge | undefined}
 */
export function getHeartMathBadgeById(id) {
  return ALL_HEARTMATH_BADGES.find((b) => b.id === id);
}

export function miniWaveCoherenceForBadge(badgeId) {
  if (badgeId === 'autonomic-master' || badgeId === 'vagal-tone-pioneer') return 4.5;
  if (badgeId === 'coherence-builder' || badgeId === 'resilience-architect') return 2.8;
  return 2;
}

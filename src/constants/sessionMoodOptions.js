/**
 * `trackColor` — mood wheel palette for My Progress mood tracker **week / month / year** grids only
 * (Trend · Insights and session mood modal stay separate).
 */
export const SESSION_MOOD_OPTIONS = [
  { id: 'excited', label: 'Excited', emoji: '🤩', calendarLevel: 4, trackColor: '#FF9800' },
  { id: 'anxious', label: 'Anxious', emoji: '😟', calendarLevel: 1, trackColor: '#D81B60' },
  { id: 'angry', label: 'Angry', emoji: '😠', calendarLevel: 0, trackColor: '#E53935' },
  { id: 'happy', label: 'Happy', emoji: '🙂', calendarLevel: 3, trackColor: '#FFC107' },
  { id: 'peaceful', label: 'Peaceful', emoji: '😌', calendarLevel: 4, trackColor: '#C0CA33' },
  { id: 'content', label: 'Content', emoji: '😊', calendarLevel: 3, trackColor: '#43A047' },
  { id: 'sad', label: 'Sad', emoji: '☹️', calendarLevel: 0, trackColor: '#1E88E5' },
  { id: 'bored', label: 'Bored', emoji: '😐', calendarLevel: 2, trackColor: '#7E57C2' },
];

export function getMoodOptionById(id) {
  return SESSION_MOOD_OPTIONS.find((m) => m.id === id) ?? null;
}

/**
 * Legacy `{ start/end… }` or new `{ sessions: [...] }` — list of session records per day.
 */
export function normalizeMoodDaySessions(dayEntry) {
  if (!dayEntry || typeof dayEntry !== 'object') return [];
  if (Array.isArray(dayEntry.sessions)) return dayEntry.sessions;
  return [
    {
      startMoodId: dayEntry.startMoodId ?? null,
      endMoodId: dayEntry.endMoodId ?? null,
      startSkipped: dayEntry.startSkipped === true,
      endSkipped: dayEntry.endSkipped === true,
    },
  ];
}

/**
 * @param {'before' | 'after' | undefined} phase — `undefined`: count session start + end (default). `'before'`: start only. `'after'`: end only.
 */
function tallyMoodVotes(sessions, phase) {
  const both = phase == null;
  const votes = {};
  let moodVotes = 0;
  let skipParts = 0;
  sessions.forEach((s) => {
    if (!s) return;
    if (both || phase === 'before') {
      if (!s.startSkipped && s.startMoodId) {
        votes[s.startMoodId] = (votes[s.startMoodId] || 0) + 1;
        moodVotes += 1;
      } else if (s.startSkipped) skipParts += 1;
    }
    if (both || phase === 'after') {
      if (!s.endSkipped && s.endMoodId) {
        votes[s.endMoodId] = (votes[s.endMoodId] || 0) + 1;
        moodVotes += 1;
      } else if (s.endSkipped) skipParts += 1;
    }
  });
  return { votes, moodVotes, skipParts };
}

function pickMajorityMoodId(votes) {
  const ids = Object.keys(votes);
  if (ids.length === 0) return null;
  let maxC = -1;
  ids.forEach((id) => {
    if (votes[id] > maxC) maxC = votes[id];
  });
  const top = ids.filter((id) => votes[id] === maxC);
  if (top.length === 1) return top[0];
  let bestId = top[0];
  top.forEach((id) => {
    const m = getMoodOptionById(id);
    const bm = getMoodOptionById(bestId);
    if (!m || !bm) return;
    if (m.calendarLevel > bm.calendarLevel) bestId = id;
    else if (m.calendarLevel === bm.calendarLevel && id.localeCompare(bestId) < 0) bestId = id;
  });
  return bestId;
}

/**
 * Per-day display: majority of logged moods that day.
 * Default (`phase` omitted): each session start and end counts as one vote.
 * `before` / `after`: majority among pre-session or post-session moods only.
 * Skipped only when there are no mood votes for that phase but at least one skip was recorded.
 */
export function getMoodTrackDisplayForDayEntry(dayEntry, phase) {
  const sessions = normalizeMoodDaySessions(dayEntry);
  if (sessions.length === 0) return { type: 'empty' };
  const { votes, moodVotes, skipParts } = tallyMoodVotes(sessions, phase);
  if (moodVotes === 0) {
    if (skipParts > 0) return { type: 'skipped' };
    return { type: 'empty' };
  }
  const moodId = pickMajorityMoodId(votes);
  const mood = getMoodOptionById(moodId);
  if (!mood) return { type: 'empty' };
  return {
    type: 'mood',
    moodId,
    color: mood.trackColor,
    label: mood.label,
  };
}

/** Keys with a logged mood or skip (for week / month / year fills). */
export function dayDisplayByKeyFromEntries(moodEntries) {
  const out = {};
  const src = moodEntries && typeof moodEntries === 'object' ? moodEntries : {};
  Object.keys(src).forEach((k) => {
    const disp = getMoodTrackDisplayForDayEntry(src[k]);
    if (disp.type !== 'empty') out[k] = disp;
  });
  return out;
}

/** Readable day number / label color on top of a mood fill (WCAG-ish luminance). */
export function textColorForMoodFill(hex) {
  const h = (hex || '').replace('#', '');
  if (h.length !== 6) return '#1A2330';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 0.72 ? '#1A2330' : 'rgba(255,255,255,0.95)';
}

const ILLUSTRATIVE_POSITIVE = ['excited', 'happy', 'peaceful', 'content'];
const ILLUSTRATIVE_NEGATIVE = ['angry', 'anxious', 'sad'];

function hashDateKey(key) {
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(h, 33) + key.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Stable YYYY-MM-DD from a local `Date` (matches calendar cell keys). */
export function dateKeyFromLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local-date compare: true if dateKey (YYYY-MM-DD) is after today. */
export function isFutureDateKey(dateKey) {
  const p = String(dateKey).split('-');
  if (p.length !== 3) return true;
  const Y = parseInt(p[0], 10);
  const M = parseInt(p[1], 10);
  const D = parseInt(p[2], 10);
  if (!Y || !M || !D) return true;
  const target = new Date(Y, M - 1, D);
  const endToday = new Date();
  endToday.setHours(23, 59, 59, 999);
  return target > endToday;
}

/**
 * Deterministic “filled calendar” mood when the user has no log for that day.
 * ~75% positive wheel colors, ~15% bored, ~10% anxious/sad/angry — for visuals only.
 */
export function illustrativeMoodDisplayForDateKey(dateKey) {
  const h = hashDateKey(String(dateKey));
  const r = h % 100;
  let moodId;
  if (r < 75) {
    moodId = ILLUSTRATIVE_POSITIVE[h % ILLUSTRATIVE_POSITIVE.length];
  } else if (r < 90) {
    moodId = 'bored';
  } else {
    moodId = ILLUSTRATIVE_NEGATIVE[h % ILLUSTRATIVE_NEGATIVE.length];
  }
  const mood = getMoodOptionById(moodId);
  return {
    type: 'mood',
    moodId,
    color: mood.trackColor,
    label: mood.label,
  };
}

/**
 * Week / month / year cells: real logged mood or skip wins; past days without a log get illustrative fills.
 * Future days → null (placeholder in UI).
 */
export function resolveCalendarDayDisplay(dateKey, moodEntries, phase) {
  if (isFutureDateKey(dateKey)) return null;
  const raw = moodEntries?.[dateKey];
  const real = raw ? getMoodTrackDisplayForDayEntry(raw, phase) : { type: 'empty' };
  if (real.type === 'skipped') return { ...real, illustrative: false };
  if (real.type === 'mood') return { ...real, illustrative: false };
  return { ...illustrativeMoodDisplayForDateKey(dateKey), illustrative: true };
}

/** Map a day entry to calendar level: 0..4; skipped => -1 (gray); none => null. Uses majority mood. */
export function getCalendarLevelFromMoodEntry(dayEntry, phase) {
  const disp = getMoodTrackDisplayForDayEntry(dayEntry, phase);
  if (disp.type === 'skipped') return -1;
  if (disp.type === 'mood') return getMoodOptionById(disp.moodId)?.calendarLevel ?? null;
  return null;
}

/**
 * Days with both start and end moods (not skipped): % where end mood score > start.
 */
function forEachPairedSession(moodEntries, fn) {
  const src = moodEntries && typeof moodEntries === 'object' ? moodEntries : {};
  Object.values(src).forEach((day) => {
    if (!day || typeof day !== 'object') return;
    normalizeMoodDaySessions(day).forEach((session) => {
      if (!session) return;
      if (session.startSkipped || session.endSkipped) return;
      const sid = session.startMoodId;
      const eid = session.endMoodId;
      if (!sid || !eid) return;
      fn({ sid, eid });
    });
  });
}

export function computeOverallPairedSessionImprovement(moodEntries) {
  let paired = 0;
  let improved = 0;
  forEachPairedSession(moodEntries, ({ sid, eid }) => {
    const sm = getMoodOptionById(sid);
    const em = getMoodOptionById(eid);
    if (!sm || !em) return;
    paired += 1;
    if (em.calendarLevel > sm.calendarLevel) improved += 1;
  });
  return {
    paired,
    pctImproved: paired > 0 ? Math.round((improved / paired) * 100) : null,
  };
}

/**
 * For each emotion as **pre-session** mood: % of sessions where post-session mood score improved.
 */
export function computeSessionMoodImprovementByStartEmotion(moodEntries) {
  const stats = {};
  SESSION_MOOD_OPTIONS.forEach((m) => {
    stats[m.id] = { n: 0, improved: 0, sumDelta: 0 };
  });
  forEachPairedSession(moodEntries, ({ sid, eid }) => {
    if (!stats[sid]) return;
    const sm = getMoodOptionById(sid);
    const em = getMoodOptionById(eid);
    if (!sm || !em) return;
    const delta = em.calendarLevel - sm.calendarLevel;
    const row = stats[sid];
    row.n += 1;
    if (delta > 0) row.improved += 1;
    row.sumDelta += delta;
  });

  return SESSION_MOOD_OPTIONS.map((m) => {
    const row = stats[m.id];
    const pct = row.n > 0 ? Math.round((row.improved / row.n) * 100) : null;
    const avgDelta = row.n > 0 ? row.sumDelta / row.n : null;
    return {
      moodId: m.id,
      label: m.label,
      emoji: m.emoji,
      trackColor: m.trackColor,
      sessionCount: row.n,
      pctImproved: pct,
      avgDelta,
    };
  });
}

/**
 * Subset of moodEntries for Insights / Trends scope (Day / Week / Month / Year).
 * `anchor`: `{ dayKey?, year?, monthIndex? }` — monthIndex 0–11.
 */
export function filterMoodEntriesForRange(moodEntries, range, anchor = {}) {
  const src = moodEntries && typeof moodEntries === 'object' ? moodEntries : {};
  const keys = Object.keys(src);
  const now = new Date();

  if (range === 'day') {
    const k = anchor.dayKey || dateKeyFromLocalDate(now);
    return src[k] ? { [k]: src[k] } : {};
  }
  if (range === 'week') {
    const end = new Date(now);
    const start = new Date(now);
    start.setDate(end.getDate() - 6);
    const kStart = dateKeyFromLocalDate(start);
    const kEnd = dateKeyFromLocalDate(end);
    const out = {};
    keys.forEach((key) => {
      if (key >= kStart && key <= kEnd) out[key] = src[key];
    });
    return out;
  }
  if (range === 'month') {
    const y = anchor.year !== undefined ? anchor.year : now.getFullYear();
    const m = anchor.monthIndex !== undefined ? anchor.monthIndex : now.getMonth();
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
    const out = {};
    keys.forEach((key) => {
      if (key.startsWith(prefix)) out[key] = src[key];
    });
    return out;
  }
  const y = anchor.year !== undefined ? anchor.year : now.getFullYear();
  const out = {};
  keys.forEach((key) => {
    if (key.startsWith(`${y}-`)) out[key] = src[key];
  });
  return out;
}

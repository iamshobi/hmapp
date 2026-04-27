/**
 * "Critical strain" = high stress + drained + feel bad on the 1–10 check-in.
 * Gentle mode triggers after this pattern three local-calendar days in a row.
 */

/** Stress scale: low 1 — high 10 */
export const CRITICAL_STRESS_MIN = 8;

/** Energy: drained left — energized right */
export const CRITICAL_ENERGY_MAX = 3;

/** Mood: feel bad left — feel good right */
export const CRITICAL_MOOD_MAX = 3;

export const RECOVERY_BREATH_DURATION_SEC = 120;

export const CRITICAL_SHIFT_ALERT_COPY =
  "The data suggests you're under significant strain. Today, we've bypassed the 10-minute session for a 2-minute 'Recovery Breath.' No goals, just presence.";

export function getLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysLocalDate(dateStr, deltaDays) {
  const [y, mo, da] = dateStr.split('-').map(Number);
  const dt = new Date(y, mo - 1, da + deltaDays);
  return getLocalDateString(dt);
}

export function isCriticalStrainSnapshot(stress, energy, mood) {
  if (stress == null || energy == null || mood == null) return false;
  return stress >= CRITICAL_STRESS_MIN && energy <= CRITICAL_ENERGY_MAX && mood <= CRITICAL_MOOD_MAX;
}

/** Today, yesterday, and two days ago must all be flagged. */
export function hasThreeDayCriticalStreak(flags) {
  if (!flags || typeof flags !== 'object') return false;
  const t = getLocalDateString(new Date());
  const y1 = addDaysLocalDate(t, -1);
  const y2 = addDaysLocalDate(t, -2);
  return !!flags[t] && !!flags[y1] && !!flags[y2];
}

/** Drop keys older than `keepDays` before today to limit storage size. */
export function pruneCriticalStrainFlags(flags, keepDays = 14) {
  if (!flags || typeof flags !== 'object') return {};
  const cutoff = addDaysLocalDate(getLocalDateString(new Date()), -keepDays);
  const next = {};
  Object.keys(flags).forEach((k) => {
    if (k >= cutoff && flags[k]) next[k] = true;
  });
  return next;
}

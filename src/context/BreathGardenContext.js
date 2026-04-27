/**
 * Breath Garden context: Streak + Garden gamification for breathing/meditation.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GLOBAL_LEVEL_COUNT } from '../constants/breathGardenLevels';
import { OCEAN_LEVEL_UNLOCK_COUNT } from '../constants/oceanDepthLevels';
import { computeOceanMaxUnlockedLevelIndex } from '../constants/oceanZoneCollectibles';
import { OCEAN_DEV_UNLOCK_ALL, OCEAN_DEV_UNLOCK_PATCH } from '../constants/oceanDevUnlock';
import { normalizeMoodDaySessions } from '../constants/sessionMoodOptions';
import {
  getLocalDateString,
  hasThreeDayCriticalStreak,
  isCriticalStrainSnapshot,
  pruneCriticalStrainFlags,
} from '../constants/criticalShift';

function recomputeGentleFromStored(prevParsed, criticalStrainDayFlags) {
  const flags =
    criticalStrainDayFlags && typeof criticalStrainDayFlags === 'object' ? criticalStrainDayFlags : {};
  const gentleMode = hasThreeDayCriticalStreak(flags);
  const criticalShiftAlertPending =
    gentleMode === true && prevParsed.criticalShiftAlertPending === true;
  return { gentleMode, criticalShiftAlertPending };
}

const STORAGE_KEY = 'breath_garden_data';

const DEFAULT_STATE = {
  streak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  totalSessions: 0,
  totalMinutes: 0,
  coherencePoints: 0,
  /** Completed mandala (Play) sessions — each completion awards a badge */
  zentangleBadges: 0,
  /** Sequential Play levels: 0 = only first global level unlocked */
  maxUnlockedGlobalIndex: 0,
  /** Unique sea shell ids discovered across ocean sessions */
  shellCollectionIds: [],
  /** Unique pearl ids discovered across ocean sessions */
  pearlCollectionIds: [],
  /**
   * Ocean Dive list: highest unlock index (0…5) that the player may start.
   * Level index i is playable when i <= oceanMaxUnlockedLevelIndex. Starts at 0 (Epipelagic only).
   */
  oceanMaxUnlockedLevelIndex: 0,
  /** At least one finished ocean session in a Drift-zone level (epipelagic / mesopelagic). */
  oceanDriftModeComplete: false,
  /** At least one finished ocean session in a Swim-zone level (bathypelagic / abyssopelagic). */
  oceanSwimModeComplete: false,
  /**
   * Daily mood capture: { 'YYYY-MM-DD': { sessions: [...] } } (legacy flat start/end also supported when reading).
   * Each session: { startMoodId?, endMoodId?, startSkipped?, endSkipped? }.
   */
  moodEntries: {},
  /** Numeric survey check-ins from Measure flow and post-session reflection. */
  currentSurveyBefore: null,
  lastSurveyResult: null,
  surveyResults: [],
  /** Post-session reflection notes entered by user. */
  sessionNotes: [],
  /**
   * Local calendar days (YYYY-MM-DD) where the user logged critical strain (high stress + drained + feel bad).
   * Updated on Measure save and when a session survey completes (uses before values for that day).
   */
  criticalStrainDayFlags: {},
  /** Derived: true while the last three local days all have critical strain. */
  gentleMode: false,
  /** Show one-shot Critical Shift alert overlay when gentle mode is newly entered. */
  criticalShiftAlertPending: false,
};

const PLANT_STAGES = [
  { minSessions: 0, label: 'Seed', emoji: '🌱' },
  { minSessions: 3, label: 'Sprout', emoji: '🌿' },
  { minSessions: 7, label: 'Growing', emoji: '🪴' },
  { minSessions: 14, label: 'Flowering', emoji: '🌸' },
  { minSessions: 30, label: 'Garden', emoji: '🌳' },
];

function getPlantStage(totalSessions) {
  let current = PLANT_STAGES[0];
  for (const stage of PLANT_STAGES) {
    if (totalSessions >= stage.minSessions) current = stage;
  }
  return current;
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function wasYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

const BreathGardenContext = createContext(null);

function patchCriticalStrainDayForSnapshot(prevFlags, dateStr, stress, energy, mood) {
  const base = pruneCriticalStrainFlags(
    prevFlags && typeof prevFlags === 'object' ? { ...prevFlags } : {}
  );
  if (isCriticalStrainSnapshot(stress, energy, mood)) {
    return { ...base, [dateStr]: true };
  }
  const next = { ...base };
  delete next[dateStr];
  return next;
}

function deriveGentleModeFromFlags(prev, nextFlags) {
  const streakBefore = hasThreeDayCriticalStreak(
    prev.criticalStrainDayFlags && typeof prev.criticalStrainDayFlags === 'object'
      ? prev.criticalStrainDayFlags
      : {}
  );
  const streakAfter = hasThreeDayCriticalStreak(nextFlags);
  const becameGentle = !streakBefore && streakAfter;
  const gentleMode = streakAfter;
  let criticalShiftAlertPending;
  if (!streakAfter) {
    criticalShiftAlertPending = false;
  } else if (becameGentle) {
    criticalShiftAlertPending = true;
  } else {
    criticalShiftAlertPending = prev.criticalShiftAlertPending === true;
  }
  return { gentleMode, criticalShiftAlertPending };
}

function applyOceanDevUnlock(base) {
  if (!OCEAN_DEV_UNLOCK_ALL) return base;
  return {
    ...base,
    ...OCEAN_DEV_UNLOCK_PATCH,
    shellCollectionIds: [...OCEAN_DEV_UNLOCK_PATCH.shellCollectionIds],
    pearlCollectionIds: [...(OCEAN_DEV_UNLOCK_PATCH.pearlCollectionIds ?? [])],
  };
}

export function BreathGardenProvider({ children }) {
  const [data, setData] = useState(() => applyOceanDevUnlock(DEFAULT_STATE));

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const shellCollectionIds = Array.isArray(parsed.shellCollectionIds) ? parsed.shellCollectionIds : [];
          const pearlCollectionIds = Array.isArray(parsed.pearlCollectionIds) ? parsed.pearlCollectionIds : [];
          const moodEntries =
            parsed.moodEntries && typeof parsed.moodEntries === 'object' ? parsed.moodEntries : {};
          const surveyResults = Array.isArray(parsed.surveyResults) ? parsed.surveyResults : [];
          const sessionNotes = Array.isArray(parsed.sessionNotes) ? parsed.sessionNotes : [];
          const criticalStrainDayFlags =
            parsed.criticalStrainDayFlags && typeof parsed.criticalStrainDayFlags === 'object'
              ? parsed.criticalStrainDayFlags
              : {};
          const { gentleMode, criticalShiftAlertPending } = recomputeGentleFromStored(parsed, criticalStrainDayFlags);
          setData(
            applyOceanDevUnlock({
              ...DEFAULT_STATE,
              ...parsed,
              shellCollectionIds,
              pearlCollectionIds,
              moodEntries,
              surveyResults,
              sessionNotes,
              criticalStrainDayFlags,
              gentleMode,
              criticalShiftAlertPending,
              oceanMaxUnlockedLevelIndex: computeOceanMaxUnlockedLevelIndex(shellCollectionIds, pearlCollectionIds),
              oceanDriftModeComplete: typeof parsed.oceanDriftModeComplete === 'boolean' ? parsed.oceanDriftModeComplete : false,
              oceanSwimModeComplete: typeof parsed.oceanSwimModeComplete === 'boolean' ? parsed.oceanSwimModeComplete : false,
            })
          );
        }
      } catch (_) {}
    })();
  }, []);

  /** Play session: streak + stats + unlock next global level + badge */
  const completePlaySession = useCallback((minutes = 1, points = 10, globalLevelIndex = 0) => {
    const today = getTodayDateString();
    const cap = Math.max(0, GLOBAL_LEVEL_COUNT - 1);
    setData((prev) => {
      let newStreak = prev.streak;
      if (prev.lastSessionDate !== today) {
        if (prev.lastSessionDate && wasYesterday(prev.lastSessionDate)) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
      }
      const longestStreak = Math.max(prev.longestStreak, newStreak);
      const nextMax = Math.min(Math.max(prev.maxUnlockedGlobalIndex ?? 0, globalLevelIndex + 1), cap);
      const next = {
        ...prev,
        streak: newStreak,
        longestStreak,
        lastSessionDate: today,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + minutes,
        coherencePoints: prev.coherencePoints + points,
        maxUnlockedGlobalIndex: nextMax,
        zentangleBadges: (prev.zentangleBadges || 0) + 1,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /**
   * Record that the player finished an ocean session in Drift or Swim (for Swim/Dive mode unlocks).
   * Call when a session completes in epipelagic/mesopelagic (drift) or bathypelagic/abyssopelagic (swim).
   */
  const recordOceanModeSessionComplete = useCallback((groupId) => {
    if (groupId !== 'drift' && groupId !== 'swim') return;
    setData((prev) => {
      const key = groupId === 'drift' ? 'oceanDriftModeComplete' : 'oceanSwimModeComplete';
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Merge ocean shell ids into the lifetime collection (deduped, persisted). Recomputes zone unlock index. */
  const mergeShellCollection = useCallback((ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setData((prev) => {
      const base = Array.isArray(prev.shellCollectionIds) ? prev.shellCollectionIds : [];
      const nextSet = new Set(base);
      ids.forEach((id) => {
        if (typeof id === 'string' && id) nextSet.add(id);
      });
      const shellCollectionIds = Array.from(nextSet);
      const pearlCollectionIds = Array.isArray(prev.pearlCollectionIds) ? prev.pearlCollectionIds : [];
      const oceanMaxUnlockedLevelIndex = computeOceanMaxUnlockedLevelIndex(shellCollectionIds, pearlCollectionIds);
      const next = { ...prev, shellCollectionIds, oceanMaxUnlockedLevelIndex };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Merge pearl ids into the lifetime collection (deduped, persisted). Recomputes zone unlock index. */
  const mergePearlCollection = useCallback((ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setData((prev) => {
      const base = Array.isArray(prev.pearlCollectionIds) ? prev.pearlCollectionIds : [];
      const nextSet = new Set(base);
      ids.forEach((id) => {
        if (typeof id === 'string' && id) nextSet.add(id);
      });
      const pearlCollectionIds = Array.from(nextSet);
      const shellCollectionIds = Array.isArray(prev.shellCollectionIds) ? prev.shellCollectionIds : [];
      const oceanMaxUnlockedLevelIndex = computeOceanMaxUnlockedLevelIndex(shellCollectionIds, pearlCollectionIds);
      const next = { ...prev, pearlCollectionIds, oceanMaxUnlockedLevelIndex };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Home / non-Play flows */
  const completeSession = useCallback((minutes = 1, points = 10) => {
    const today = getTodayDateString();
    setData((prev) => {
      let newStreak = prev.streak;
      if (prev.lastSessionDate !== today) {
        if (prev.lastSessionDate && wasYesterday(prev.lastSessionDate)) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
      }
      const longestStreak = Math.max(prev.longestStreak, newStreak);
      const next = {
        ...prev,
        streak: newStreak,
        longestStreak,
        lastSessionDate: today,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + minutes,
        coherencePoints: prev.coherencePoints + points,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Record mood at session start/end. Appends sessions per day so multiple sessions are supported. */
  const recordMoodEntry = useCallback(({ timing, moodId = null, skipped = false, date = null }) => {
    if (timing !== 'start' && timing !== 'end') return;
    const keyDate = typeof date === 'string' && date ? date : getTodayDateString();
    setData((prev) => {
      const prevMap = prev.moodEntries && typeof prev.moodEntries === 'object' ? prev.moodEntries : {};
      const prevDayRaw = prevMap[keyDate] && typeof prevMap[keyDate] === 'object' ? prevMap[keyDate] : {};
      const sessions = normalizeMoodDaySessions(prevDayRaw).map((s) => ({ ...s }));

      if (timing === 'start') {
        sessions.push({
          startMoodId: skipped ? null : typeof moodId === 'string' ? moodId : null,
          startSkipped: skipped === true,
          endMoodId: null,
          endSkipped: false,
        });
      } else {
        let idx = -1;
        for (let i = sessions.length - 1; i >= 0; i--) {
          const s = sessions[i];
          const needsEnd = s && !s.endSkipped && (s.endMoodId === null || s.endMoodId === undefined);
          if (needsEnd) {
            idx = i;
            break;
          }
        }
        if (idx >= 0) {
          sessions[idx] = {
            ...sessions[idx],
            endMoodId: skipped ? null : typeof moodId === 'string' ? moodId : null,
            endSkipped: skipped === true,
          };
        } else {
          sessions.push({
            startMoodId: null,
            startSkipped: false,
            endMoodId: skipped ? null : typeof moodId === 'string' ? moodId : null,
            endSkipped: skipped === true,
          });
        }
      }

      const nextDay = { sessions };
      const moodEntries = { ...prevMap, [keyDate]: nextDay };
      const next = { ...prev, moodEntries };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  function sanitizeSurveyValues(values = {}) {
    const norm = (v) =>
      Number.isFinite(v) ? Math.max(1, Math.min(10, Math.round(v))) : null;
    return {
      stress: norm(values.stress),
      energy: norm(values.energy),
      mood: norm(values.mood),
    };
  }

  const recordSessionSurveyBefore = useCallback((values) => {
    const sanitized = sanitizeSurveyValues(values);
    if (sanitized.stress == null && sanitized.energy == null && sanitized.mood == null) return;
    const at = new Date().toISOString();
    setData((prev) => {
      const dateStr = getLocalDateString(new Date());
      const nextFlags = patchCriticalStrainDayForSnapshot(
        prev.criticalStrainDayFlags,
        dateStr,
        sanitized.stress,
        sanitized.energy,
        sanitized.mood
      );
      const { gentleMode, criticalShiftAlertPending } = deriveGentleModeFromFlags(prev, nextFlags);
      const next = {
        ...prev,
        currentSurveyBefore: {
          at,
          stress: sanitized.stress,
          energy: sanitized.energy,
          mood: sanitized.mood,
        },
        criticalStrainDayFlags: nextFlags,
        gentleMode,
        criticalShiftAlertPending,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const recordSessionSurveyAfter = useCallback((values) => {
    const sanitized = sanitizeSurveyValues(values);
    if (sanitized.stress == null && sanitized.energy == null && sanitized.mood == null) return null;
    const at = new Date().toISOString();
    let created = null;
    setData((prev) => {
      const before = prev.currentSurveyBefore;
      const entry = {
        at,
        stressBefore: before?.stress ?? null,
        stressAfter: sanitized.stress,
        energyBefore: before?.energy ?? null,
        energyAfter: sanitized.energy,
        moodBefore: before?.mood ?? null,
        moodAfter: sanitized.mood,
      };
      created = entry;
      const surveyResults = [entry, ...(Array.isArray(prev.surveyResults) ? prev.surveyResults : [])].slice(0, 300);
      const sessionDateStr = getLocalDateString(new Date(entry.at));
      const nextFlags = patchCriticalStrainDayForSnapshot(
        prev.criticalStrainDayFlags,
        sessionDateStr,
        entry.stressBefore,
        entry.energyBefore,
        entry.moodBefore
      );
      const { gentleMode, criticalShiftAlertPending } = deriveGentleModeFromFlags(prev, nextFlags);
      const next = {
        ...prev,
        currentSurveyBefore: null,
        lastSurveyResult: entry,
        surveyResults,
        criticalStrainDayFlags: nextFlags,
        gentleMode,
        criticalShiftAlertPending,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return created;
  }, []);

  const acknowledgeCriticalShiftAlert = useCallback(() => {
    setData((prev) => {
      const next = { ...prev, criticalShiftAlertPending: false };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addSessionNote = useCallback((text) => {
    const body = typeof text === 'string' ? text.trim() : '';
    if (!body) return null;
    const note = {
      id: `note-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => {
      const sessionNotes = [note, ...(Array.isArray(prev.sessionNotes) ? prev.sessionNotes : [])].slice(0, 300);
      const next = { ...prev, sessionNotes };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return note;
  }, []);

  const updateSessionNote = useCallback((id, text) => {
    const body = typeof text === 'string' ? text.trim() : '';
    if (!id || !body) return false;
    let updated = false;
    setData((prev) => {
      const sessionNotes = (Array.isArray(prev.sessionNotes) ? prev.sessionNotes : []).map((note) => {
        if (note?.id !== id) return note;
        updated = true;
        return {
          ...note,
          body,
          updatedAt: new Date().toISOString(),
        };
      });
      const next = { ...prev, sessionNotes };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return updated;
  }, []);

  const deleteSessionNote = useCallback((id) => {
    if (!id) return false;
    let removed = false;
    setData((prev) => {
      const before = Array.isArray(prev.sessionNotes) ? prev.sessionNotes : [];
      const sessionNotes = before.filter((note) => note?.id !== id);
      removed = sessionNotes.length !== before.length;
      const next = { ...prev, sessionNotes };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return removed;
  }, []);

  const wateredToday = data.lastSessionDate === getTodayDateString();
  const plantStage = getPlantStage(data.totalSessions);
  const nextStage = PLANT_STAGES.find((s) => s.minSessions > data.totalSessions);

  const value = {
    streak: data.streak,
    longestStreak: data.longestStreak,
    totalSessions: data.totalSessions,
    totalMinutes: data.totalMinutes,
    coherencePoints: data.coherencePoints,
    wateredToday,
    plantStage,
    nextStage,
    completeSession,
    completePlaySession,
    maxUnlockedGlobalIndex: data.maxUnlockedGlobalIndex ?? 0,
    zentangleBadges: data.zentangleBadges || 0,
    shellCollectionIds: Array.isArray(data.shellCollectionIds) ? data.shellCollectionIds : [],
    pearlCollectionIds: Array.isArray(data.pearlCollectionIds) ? data.pearlCollectionIds : [],
    mergeShellCollection,
    mergePearlCollection,
    oceanMaxUnlockedLevelIndex:
      typeof data.oceanMaxUnlockedLevelIndex === 'number'
        ? Math.min(OCEAN_LEVEL_UNLOCK_COUNT - 1, Math.max(0, data.oceanMaxUnlockedLevelIndex))
        : 0,
    oceanDriftModeComplete: data.oceanDriftModeComplete === true,
    oceanSwimModeComplete: data.oceanSwimModeComplete === true,
    recordOceanModeSessionComplete,
    moodEntries: data.moodEntries && typeof data.moodEntries === 'object' ? data.moodEntries : {},
    recordMoodEntry,
    currentSurveyBefore: data.currentSurveyBefore ?? null,
    lastSurveyResult: data.lastSurveyResult ?? null,
    surveyResults: Array.isArray(data.surveyResults) ? data.surveyResults : [],
    sessionNotes: Array.isArray(data.sessionNotes) ? data.sessionNotes : [],
    recordSessionSurveyBefore,
    recordSessionSurveyAfter,
    addSessionNote,
    updateSessionNote,
    deleteSessionNote,
    gentleMode: data.gentleMode === true,
    criticalShiftAlertPending: data.criticalShiftAlertPending === true,
    acknowledgeCriticalShiftAlert,
  };

  return (
    <BreathGardenContext.Provider value={value}>
      {children}
    </BreathGardenContext.Provider>
  );
}

export function useBreathGarden() {
  const ctx = useContext(BreathGardenContext);
  if (!ctx) throw new Error('useBreathGarden must be used within BreathGardenProvider');
  return ctx;
}

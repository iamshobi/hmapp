const PREVIEW_SNAPSHOT_BY_TYPE = {
  inactiveSurvey: { sessions: 12, streak: 4, coherence: 2.8, points: 92 },
  partialSurveyOptOut: { sessions: 18, streak: 6, coherence: 3.0, points: 128 },
  pro: { sessions: 100, streak: 14, coherence: 4.8, points: 210 },
  still: { sessions: 35, streak: 10, coherence: 3.35, points: 158 },
  deep: { sessions: 18, streak: 6, coherence: 3.0, points: 122 },
  flow: { sessions: 8, streak: 4, coherence: 2.45, points: 86 },
  settle: { sessions: 3, streak: 2, coherence: 1.85, points: 54 },
  advanced: { sessions: 18, streak: 6, coherence: 3.0, points: 122 },
  building: { sessions: 5, streak: 3, coherence: 2.3, points: 75 },
  firstTime: { sessions: 1, streak: 1, coherence: 1.7, points: 40 },
  zero: { sessions: 0, streak: 0, coherence: 0, points: 0 },
};

const PREVIEW_AVERAGES_BY_TYPE = {
  pro: { stressBefore: 8, stressAfter: 4, energyBefore: 3, energyAfter: 7, moodBefore: 3, moodAfter: 8 },
  still: { stressBefore: 7.5, stressAfter: 4, energyBefore: 3.5, energyAfter: 7, moodBefore: 4, moodAfter: 7.5 },
  deep: { stressBefore: 7, stressAfter: 4, energyBefore: 3, energyAfter: 7, moodBefore: 4, moodAfter: 7 },
  advanced: { stressBefore: 7, stressAfter: 4, energyBefore: 3, energyAfter: 7, moodBefore: 4, moodAfter: 7 },
  flow: { stressBefore: 7, stressAfter: 5, energyBefore: 4, energyAfter: 6, moodBefore: 4, moodAfter: 6.5 },
  settle: { stressBefore: 7, stressAfter: 5, energyBefore: 4, energyAfter: 6, moodBefore: 4, moodAfter: 6 },
  building: { stressBefore: 7, stressAfter: 5, energyBefore: 4, energyAfter: 6, moodBefore: 4, moodAfter: 6 },
  zero: { stressBefore: 5, stressAfter: 5, energyBefore: 5, energyAfter: 5, moodBefore: 5, moodAfter: 5 },
};

const PREVIEW_PRACTICE_DAYS_BY_TYPE = {
  zero: 0,
  settle: 3,
  flow: 8,
  deep: 15,
  still: 22,
  pro: 30,
  inactiveSurvey: 7,
  partialSurveyOptOut: 10,
};

export {
  PREVIEW_SNAPSHOT_BY_TYPE,
  PREVIEW_AVERAGES_BY_TYPE,
  PREVIEW_PRACTICE_DAYS_BY_TYPE,
};

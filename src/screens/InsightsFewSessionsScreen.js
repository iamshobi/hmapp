import React from 'react';
import { Text } from 'react-native';
import {
  GlassCard,
  ReflectionHero,
  ScreenGradientLayout,
  SessionInsightsTopBar,
  StateShiftInsightSection,
  StickyPrimaryCTA,
} from '../components/sessionInsights/SessionInsightsUI';

export default function InsightsFewSessionsScreen({
  sessionCount = 2,
  averages,
  stateShift,
  onPrimaryPress,
  onSecondaryPress,
  onBackPress,
}) {
  const shift =
    stateShift ??
    (averages
      ? {
          stressBefore: averages.stressBefore,
          stressAfter: averages.stressAfter,
          energyBefore: averages.energyBefore,
          energyAfter: averages.energyAfter,
          moodBefore: averages.moodBefore,
          moodAfter: averages.moodAfter,
        }
      : null);

  return (
    <ScreenGradientLayout
      topBar={<SessionInsightsTopBar onBackPress={onBackPress} />}
      stickyFooter={
        <StickyPrimaryCTA
          primaryLabel="Complete another session"
          secondaryLabel="Back to Measure"
          onPrimaryPress={onPrimaryPress}
          onSecondaryPress={onSecondaryPress}
        />
      }
    >
      <ReflectionHero
        badgeText={`${sessionCount} Sessions`}
        title="Early signals are already visible"
        body="Even in the first sessions, breath-coherence practice can improve focus, mood, and stress balance."
      />

      {shift ? (
        <StateShiftInsightSection
          stressBefore={shift.stressBefore}
          stressAfter={shift.stressAfter}
          energyBefore={shift.energyBefore}
          energyAfter={shift.energyAfter}
          moodBefore={shift.moodBefore}
          moodAfter={shift.moodAfter}
        />
      ) : null}

      <GlassCard
        title="Benefit insight"
        body="Your data already suggests better regulation. A little consistency now can amplify daily energy and emotional steadiness."
      />

      <GlassCard title="Why this matters" variant="strong">
        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 }}>
          A 3-minute 'CO2 Reset' can boost your focus. Ready?
        </Text>
      </GlassCard>
    </ScreenGradientLayout>
  );
}

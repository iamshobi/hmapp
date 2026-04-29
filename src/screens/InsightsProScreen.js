import React from 'react';
import {
  GlassCard,
  ReflectionHero,
  ScreenGradientLayout,
  SessionInsightsTopBar,
  StateShiftInsightSection,
  StickyPrimaryCTA,
  TrendLayerComparisonCard,
} from '../components/sessionInsights/SessionInsightsUI';

export default function InsightsProScreen({
  sessionCount,
  averages,
  standoutInsight,
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
          primaryLabel="Keep your rhythm"
          secondaryLabel="View monthly rhythm"
          onPrimaryPress={onPrimaryPress}
          onSecondaryPress={onSecondaryPress}
        />
      }
    >
      <ReflectionHero
        badgeText={sessionCount >= 100 ? '100+ Sessions' : `${sessionCount} Sessions`}
        title="Your rhythm now supports your resilience"
        body="Regular breathing and coherence sessions are translating into stronger energy, steadier mood, and better stress recovery."
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
        title="Your typical session effect"
        body="These average before and after responses show what your practice tends to do."
      />

      {averages && sessionCount >= 20 ? (
        <TrendLayerComparisonCard sessionCount={sessionCount} averages={averages} />
      ) : null}

      <GlassCard
        title="What stands out most"
        body={standoutInsight || 'Your Activity shows a strong pattern of support after regular sessions.'}
        variant="strong"
      />

      <GlassCard
        title="Milestone 100+"
        body="Your nervous system is now resilient. You carry this calm with you."
      />
    </ScreenGradientLayout>
  );
}

import React from 'react';
import { Text } from 'react-native';
import {
  GlassCard,
  MilestoneProgressBar,
  ReflectionHero,
  ScreenGradientLayout,
  SessionInsightsTopBar,
  StateShiftInsightSection,
  StickyPrimaryCTA,
} from '../components/sessionInsights/SessionInsightsUI';

export default function InsightsBeginnerScreen({
  sessionCount,
  milestoneTarget = 21,
  averages,
  stateShift,
  onPrimaryPress,
  onSecondaryPress,
  onBackPress,
}) {
  const progress = Math.min((sessionCount || 0) / milestoneTarget, 1);
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
          primaryLabel="Keep going"
          secondaryLabel="Start today’s session"
          onPrimaryPress={onPrimaryPress}
          onSecondaryPress={onSecondaryPress}
        />
      }
    >
      <ReflectionHero
        badgeText={`${sessionCount} Sessions`}
        title="Your regulation trend is taking shape"
        body="Session by session, your data is clarifying how coherence supports stress recovery, mood stability, and energy."
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
        title="What your body is showing"
        body="Stress generally trends downward while energy and mood trend upward after aligned breathing."
      />

      <GlassCard
        title="You’re building a rhythm"
        body={`${sessionCount} sessions completed`}
        caption="A few more sessions will make your trends even clearer."
        variant="strong"
      >
        <MilestoneProgressBar progress={progress} />
        <Text style={{ color: 'rgba(255,255,255,0.64)', fontSize: 13, lineHeight: 18 }}>
          {Math.max(milestoneTarget - sessionCount, 0)} sessions until your next milestone view.
        </Text>
      </GlassCard>
    </ScreenGradientLayout>
  );
}

import React from 'react';
import { Text } from 'react-native';
import {
  GlassCard,
  MilestoneDots,
  ReflectionHero,
  ScreenGradientLayout,
  SessionInsightsTopBar,
  StateShiftInsightSection,
  StickyPrimaryCTA,
} from '../components/sessionInsights/SessionInsightsUI';

export default function InsightsFirstTimeScreen({
  stressBefore,
  stressAfter,
  energyBefore,
  energyAfter,
  moodBefore,
  moodAfter,
  stateShift,
  onPrimaryPress,
  onSecondaryPress,
  onBackPress,
}) {
  const shift =
    stateShift ?? {
      stressBefore,
      stressAfter,
      energyBefore,
      energyAfter,
      moodBefore,
      moodAfter,
    };

  return (
    <ScreenGradientLayout
      topBar={<SessionInsightsTopBar onBackPress={onBackPress} />}
      stickyFooter={
        <StickyPrimaryCTA
          primaryLabel="Continue tomorrow"
          secondaryLabel="View session summary"
          onPrimaryPress={onPrimaryPress}
          onSecondaryPress={onSecondaryPress}
        />
      }
    >
      <ReflectionHero
        badgeText="First Session"
        title="How did this session help?"
        body="You checked in before and after. Here's the shift from this one moment of care."
      />

      <StateShiftInsightSection
        stressBefore={shift.stressBefore}
        stressAfter={shift.stressAfter}
        energyBefore={shift.energyBefore}
        energyAfter={shift.energyAfter}
        moodBefore={shift.moodBefore}
        moodAfter={shift.moodAfter}
      />

      <GlassCard title="That’s a meaningful first step" variant="strong">
        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 }}>
          Complete 2 more sessions to reveal a clearer pattern in your stress, energy, and mood response.
        </Text>
        <MilestoneDots total={3} active={1} />
        <Text style={{ color: 'rgba(255,255,255,0.64)', fontSize: 13, lineHeight: 18 }}>
          Come back tomorrow and check in again.
        </Text>
      </GlassCard>
    </ScreenGradientLayout>
  );
}

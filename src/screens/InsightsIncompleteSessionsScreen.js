import React from 'react';
import { Text } from 'react-native';
import {
  GlassCard,
  ReflectionHero,
  ScreenGradientLayout,
  SessionInsightsTopBar,
  StickyPrimaryCTA,
} from '../components/sessionInsights/SessionInsightsUI';

export default function InsightsIncompleteSessionsScreen({
  incompleteCount = 1,
  completedCount = 0,
  onPrimaryPress,
  onSecondaryPress,
  onBackPress,
}) {
  return (
    <ScreenGradientLayout
      topBar={<SessionInsightsTopBar onBackPress={onBackPress} />}
      stickyFooter={
        <StickyPrimaryCTA
          primaryLabel="Finish a full session"
          secondaryLabel="Back to Measure"
          onPrimaryPress={onPrimaryPress}
          onSecondaryPress={onSecondaryPress}
        />
      }
    >
      <ReflectionHero
        badgeText="Incomplete Sessions"
        title="Completion deepens the benefit"
        body="Partial sessions help, but full sessions generate stronger coherence and more reliable gains in stress, mood, and energy."
      />

      <GlassCard
        title="Current pattern"
        body={`${incompleteCount} incomplete and ${completedCount} completed sessions logged.`}
      />

      <GlassCard title="Motivational insight" variant="strong">
        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 }}>
          Completing your next full session can strengthen nervous system recovery and improve your next-day energy and emotional steadiness.
        </Text>
      </GlassCard>

      <GlassCard
        title="Try this next"
        body="Start with a shorter session, stay until the end, then check in again. You will unlock clearer insights after full completions."
      />
    </ScreenGradientLayout>
  );
}

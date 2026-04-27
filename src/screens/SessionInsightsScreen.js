import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import InsightsBeginnerScreen from './InsightsBeginnerScreen';
import InsightsFirstTimeScreen from './InsightsFirstTimeScreen';
import InsightsFewSessionsScreen from './InsightsFewSessionsScreen';
import InsightsIncompleteSessionsScreen from './InsightsIncompleteSessionsScreen';
import InsightsProScreen from './InsightsProScreen';
import SessionInsightsQuoteScreen from './SessionInsightsQuoteScreen';
import { getInsightsVariant, hasAnyStateShiftMetric } from '../constants/sessionInsights';

const QUOTES_BY_TYPE = {
  firstTime: [
    '"The longest journey begins with a single breath"',
    '"A journey of a thousand miles begins with a single step"',
    '"No matter how long your journey appears to be, there is never more than this: one step, one breath, one moment... Now"',
  ],
  firstWeek: [
    '"Great things are not done by impulse, but by a series of small things brought together."',
    '"Success is the sum of small efforts, repeated day in and day out."',
    '"The man who removes a mountain begins by carrying away small stones."',
  ],
  longTerm: [
    '"You have become the calm within the storm."',
    '"You have become the lighthouse that does not seek out boats but stays steady to guide them."',
    '"The deeper the roots, the less the branches shake."',
  ],
  inactive: [
    '"Slow progress is still progress."',
    '"Be not afraid of growing slowly, be afraid only of standing still."',
    '"It does not matter how slowly you go as long as you do not stop."',
  ],
};

export default function SessionInsightsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params ?? {};
  const [showQuoteScreen, setShowQuoteScreen] = useState(true);

  const stateShift = {
    stressBefore: params.stressBefore ?? params.averages?.stressBefore,
    stressAfter: params.stressAfter ?? params.averages?.stressAfter,
    energyBefore: params.energyBefore ?? params.averages?.energyBefore,
    energyAfter: params.energyAfter ?? params.averages?.energyAfter,
    moodBefore: params.moodBefore ?? params.averages?.moodBefore,
    moodAfter: params.moodAfter ?? params.averages?.moodAfter,
  };
  const showStateShift = hasAnyStateShiftMetric(
    stateShift.stressBefore,
    stateShift.stressAfter,
    stateShift.energyBefore,
    stateShift.energyAfter,
    stateShift.moodBefore,
    stateShift.moodAfter
  );

  const sessionCount = typeof params.sessionCount === 'number' ? params.sessionCount : 1;
  const averages = params.averages ?? null;
  const milestoneTarget = typeof params.milestoneTarget === 'number' ? params.milestoneTarget : 21;
  const standoutInsight = params.standoutInsight;
  const primaryRouteName = params.primaryRouteName;
  const summaryRouteName = params.summaryRouteName;
  const secondaryRouteName = params.secondaryRouteName;
  const variant =
    params.variant === 'fewSessions' || params.variant === 'incompleteSessions'
      ? params.variant
      : getInsightsVariant({ variant: params.variant, sessionCount });

  const quoteType = useMemo(() => {
    if (variant === 'pro') return 'longTerm';
    if (variant === 'incompleteSessions') return 'inactive';
    if (variant === 'beginner' || variant === 'fewSessions') return 'firstWeek';
    return 'firstTime';
  }, [variant]);

  const openingQuote = useMemo(() => {
    const list = QUOTES_BY_TYPE[quoteType] ?? QUOTES_BY_TYPE.firstTime;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }, [quoteType]);

  const handleBack = () => navigation.goBack();
  const handlePrimary = () => {
    if (primaryRouteName) {
      navigation.navigate(primaryRouteName, params.primaryRouteParams);
      return;
    }
    if (secondaryRouteName) {
      navigation.navigate(secondaryRouteName, params.secondaryRouteParams);
      return;
    }
    navigation.goBack();
  };
  const handleSecondary = () => {
    if (summaryRouteName) {
      navigation.navigate(summaryRouteName, params.summaryRouteParams);
      return;
    }
    navigation.goBack();
  };

  if (showQuoteScreen) {
    return (
      <SessionInsightsQuoteScreen
        quote={openingQuote}
        onContinue={() => setShowQuoteScreen(false)}
      />
    );
  }

  if (variant === 'pro') {
    return (
      <InsightsProScreen
        sessionCount={sessionCount}
        averages={averages}
        standoutInsight={standoutInsight}
        stateShift={showStateShift ? stateShift : null}
        onPrimaryPress={handlePrimary}
        onSecondaryPress={handleSecondary}
        onBackPress={handleBack}
      />
    );
  }

  if (variant === 'beginner') {
    return (
      <InsightsBeginnerScreen
        sessionCount={sessionCount}
        milestoneTarget={milestoneTarget}
        averages={averages}
        stateShift={showStateShift ? stateShift : null}
        onPrimaryPress={handlePrimary}
        onSecondaryPress={handleSecondary}
        onBackPress={handleBack}
      />
    );
  }

  if (variant === 'fewSessions') {
    return (
      <InsightsFewSessionsScreen
        sessionCount={sessionCount}
        averages={averages}
        stateShift={showStateShift ? stateShift : null}
        onPrimaryPress={handlePrimary}
        onSecondaryPress={handleSecondary}
        onBackPress={handleBack}
      />
    );
  }

  if (variant === 'incompleteSessions') {
    return (
      <InsightsIncompleteSessionsScreen
        incompleteCount={typeof params.incompleteCount === 'number' ? params.incompleteCount : 1}
        completedCount={typeof params.completedCount === 'number' ? params.completedCount : 0}
        onPrimaryPress={handlePrimary}
        onSecondaryPress={handleSecondary}
        onBackPress={handleBack}
      />
    );
  }

  return (
    <InsightsFirstTimeScreen
      stressBefore={params.stressBefore}
      stressAfter={params.stressAfter}
      energyBefore={params.energyBefore}
      energyAfter={params.energyAfter}
      moodBefore={params.moodBefore}
      moodAfter={params.moodAfter}
      stateShift={showStateShift ? stateShift : null}
      onPrimaryPress={handlePrimary}
      onSecondaryPress={handleSecondary}
      onBackPress={handleBack}
    />
  );
}

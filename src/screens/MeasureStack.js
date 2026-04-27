import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MeasureTabScreen from './MeasureTabScreen';
import MeasureBeforeSurveyScreen from './MeasureBeforeSurveyScreen';
import MeasureEntryScreen from './measure/MeasureEntryScreen';
import MeasureAfterSurveyScreen from './measure/MeasureAfterSurveyScreen';
import MeasureInsightsSamplesScreen from './measure/MeasureInsightsSamplesScreen';
import SessionInsightsScreen from './SessionInsightsScreen';

const Stack = createNativeStackNavigator();

export default function MeasureStack() {
  return (
    <Stack.Navigator initialRouteName="MeasureEntry" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeasureEntry" component={MeasureEntryScreen} />
      <Stack.Screen name="MeasureBeforeSurvey" component={MeasureBeforeSurveyScreen} />
      <Stack.Screen name="MeasureSurvey" component={MeasureTabScreen} />
      <Stack.Screen name="MeasureInsightsSamples" component={MeasureInsightsSamplesScreen} />
      <Stack.Screen name="MeasureAfterSurvey" component={MeasureAfterSurveyScreen} />
      <Stack.Screen
        name="SessionInsights"
        component={SessionInsightsScreen}
        options={{ animation: 'fade_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

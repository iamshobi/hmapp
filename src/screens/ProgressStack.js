import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProgressMainScreen from './ProgressMainScreen';
import ProgressStatePickerScreen from './ProgressStatePickerScreen';
import ProgressHubScreen from './ProgressHubScreen';
import MyProgressMockupScreen from './MyProgressMockupScreen';
import OverallMoodScreen from './OverallMoodScreen';
import SessionHistoryScreen from './SessionHistoryScreen';

const Stack = createNativeStackNavigator();

export default function ProgressStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProgressStatePicker"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProgressStatePicker" component={ProgressStatePickerScreen} />
      <Stack.Screen name="ProgressMain" component={ProgressMainScreen} />
      <Stack.Screen name="ProgressHub" component={ProgressHubScreen} />
      <Stack.Screen name="MyProgressMockup" component={MyProgressMockupScreen} />
      <Stack.Screen name="OverallMood" component={OverallMoodScreen} />
      <Stack.Screen name="SessionHistory" component={SessionHistoryScreen} />
    </Stack.Navigator>
  );
}

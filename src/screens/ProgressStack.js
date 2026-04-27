import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProgressMainScreen from './ProgressMainScreen';
import ProgressHubScreen from './ProgressHubScreen';
import MyProgressMockupScreen from './MyProgressMockupScreen';
import OverallMoodScreen from './OverallMoodScreen';

const Stack = createNativeStackNavigator();

export default function ProgressStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProgressMain"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProgressMain" component={ProgressMainScreen} />
      <Stack.Screen name="ProgressHub" component={ProgressHubScreen} />
      <Stack.Screen name="MyProgressMockup" component={MyProgressMockupScreen} />
      <Stack.Screen name="OverallMood" component={OverallMoodScreen} />
    </Stack.Navigator>
  );
}

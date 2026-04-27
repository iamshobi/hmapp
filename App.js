import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Home, BookOpen, HeartPulse, Gamepad2, BarChart3 } from 'lucide-react-native';

import { BreathGardenProvider } from './src/context/BreathGardenContext';
import CriticalShiftAlertOverlay from './src/components/CriticalShiftAlertOverlay';
import HomeScreen from './src/screens/HomeScreenRefreshed';
import LearnTabScreen from './src/screens/LearnTabScreen';
import MeasureStack from './src/screens/MeasureStack';
import ProgressStack from './src/screens/ProgressStack';
import PlayThemesScreen from './src/screens/PlayThemesScreen';
import ThemeGamesScreen from './src/screens/ThemeGamesScreen';
import SacredGeometryScreen from './src/screens/SacredGeometryScreen';
import OceanTideScreen from './src/screens/OceanTideScreen';
import OceanLevelDetailScreen from './src/screens/OceanLevelDetailScreen';
import BreathSessionScreen from './src/screens/BreathSessionScreen';
import SessionRewardsScreen from './src/screens/SessionRewardsScreen';
import SessionInsightsScreen from './src/screens/SessionInsightsScreen';
import SeaShellDetailScreen from './src/screens/SeaShellDetailScreen';
import ShellCollectionScreen from './src/screens/ShellCollectionScreen';
import OceanZoneInfoScreen from './src/screens/OceanZoneInfoScreen';
import { colors, gradients, palette } from './src/theme';
import { styleGuide } from './src/theme/styleGuide';
import { AppBottomTabBar } from './src/components/ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Avoid default React Navigation grey behind tabs during splash handoff */
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** Play tab: themes → games per theme → Sacred Geometry session + rewards. */
function PlayStack() {
  return (
    <Stack.Navigator initialRouteName="PlayThemes" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayThemes" component={PlayThemesScreen} />
      <Stack.Screen name="ThemeGames" component={ThemeGamesScreen} />
      <Stack.Screen name="SacredGeometry" component={SacredGeometryScreen} />
      <Stack.Screen name="OceanTide" component={OceanTideScreen} />
      <Stack.Screen name="OceanLevelDetail" component={OceanLevelDetailScreen} />
      <Stack.Screen name="BreathSession" component={BreathSessionScreen} />
      <Stack.Screen
        name="SessionRewards"
        component={SessionRewardsScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="SessionInsights"
        component={SessionInsightsScreen}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen name="SeaShellDetail" component={SeaShellDetailScreen} />
      <Stack.Screen name="ShellCollection" component={ShellCollectionScreen} />
      <Stack.Screen
        name="OceanZoneInfo"
        component={OceanZoneInfoScreen}
        options={{
          animation: 'fade',
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function tabBarStyleForPlay(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'PlayThemes';
  if (routeName === 'BreathSession' || routeName === 'SessionRewards' || routeName === 'SeaShellDetail' || routeName === 'ShellCollection' || routeName === 'OceanTide' || routeName === 'OceanLevelDetail' || routeName === 'OceanZoneInfo') {
    return { display: 'none' };
  }
  return {
    backgroundColor: colors.white,
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderTopWidth: 1,
  };
}

function tabBarStyleForMeasure(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'MeasureEntry';
  if (routeName === 'MeasureBeforeSurvey' || routeName === 'MeasureSurvey' || routeName === 'MeasureAfterSurvey' || routeName === 'SessionInsights') {
    return { display: 'none' };
  }
  if (routeName !== 'MeasureEntry' && routeName !== 'MeasureInsightsSamples') {
    return { display: 'none' };
  }
  return {
    backgroundColor: colors.white,
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderTopWidth: 1,
  };
}

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [navReady, setNavReady] = useState(false);
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);
  const [fontsLoaded, fontsError] = useFonts({
    'Sailec-Light': require('./assets/fonts/Sailec-Light.ttf'),
    'Sailec-Medium': require('./assets/fonts/Sailec-Medium.ttf'),
    'Sailec-Bold': require('./assets/fonts/Sailec-Bold.ttf'),
    'Sailec-Thin': require('./assets/fonts/Sailec-Thin.ttf'),
    'Sailec-RegularItalic': require('./assets/fonts/Sailec-RegularItalic.ttf'),
  });

  const onNavigationReady = useCallback(async () => {
    setNavReady(true);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if ((fontsLoaded || fontsError) && navReady && minSplashElapsed) {
      SplashScreen.hideAsync().catch(() => {});
      setSplashVisible(false);
    }
  }, [fontsLoaded, fontsError, navReady, minSplashElapsed]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaProvider>
        <BreathGardenProvider>
          <NavigationContainer theme={navTheme} onReady={onNavigationReady}>
            <StatusBar style="light" />
            <Tab.Navigator
              tabBar={(props) => <AppBottomTabBar {...props} />}
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: styleGuide.borderBrand,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
              }}
            >
              <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                  title: 'Home',
                  tabBarIcon: ({ color, size }) => <Home size={size ?? 24} color={color} />,
                }}
              />
              <Tab.Screen
                name="Learn"
                component={LearnTabScreen}
                options={{
                  title: 'Learn',
                  tabBarIcon: ({ color, size }) => <BookOpen size={size ?? 24} color={color} />,
                }}
              />
              <Tab.Screen
                name="Measure"
                component={MeasureStack}
                options={({ route }) => ({
                  title: 'Measure',
                  tabBarIcon: ({ color, size }) => <HeartPulse size={size ?? 24} color={color} />,
                  tabBarStyle: tabBarStyleForMeasure(route),
                })}
              />
              <Tab.Screen
                name="Play"
                component={PlayStack}
                options={({ route }) => ({
                  title: 'Play',
                  tabBarLabel: 'Play',
                  tabBarIcon: ({ color, size }) => <Gamepad2 size={size ?? 24} color={color} />,
                  tabBarStyle: tabBarStyleForPlay(route),
                })}
              />
              <Tab.Screen
                name="MyProgress"
                component={ProgressStack}
                options={{
                  title: 'My Progress',
                  tabBarIcon: ({ color, size }) => <BarChart3 size={size ?? 24} color={color} />,
                }}
              />
            </Tab.Navigator>
            <CriticalShiftAlertOverlay />
          </NavigationContainer>
        </BreathGardenProvider>
      </SafeAreaProvider>

      {splashVisible ? (
        <LinearGradient
          colors={['#C31F64', '#6B2D8B']}
          locations={[0.25, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]}
        >
          <View style={styles.splashCenter}>
            <Image
              source={require('./assets/splash-hearmath-icon.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  splashCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 26,
  },
  splashLogo: {
    width: 122,
    height: 62,
  },
});

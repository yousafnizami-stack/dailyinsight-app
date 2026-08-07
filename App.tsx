import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';
import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import SavedScreen from './screens/SavedScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditTimelinesScreen from './screens/EditTimelinesScreen';
import TextSizeScreen from './screens/TextSizeScreen';
import DisplayScreen from './screens/DisplayScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import CorrectionsPolicyScreen from './screens/CorrectionsPolicyScreen';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import { TextSizeProvider } from './lib/TextSizeContext';
import { SplashProvider } from './lib/SplashContext';

// Keep the native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  Tabs: undefined;
  ArticleDetail: {
    slug: string;
    title?: string;
    featuredImageUrl?: string;
    categoryName?: string;
    publishedAt?: string;
    author?: string;
  };
  EditTimelines: undefined;
  TextSize: undefined;
  Display: undefined;
  About: undefined;
  Contact: undefined;
  PrivacyPolicy: undefined;
  CorrectionsPolicy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#C8102E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors } = useTheme();
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#C8102E' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditTimelines"
          component={EditTimelinesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TextSize"
          component={TextSizeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Display"
          component={DisplayScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CorrectionsPolicy"
          component={CorrectionsPolicyScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });

  const [latestReady, setLatestReady] = useState(false);

  const handleLatestReady = useCallback(() => {
    setLatestReady(true);
  }, []);

  useEffect(() => {
    if (fontsLoaded && latestReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, latestReady]);

  if (!fontsLoaded) {
    return null; // Native splash stays visible while fonts load
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <TextSizeProvider>
          <SplashProvider onLatestReady={handleLatestReady}>
            <AppNavigator />
          </SplashProvider>
        </TextSizeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

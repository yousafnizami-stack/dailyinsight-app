import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
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
import React from 'react';
import { Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import SavedScreen from './screens/SavedScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';
import { ThemeProvider, useTheme } from './lib/ThemeContext';

export type RootStackParamList = {
  Tabs: undefined;
  ArticleDetail: { slug: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Saved: undefined;
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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          title: 'Saved',
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
          options={{ title: 'Article' }}
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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#C8102E' }} />;
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

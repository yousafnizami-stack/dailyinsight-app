import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './theme';

type ColorSchemeType = typeof Colors.light;
type ThemeOverride = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme_override';

interface ThemeContextValue {
  colors: ColorSchemeType;
  isDark: boolean;
  themeOverride: ThemeOverride;
  setThemeOverride: (override: ThemeOverride) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors.light,
  isDark: false,
  themeOverride: 'system',
  setThemeOverride: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverrideState] = useState<ThemeOverride>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === 'light' || val === 'dark' || val === 'system') {
          setThemeOverrideState(val);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeOverride = (override: ThemeOverride) => {
    setThemeOverrideState(override);
    AsyncStorage.setItem(STORAGE_KEY, override).catch(() => {});
  };

  const effectiveScheme = themeOverride === 'system' ? systemScheme : themeOverride;
  const isDark = effectiveScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeOverride, setThemeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

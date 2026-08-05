import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './theme';

type ColorSchemeType = typeof Colors.light;

interface ThemeContextValue {
  colors: ColorSchemeType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

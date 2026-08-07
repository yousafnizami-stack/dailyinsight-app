import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'text_font_scale';

export const TEXT_SIZE_MIN = 0.85;
export const TEXT_SIZE_MAX = 1.3;
const DEFAULT_SCALE = 1.0;

interface TextSizeContextValue {
  fontScale: number;
  setFontScale: (scale: number) => void;
}

const TextSizeContext = createContext<TextSizeContextValue>({
  fontScale: DEFAULT_SCALE,
  setFontScale: () => {},
});

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScaleState] = useState(DEFAULT_SCALE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val !== null) {
          const parsed = parseFloat(val);
          if (!isNaN(parsed)) setFontScaleState(parsed);
        }
      })
      .catch(() => {});
  }, []);

  const setFontScale = (scale: number) => {
    setFontScaleState(scale);
    AsyncStorage.setItem(STORAGE_KEY, String(scale)).catch(() => {});
  };

  return (
    <TextSizeContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize(): TextSizeContextValue {
  return useContext(TextSizeContext);
}

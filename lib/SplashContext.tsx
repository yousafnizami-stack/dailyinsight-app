import React, { createContext, useContext, useCallback, useRef } from 'react';

const SplashContext = createContext<{ markLatestReady: () => void }>({ markLatestReady: () => {} });

export function SplashProvider({
  children,
  onLatestReady,
}: {
  children: React.ReactNode;
  onLatestReady: () => void;
}) {
  const called = useRef(false);
  const markLatestReady = useCallback(() => {
    if (!called.current) {
      called.current = true;
      onLatestReady();
    }
  }, [onLatestReady]);
  return <SplashContext.Provider value={{ markLatestReady }}>{children}</SplashContext.Provider>;
}

export const useMarkLatestReady = () => useContext(SplashContext).markLatestReady;

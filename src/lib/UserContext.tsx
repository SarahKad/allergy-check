import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mode } from '../skill/skillPrompt';

const STORAGE_KEY = 'allergy-check.mode.v1';

type UserCtx = {
  mode: Mode | null;
  setMode: (m: Mode | null) => void;
};

const Ctx = createContext<UserCtx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'lily' || v === 'adult') setModeState(v);
      setHydrated(true);
    });
  }, []);

  const setMode = (m: Mode | null) => {
    setModeState(m);
    if (m) AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  if (!hydrated) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser(): UserCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUser must be used inside UserProvider');
  return v;
}

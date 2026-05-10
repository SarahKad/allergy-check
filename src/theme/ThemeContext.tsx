import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette, ThemeMode, paletteFor } from './colors';

type ThemePref = 'light' | 'dark' | 'system';

type ThemeCtx = {
  mode: ThemeMode;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  palette: Palette;
};

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = 'allergy-check.themePref.v1';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v);
      setHydrated(true);
    });
  }, []);

  const setPref = (p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
    if (p !== 'system') Appearance.setColorScheme(p);
  };

  const mode: ThemeMode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  const palette = useMemo(() => paletteFor(mode), [mode]);

  const value = useMemo(() => ({ mode, pref, setPref, palette }), [mode, pref, palette]);

  if (!hydrated) {
    // Avoid flash by rendering nothing until storage is read.
    return null;
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside ThemeProvider');
  return v;
}

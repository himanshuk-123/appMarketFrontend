import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { DARK_COLORS, LIGHT_COLORS, COLORS } from '../constants/colors';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState('dark'); // 'dark' | 'light'

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedMode = await SecureStore.getItemAsync('appureThemeMode');
      if (storedMode === 'light' || storedMode === 'dark') {
        applyThemeMode(storedMode);
      }
    } catch {
      /* default to dark */
    }
  };

  const applyThemeMode = (mode) => {
    setThemeModeState(mode);
    const activeColors = mode === 'light' ? LIGHT_COLORS : DARK_COLORS;
    Object.assign(COLORS, activeColors);
  };

  const setThemeMode = async (mode) => {
    try {
      applyThemeMode(mode);
      await SecureStore.setItemAsync('appureThemeMode', mode);
    } catch {
      /* ignore store error */
    }
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  const isDark = themeMode === 'dark';
  const theme = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ themeMode, theme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

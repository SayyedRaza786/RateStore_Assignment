import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme, darkTheme } from '../styles/GlobalStyles';

const ThemeModeContext = createContext(null);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('themeMode');
      return stored === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleMode = useCallback(() => {
    setMode(m => {
      const next = m === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeMode', next);
      }
      return next;
    });
  }, []);

  // Sync with system preference on first load if nothing stored
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('themeMode')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) setMode('dark');
    }
  }, []);

  const activeTheme = mode === 'dark' ? darkTheme : theme;

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={activeTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};

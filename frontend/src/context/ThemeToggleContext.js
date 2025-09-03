import React, { createContext, useContext } from 'react';

const ThemeToggleContext = createContext({ mode: 'light', toggleMode: () => {} });

export const ThemeToggleProvider = ({ mode, toggleMode, children }) => (
  <ThemeToggleContext.Provider value={{ mode, toggleMode }}>
    {children}
  </ThemeToggleContext.Provider>
);

export const useThemeToggle = () => useContext(ThemeToggleContext);

export default ThemeToggleContext;
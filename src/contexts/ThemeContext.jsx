/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Permanently lock to Light Mode
  const [isDark] = useState(false);

  useEffect(() => {
    // Force light mode on document
    const root = window.document.documentElement;
    root.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Empty function since theme toggling is disabled
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';

export const ThemeContext = createContext(null);

const themes = {
  dark: {
    name: 'dark',
    primary: '#06b6d4',
    background: '#020617',
    surface: '#0f172a',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#1e293b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  light: {
    name: 'light',
    primary: '#0891b2',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
};

export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('fraudtrace-theme');
      return saved && themes[saved] ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const currentTheme = themes[theme];

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('dark', 'light');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Handle Tailwind dark mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply CSS variables
    if (currentTheme) {
      Object.entries(currentTheme).forEach(([key, value]) => {
        if (key !== 'name') {
          root.style.setProperty(`--color-${key}`, value);
        }
      });
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('fraudtrace-theme', theme);
    } catch (e) {
      console.warn('Could not save theme preference');
    }

    console.log('Theme changed to:', theme); // Debug log
  }, [theme, currentTheme]);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      console.log('Toggling theme from', prevTheme, 'to', newTheme); // Debug log
      return newTheme;
    });
  }, []);

  // Set specific theme
  const setThemeByName = useCallback((name) => {
    if (themes[name]) {
      console.log('Setting theme to:', name); // Debug log
      setTheme(name);
    }
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    currentTheme,
    toggleTheme,
    setTheme: setThemeByName,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }), [theme, currentTheme, toggleTheme, setThemeByName]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
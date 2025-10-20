"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ColorTheme = 'default' | 'green' | 'purple' | 'orange' | 'teal';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    // Tenta carregar o tema salvo no localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('color-theme');
      return (savedTheme as ColorTheme) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove a classe do tema anterior
    root.classList.remove('theme-default', 'theme-green', 'theme-purple', 'theme-orange', 'theme-teal');
    // Adiciona a classe do tema atual
    root.classList.add(`theme-${colorTheme}`);
    // Salva o tema no localStorage
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
};
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

type ColorTheme = 'default' | 'nature-vet' | 'pastel-blue' | 'sweet-lilac';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  const [colorTheme, setInternalColorTheme] = useState<ColorTheme>('default');

  // This effect syncs the theme from the user's profile when it becomes available.
  // It only runs if the user's theme is different from the current state to avoid loops.
  useEffect(() => {
    const userTheme = user?.colorTheme as ColorTheme;
    if (userTheme && userTheme !== colorTheme) {
      setInternalColorTheme(userTheme);
    }
  }, [user?.colorTheme, colorTheme]); // Depend on the specific property and the local state

  // This effect applies the class to the HTML tag whenever the theme state changes.
  useEffect(() => {
    const root = window.document.documentElement;
    // Clean up old theme classes
    root.classList.forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });
    // Only add a class if it's NOT the default theme
    if (colorTheme !== 'default') {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, [colorTheme]);

  const updateColorThemeMutation = useMutation({
    mutationFn: async (newTheme: ColorTheme) => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado.");
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({ color_theme: newTheme })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update the user context. This will trigger the effect above, but it's safe.
      setUser((prevUser) => ({
        ...prevUser!,
        colorTheme: data.color_theme || undefined,
      }));
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] });
      showSuccess("Tema de cor atualizado com sucesso!");
    },
    onError: (error) => {
      showError(`Erro ao atualizar tema de cor: ${error.message}`);
    },
  });

  const setColorTheme = (theme: ColorTheme) => {
    // Update the state immediately for a responsive UI.
    setInternalColorTheme(theme);
    // If the user is logged in, save the preference to the database.
    if (user?.id) {
      updateColorThemeMutation.mutate(theme);
    }
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
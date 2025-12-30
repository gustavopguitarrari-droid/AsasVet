"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

type ColorTheme = 'nature-vet' | 'pastel-blue' | 'sweet-lilac';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  const [colorTheme, setInternalColorTheme] = useState<ColorTheme>('nature-vet');

  // This effect runs ONLY when the user object changes (e.g., on login).
  // It sets the theme from the user's profile.
  useEffect(() => {
    if (user?.colorTheme) {
      setInternalColorTheme(user.colorTheme as ColorTheme);
    }
  }, [user]); // Depend only on the user object.

  // This effect applies the class to the HTML tag whenever the theme state changes.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });
    root.classList.add(`theme-${colorTheme}`);
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
    // If the user is logged in, save the preference.
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
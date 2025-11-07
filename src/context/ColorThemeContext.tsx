"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

type ColorTheme = 'nature-vet' | 'pastel-blue'; // Tipo atualizado para incluir 'pastel-blue'

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  // Default to 'nature-vet'
  const initialTheme: ColorTheme = 'nature-vet';
  const [internalColorTheme, setInternalColorTheme] = useState<ColorTheme>(initialTheme);

  // Update internal state when user.colorTheme changes from outside (e.g., on login/profile fetch)
  useEffect(() => {
    // Always set to 'nature-vet' as it's the only available theme
    if (user?.colorTheme && user.colorTheme !== internalColorTheme) {
      setInternalColorTheme(user.colorTheme as ColorTheme);
    } else if (!user?.colorTheme && internalColorTheme !== initialTheme) {
      setInternalColorTheme(initialTheme);
    }
  }, [user?.colorTheme, internalColorTheme, initialTheme]);


  // Mutação para atualizar o tema de cor no perfil do usuário
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
      // Atualiza o contexto do usuário com o novo tema
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

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove todas as classes de tema existentes que começam com 'theme-'
    root.classList.forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });
    // Sempre adiciona a classe do tema atual
    root.classList.add(`theme-${internalColorTheme}`);
    console.log(`ColorThemeContext: Applied theme class: theme-${internalColorTheme}. Current classes:`, root.classList.value); // ADDED LOG
  }, [internalColorTheme]); // Depende do estado interno do tema

  const setColorTheme = (theme: ColorTheme) => {
    setInternalColorTheme(theme); // Update internal state immediately for UI responsiveness
    if (user?.id) {
      updateColorThemeMutation.mutate(theme);
    } else {
      showError("Faça login para salvar seu tema de cor.");
    }
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme: internalColorTheme, setColorTheme }}>
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
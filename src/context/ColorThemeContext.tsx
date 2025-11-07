"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext'; // Importar useUser
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Importar useMutation e useQueryClient
import { supabase } from '@/integrations/supabase/client'; // Importar supabase
import { showError, showSuccess } from '@/utils/toast'; // Importar toasts

type ColorTheme = 'default' | 'nature-vet'; // Adicionado o tema 'nature-vet'

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useUser(); // Obter o usuário e a função setUser do UserContext
  const queryClient = useQueryClient();

  // O tema de cor agora vem do perfil do usuário. Se não houver usuário ou tema, usa 'nature-vet' como padrão.
  const currentColorTheme: ColorTheme = (user?.colorTheme as ColorTheme) || 'nature-vet';

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
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] }); // Invalida o cache para rebuscar se necessário
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
    // Adiciona a classe do tema atual do usuário
    // Se o tema for 'nature-vet', não adiciona uma classe específica, pois é o padrão no :root
    if (currentColorTheme !== 'nature-vet') {
      root.classList.add(`theme-${currentColorTheme}`);
    }
  }, [currentColorTheme]); // Depende do tema de cor do usuário

  const setColorTheme = (theme: ColorTheme) => {
    if (user?.id) {
      updateColorThemeMutation.mutate(theme);
    } else {
      showError("Faça login para salvar seu tema de cor.");
      // Fallback para aplicar o tema visualmente mesmo sem salvar se não houver usuário
      const root = window.document.documentElement;
      root.classList.forEach(cls => {
        if (cls.startsWith('theme-')) {
          root.classList.remove(cls);
        }
      });
      if (theme !== 'nature-vet') {
        root.classList.add(`theme-${theme}`);
      }
    }
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme: currentColorTheme, setColorTheme }}>
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
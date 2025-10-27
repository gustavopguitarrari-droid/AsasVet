"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext'; // Importar useUser
import { supabase } from '@/integrations/supabase/client'; // Importar supabase
import { showError } from '@/utils/toast'; // Importar showError

type ColorTheme = 'default' | 'green' | 'purple' | 'orange' | 'teal' | 'pink' | 'brown';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user: appUser, setUser: setAppUser } = useUser(); // Obter o usuário e o setter do UserContext
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('default');
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Para controlar a aplicação inicial do tema

  // Efeito para carregar o tema do usuário quando o appUser estiver disponível
  useEffect(() => {
    if (appUser?.id && isInitialLoad) {
      const userTheme = (appUser.colorTheme as ColorTheme) || 'default';
      setColorThemeState(userTheme);
      setIsInitialLoad(false); // Marca que o carregamento inicial foi feito
    } else if (!appUser?.id && !isInitialLoad) {
      // Se o usuário deslogar, resetar para o tema padrão
      setColorThemeState('default');
      setIsInitialLoad(true); // Resetar para próximo login
    }
  }, [appUser, isInitialLoad]);

  // Efeito para aplicar a classe CSS e, se não for o carregamento inicial, salvar no Supabase
  useEffect(() => {
    const root = window.document.documentElement;
    // Remove a classe do tema anterior
    root.classList.remove('theme-default', 'theme-green', 'theme-purple', 'theme-orange', 'theme-teal', 'theme-pink', 'theme-brown');
    // Adiciona a classe do tema atual
    root.classList.add(`theme-${colorTheme}`);

    // Salvar no Supabase APENAS se o usuário estiver logado e não for o carregamento inicial
    if (appUser?.id && !isInitialLoad) {
      const saveThemeToSupabase = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ color_theme: colorTheme })
            .eq('id', appUser.id);

          if (error) {
            console.error("Erro ao salvar tema de cor no Supabase:", error);
            showError("Erro ao salvar sua preferência de tema.");
          } else {
            // Atualiza o contexto do usuário localmente após salvar no DB
            setAppUser(prevUser => prevUser ? { ...prevUser, colorTheme: colorTheme } : null);
          }
        } catch (err) {
          console.error("Erro inesperado ao salvar tema de cor:", err);
          showError("Erro inesperado ao salvar sua preferência de tema.");
        }
      };
      saveThemeToSupabase();
    }
  }, [colorTheme, appUser, isInitialLoad, setAppUser]);

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
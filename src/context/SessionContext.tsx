"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para indicar carregamento inicial
  const { setUser: setAppUser } = useUser();

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      setIsLoading(true); // Inicia o estado de carregamento para qualquer mudança de autenticação

      setSession(currentSession);
      setUserState(currentSession?.user || null);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile on SIGNED_IN:', profileError);
        }

        setAppUser({
          id: currentSession.user.id,
          name: profileData?.first_name || currentSession.user.user_metadata.first_name || '',
          lastName: profileData?.last_name || currentSession.user.user_metadata.last_name || '',
          email: currentSession.user.email || '',
          avatarUrl: profileData?.avatar_url || currentSession.user.user_metadata.avatar_url || undefined,
          role: profileData?.role || currentSession.user.user_metadata.role || 'Usuário',
          birthday: profileData?.birthday || currentSession.user.user_metadata.birthday || undefined,
          registeredTime: profileData?.registered_time || currentSession.user.created_at,
        });
      } else if (event === 'SIGNED_OUT') {
        setAppUser(null); // Limpa o usuário do contexto primeiro
      }
      setIsLoading(false); // Finaliza o estado de carregamento após todas as atualizações
    };

    // Configura o listener de mudança de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Verifica a sessão inicial
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUserState(initialSession?.user || null);
      if (initialSession) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile on initial session:', profileError);
        }
        setAppUser({
          id: initialSession.user.id,
          name: profileData?.first_name || initialSession.user.user_metadata.first_name || '',
          lastName: profileData?.last_name || initialSession.user.user_metadata.last_name || '',
          email: initialSession.user.email || '',
          avatarUrl: profileData?.avatar_url || initialSession.user.user_metadata.avatar_url || undefined,
          role: profileData?.role || initialSession.user.user_metadata.role || 'Usuário',
          birthday: profileData?.birthday || initialSession.user.user_metadata.birthday || undefined,
          registeredTime: profileData?.registered_time || initialSession.user.created_at,
        });
      } else {
        setAppUser(null); // Garante que o usuário do contexto seja nulo se não houver sessão inicial
      }
      setIsLoading(false); // Define isLoading como false após a verificação inicial
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setAppUser]);

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};
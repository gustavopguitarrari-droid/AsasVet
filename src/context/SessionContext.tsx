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
      console.log('Auth state change event:', event, 'Session:', currentSession);
      // Não definir isLoading(true) aqui. isLoading deve refletir apenas o carregamento inicial.

      setSession(currentSession);
      setUserState(currentSession?.user || null);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        try {
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
            gender: profileData?.gender || currentSession.user.user_metadata.gender || undefined,
            registeredTime: profileData?.registered_time || currentSession.user.created_at,
          });
          console.log('User profile set after SIGNED_IN.');
        } catch (error) {
          console.error('Unhandled error during profile fetch on SIGNED_IN:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setAppUser(null); // Limpa o usuário do contexto
        console.log('User signed out, appUser cleared.');
      }
      // Não definir isLoading(false) aqui. Isso é tratado pelo bloco finally de checkInitialSession.
      console.log('Auth state change processed.');
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error fetching initial session:', sessionError);
          setSession(null);
          setUserState(null);
          setAppUser(null);
        } else {
          setSession(initialSession);
          setUserState(initialSession?.user || null);
          if (initialSession) {
            try {
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
                gender: profileData?.gender || initialSession.user.user_metadata.gender || undefined,
                registeredTime: profileData?.registered_time || initialSession.user.created_at,
              });
              console.log('Initial session user profile set.');
            } catch (error) {
              console.error('Unhandled error during profile fetch on initial session:', error);
            }
          } else {
            setAppUser(null); // Garante que appUser seja nulo se não houver sessão inicial
            console.log('No initial session, appUser cleared.');
          }
        }
      } catch (error) {
        console.error('Unhandled error during initial session check:', error);
      } finally {
        setIsLoading(false); // Define isLoading como false após a verificação inicial, independentemente de sucesso/falha
        console.log('Initial session check completed, isLoading set to false.');
      }
    };

    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
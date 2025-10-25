"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean; // Indicates if initial session and profile loading is complete
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to indicate initial loading
  const { setUser: setAppUser } = useUser();

  // Helper function to fetch profile and set appUser
  const fetchProfileAndSetAppUser = async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setAppUser(null);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error('Error fetching profile:', profileError);
        // Even if profile fetch fails, set appUser with available data from auth.user
        setAppUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata.first_name || '',
          lastName: supabaseUser.user_metadata.last_name || '',
          email: supabaseUser.email || '',
          avatarUrl: supabaseUser.user_metadata.avatar_url || undefined,
          role: supabaseUser.user_metadata.role || 'Usuário',
          birthday: supabaseUser.user_metadata.birthday || undefined,
          gender: supabaseUser.user_metadata.gender || undefined,
          registeredTime: supabaseUser.created_at,
        });
      } else if (profileData) {
        setAppUser({
          id: supabaseUser.id,
          name: profileData.first_name || supabaseUser.user_metadata.first_name || '',
          lastName: profileData.last_name || supabaseUser.user_metadata.last_name || '',
          email: supabaseUser.email || '',
          avatarUrl: profileData.avatar_url || supabaseUser.user_metadata.avatar_url || undefined,
          role: profileData.role || supabaseUser.user_metadata.role || 'Usuário',
          birthday: profileData.birthday || supabaseUser.user_metadata.birthday || undefined,
          gender: profileData.gender || supabaseUser.user_metadata.gender || undefined,
          registeredTime: profileData.registered_time || supabaseUser.created_at,
        });
      } else { // No profile found (PGRST116) or other error, use auth.user metadata
        setAppUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata.first_name || '',
          lastName: supabaseUser.user_metadata.last_name || '',
          email: supabaseUser.email || '',
          avatarUrl: supabaseUser.user_metadata.avatar_url || undefined,
          role: supabaseUser.user_metadata.role || 'Usuário',
          birthday: supabaseUser.user_metadata.birthday || undefined,
          gender: supabaseUser.user_metadata.gender || undefined,
          registeredTime: supabaseUser.created_at,
        });
      }
    } catch (error) {
      console.error('Unhandled error during profile fetch:', error);
      setAppUser(null); // Fallback to null if any unhandled error occurs
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('Auth state change event:', event, 'Session:', currentSession);
      setSession(currentSession);
      setUserState(currentSession?.user || null);
      await fetchProfileAndSetAppUser(currentSession?.user || null);
      setIsLoading(false); // Set isLoading to false after all state updates
      console.log('Auth state change processed, isLoading set to false.');
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check
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
          await fetchProfileAndSetAppUser(initialSession?.user || null);
        }
      } catch (error) {
        console.error('Unhandled error during initial session check:', error);
        setSession(null);
        setUserState(null);
        setAppUser(null);
      } finally {
        setIsLoading(false); // Ensure isLoading is false after initial check
        console.log('Initial session check completed, isLoading set to false.');
      }
    };

    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run only once on mount

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
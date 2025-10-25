"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';

interface UserProfile {
  id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  birthday?: string;
  registeredTime: string;
  gender?: string;
}

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
  const isInitialLoadRef = useRef(true); // Para garantir que isLoading seja definido como false apenas uma vez

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

      const userMetadata = supabaseUser.user_metadata;

      const profileToSet: UserProfile = {
        id: supabaseUser.id,
        name: profileData?.first_name || userMetadata.first_name || '',
        lastName: profileData?.last_name || userMetadata.last_name || '',
        email: supabaseUser.email || '',
        avatarUrl: profileData?.avatar_url || userMetadata.avatar_url || undefined,
        role: profileData?.role || userMetadata.role || 'Usuário',
        birthday: profileData?.birthday || userMetadata.birthday || undefined,
        gender: profileData?.gender || userMetadata.gender || undefined,
        registeredTime: profileData?.registered_time || supabaseUser.created_at,
      };

      setAppUser(profileToSet);

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error('Error fetching profile:', profileError);
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

      // Only set isLoading to false once after the initial session is handled
      if (isInitialLoadRef.current) {
        setIsLoading(false);
        isInitialLoadRef.current = false;
        console.log('Initial auth state change processed, isLoading set to false.');
      }
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup the subscription on component unmount
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
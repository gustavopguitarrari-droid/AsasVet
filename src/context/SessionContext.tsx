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

  // Helper function to fetch profile and set appUser
  const fetchProfileAndSetAppUser = async (supabaseUser: User | null) => {
    console.log('SessionContext: [START] fetchProfileAndSetAppUser for user:', supabaseUser?.id);
    const startTime = performance.now();

    if (!supabaseUser) {
      console.log('SessionContext: No supabaseUser, setting appUser to null.');
      setAppUser(null);
      console.log('SessionContext: [END] fetchProfileAndSetAppUser (no user). Duration:', (performance.now() - startTime).toFixed(2), 'ms');
      return;
    }

    try {
      console.log('SessionContext: Attempting to fetch profile for user ID:', supabaseUser.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.warn('SessionContext: No profile found for user ID:', supabaseUser.id, '. Defaulting to metadata.');
        } else {
          console.error('SessionContext: Error fetching profile from Supabase:', profileError);
          setAppUser(null); // Clear appUser on actual profile fetch error
          console.log('SessionContext: [END] fetchProfileAndSetAppUser (profile error). Duration:', (performance.now() - startTime).toFixed(2), 'ms');
          return;
        }
      }
      console.log('SessionContext: Raw profileData from Supabase:', profileData);

      const userMetadata = supabaseUser.user_metadata;
      console.log('SessionContext: Supabase user_metadata:', userMetadata);

      const profileToSet: UserProfile = {
        id: supabaseUser.id,
        name: profileData?.first_name || userMetadata.first_name?.toString() || '',
        lastName: profileData?.last_name || userMetadata.last_name?.toString() || '',
        email: supabaseUser.email || '',
        avatarUrl: profileData?.avatar_url || userMetadata.avatar_url?.toString() || undefined,
        role: profileData?.role || userMetadata.role?.toString() || 'Usuário',
        birthday: profileData?.birthday || userMetadata.birthday?.toString() || undefined,
        gender: profileData?.gender || userMetadata.gender?.toString() || undefined,
        registeredTime: profileData?.registered_time || supabaseUser.created_at,
      };
      console.log('SessionContext: Constructed profileToSet for UserContext:', profileToSet);
      setAppUser(profileToSet);
      console.log('SessionContext: [END] fetchProfileAndSetAppUser (success). Duration:', (performance.now() - startTime).toFixed(2), 'ms');

    } catch (error) {
      console.error('SessionContext: Unhandled error during profile fetch and set:', error);
      setAppUser(null); // Fallback to null if any unhandled error occurs
      console.log('SessionContext: [END] fetchProfileAndSetAppUser (unhandled error). Duration:', (performance.now() - startTime).toFixed(2), 'ms');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initialLoadCompleted = false; // Flag to track if initial session load is done

    const loadAndSetSession = async () => {
      console.log('SessionContext: [INIT] Attempting to load initial session via getSession()...');
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('SessionContext: Error loading initial session:', sessionError);
      }

      if (!isMounted) return;

      setSession(initialSession);
      setUserState(initialSession?.user || null);
      console.log('SessionContext: Initial session loaded. Calling fetchProfileAndSetAppUser...');
      await fetchProfileAndSetAppUser(initialSession?.user || null);

      if (isMounted) {
        setIsLoading(false);
        initialLoadCompleted = true; // Mark initial load as complete
        console.log('SessionContext: [END_LOADING] isLoading set to false after initial session load.');
      }
    };

    loadAndSetSession(); // Execute once on mount for initial session

    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('SessionContext: [AUTH_STATE_CHANGE] Event:', event, 'Session present:', !!currentSession, 'isMounted:', isMounted);
      if (!isMounted) return;

      // Only process if initial load is complete OR if it's a SIGNED_OUT event
      // This prevents double-processing INITIAL_SESSION if loadAndSetSession already handled it
      // And ensures SIGNED_OUT is always handled.
      if (initialLoadCompleted || event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setSession(currentSession);
        setUserState(currentSession?.user || null);
        console.log('SessionContext: Calling fetchProfileAndSetAppUser from auth state change listener...');
        await fetchProfileAndSetAppUser(currentSession?.user || null);
        
        // Ensure isLoading is false, especially if this is the first event after a very fast initial render
        if (isMounted && isLoading) {
          setIsLoading(false);
          console.log('SessionContext: [END_LOADING] isLoading set to false after auth state change event.');
        }
      }
    };

    console.log('SessionContext: [INIT] Setting up auth state listener.');
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      console.log('SessionContext: [CLEANUP] Auth listener unsubscribed, component unmounted.');
    };
  }, []); // Empty dependency array to run only once on mount

  // Corrigido: Removido '!!appUser' pois não está definido neste escopo
  console.log('SessionContext: Render. Current isLoading:', isLoading, 'Session:', !!session, 'User:', !!user); 

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
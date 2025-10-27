"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js'; // Renomeado User do Supabase para evitar conflito
import { supabase } from '@/integrations/supabase/client';
import { useUser, User } from './UserContext'; // Importado User exportado

// Updated UserProfile to match the extended User interface in UserContext
interface UserProfile extends User {} // Agora estende a interface User exportada

interface SessionContextType {
  session: Session | null;
  user: SupabaseUser | null; // Usar SupabaseUser aqui
  isLoading: boolean; // Indicates if initial session and profile loading is complete
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUserState] = useState<SupabaseUser | null>(null); // Usar SupabaseUser aqui
  const [isLoading, setIsLoading] = useState(true); // Start as true to indicate initial loading
  const { setUser: setAppUser } = useUser();

  // Helper function to fetch profile and set appUser
  const fetchProfileAndSetAppUser = async (supabaseUser: SupabaseUser | null) => { // Usar SupabaseUser aqui
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
        name: profileData?.first_name || userMetadata.first_name?.toString() || undefined,
        lastName: profileData?.last_name || userMetadata.last_name?.toString() || undefined,
        email: supabaseUser.email || undefined,
        avatarUrl: profileData?.avatar_url || userMetadata.avatar_url?.toString() || undefined,
        role: profileData?.role || userMetadata.role?.toString() || 'Usuário',
        birthday: profileData?.birthday || userMetadata.birthday?.toString() || undefined,
        gender: profileData?.gender || userMetadata.gender?.toString() || undefined,
        phone: profileData?.phone || userMetadata.phone?.toString() || undefined,
        crmv: profileData?.crmv || userMetadata.crmv?.toString() || undefined,
        cpf: profileData?.cpf || userMetadata.cpf?.toString() || undefined,
        companyName: profileData?.company_name || userMetadata.company_name?.toString() || undefined,
        addressCep: profileData?.address_cep || userMetadata.address_cep?.toString() || undefined,
        addressStreet: profileData?.address_street || userMetadata.address_street?.toString() || undefined,
        addressNumber: profileData?.address_number || userMetadata.address_number?.toString() || undefined,
        addressComplement: profileData?.address_complement || userMetadata.address_complement?.toString() || undefined,
        addressNeighborhood: profileData?.address_neighborhood || userMetadata.address_neighborhood?.toString() || undefined,
        addressCity: profileData?.address_city || userMetadata.address_city?.toString() || undefined,
        addressState: profileData?.address_state || userMetadata.address_state?.toString() || undefined,
        colorTheme: profileData?.color_theme || userMetadata.color_theme?.toString() || undefined,
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
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('SessionContext: [AUTH_STATE_CHANGE] Event:', event, 'Session present:', !!currentSession, 'isMounted:', isMounted);
      if (!isMounted) return; // Prevent state update if component unmounted

      setSession(currentSession);
      setUserState(currentSession?.user || null);
      console.log('SessionContext: Calling fetchProfileAndSetAppUser...');
      await fetchProfileAndSetAppUser(currentSession?.user || null);

      // Set isLoading to false after the initial session is handled.
      // This will happen once for 'INITIAL_SESSION' or 'SIGNED_IN' on page load.
      if (isMounted) { // Check again before setting state
        setIsLoading(false);
        console.log('SessionContext: [END_LOADING] isLoading set to false.');
      }
    };

    console.log('SessionContext: [INIT] Setting up auth state listener. Initial isLoading:', isLoading);
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup the subscription and set isMounted to false
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
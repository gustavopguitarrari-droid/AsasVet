"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUser, User } from './UserContext';
import { useQuery } from '@tanstack/react-query'; // Import useQuery

// Updated UserProfile to match the extended User interface in UserContext
interface UserProfile extends User {}

interface SessionContextType {
  session: Session | null;
  user: SupabaseUser | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUserState] = useState<SupabaseUser | null>(null); // Renamed to avoid conflict with appUser
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Loading state for initial session fetch
  const { setUser: setAppUser } = useUser();

  // Use useQuery to fetch the user profile
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery<UserProfile | null>({
    queryKey: ['profiles', supabaseUser?.id],
    queryFn: async () => {
      if (!supabaseUser?.id) return null;
      console.log('SessionContext: [useQuery] Attempting to fetch profile for user ID:', supabaseUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('SessionContext: [useQuery] No profile found for user ID:', supabaseUser.id, '. Returning null profile.');
          return null;
        }
        console.error('SessionContext: [useQuery] Error fetching profile from Supabase:', error);
        throw error;
      }
      console.log('SessionContext: [useQuery] Raw profileData from Supabase:', data);

      // Map Supabase data to UserProfile interface
      const userMetadata = supabaseUser.user_metadata;
      
      // Ensure organization_id is always a string if present, otherwise provide a fallback
      // Prioriza o organization_id do perfil, depois dos metadados, depois o próprio ID do usuário
      const organizationId = data?.organization_id?.toString() || userMetadata.organization_id?.toString() || supabaseUser.id;
      const planName = data?.plan_name || userMetadata.plan_name?.toString() || "Vet Domiciliar"; // Default to "Vet Domiciliar"
      const isDemoMode = planName === "Vet Domiciliar"; // Determine demo mode based on plan name

      return {
        id: supabaseUser.id,
        name: data?.first_name || userMetadata.first_name?.toString() || undefined,
        lastName: data?.last_name || userMetadata.last_name?.toString() || undefined,
        email: supabaseUser.email || undefined,
        avatarUrl: data?.avatar_url || userMetadata.avatar_url?.toString() || undefined,
        logoUrl: data?.logo_url || userMetadata.logo_url?.toString() || undefined,
        role: data?.role || userMetadata.role?.toString() || 'Usuário',
        birthday: data?.birthday || userMetadata.birthday?.toString() || undefined,
        gender: data?.gender || userMetadata.gender?.toString() || undefined,
        phone: data?.phone || userMetadata.phone?.toString() || undefined,
        crmv: data?.crmv || userMetadata.crmv?.toString() || undefined,
        cpf: data?.cpf || userMetadata.cpf?.toString() || undefined,
        companyName: data?.company_name || userMetadata.company_name?.toString() || undefined,
        addressCep: data?.address_cep || userMetadata.address_cep?.toString() || undefined,
        addressStreet: data?.address_street || userMetadata.address_street?.toString() || undefined,
        addressNumber: data?.address_number || userMetadata.address_number?.toString() || undefined,
        addressComplement: data?.address_complement || userMetadata.address_complement?.toString() || undefined,
        addressNeighborhood: data?.address_neighborhood || userMetadata.address_neighborhood?.toString() || undefined,
        addressCity: data?.address_city || userMetadata.address_city?.toString() || undefined,
        addressState: data?.address_state || userMetadata.address_state?.toString() || undefined,
        colorTheme: data?.color_theme || userMetadata.color_theme?.toString() || undefined,
        planName: planName, // NOVO: Incluir plan_name
        stripeCustomerId: data?.stripe_customer_id || undefined, // NOVO: Incluir stripe_customer_id
        stripeSubscriptionId: data?.stripe_subscription_id || undefined, // NOVO: Incluir stripe_subscription_id
        registeredTime: data?.registered_time || supabaseUser.created_at,
        organizationId: organizationId, // Usar o valor garantido
        isDemoMode: isDemoMode, // NOVO: Adicionar isDemoMode
      };
    },
    enabled: !!supabaseUser?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    let isMounted = true;

    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log('SessionContext: [AUTH_STATE_CHANGE] Event:', event, 'Session present:', !!currentSession, 'isMounted:', isMounted);
      if (!isMounted) return;

      setSession(currentSession);
      setSupabaseUserState(currentSession?.user || null);

      if (isMounted) {
        setIsLoadingSession(false);
        console.log('SessionContext: [END_LOADING_SESSION] isLoadingSession set to false.');
      }
    };

    console.log('SessionContext: [INIT] Setting up auth state listener. Initial isLoadingSession:', isLoadingSession);
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      console.log('SessionContext: [CLEANUP] Auth listener unsubscribed, component unmounted.');
    };
  }, []);

  useEffect(() => {
    console.log('SessionContext: [PROFILE_DATA_CHANGE] profileData:', profileData, 'isLoadingProfile:', isLoadingProfile, 'profileError:', profileError);
    if (!isLoadingProfile && !profileError) {
      setAppUser(profileData);
    } else if (profileError) {
      console.error('SessionContext: Error setting app user from profile data:', profileError);
      setAppUser(null);
    }
  }, [profileData, isLoadingProfile, profileError, setAppUser]);

  const isLoading = isLoadingSession || isLoadingProfile;

  console.log('SessionContext: Render. Current isLoading:', isLoading, 'Session:', !!session, 'SupabaseUser:', !!supabaseUser, 'AppUser (profileData):', !!profileData);

  return (
    <SessionContext.Provider value={{ session, user: supabaseUser, isLoading }}>
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
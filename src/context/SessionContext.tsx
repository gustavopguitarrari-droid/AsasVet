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
  isAwaitingPasswordReset: boolean; // NOVO: Adicionado para rastrear o estado de recuperação
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUserState] = useState<SupabaseUser | null>(null); // Renamed to avoid conflict with appUser
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Loading state for initial session fetch
  const [isAwaitingPasswordReset, setIsAwaitingPasswordReset] = useState(false); // NOVO: Estado para rastrear a recuperação
  const { setUser: setAppUser } = useUser();

  // Use useQuery to fetch the user profile via an Edge Function to bypass CORS issues
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery<UserProfile | null>({
    queryKey: ['profile', supabaseUser?.id], // Changed queryKey to be more specific
    queryFn: async () => {
      if (!supabaseUser?.id) return null;
      console.log('SessionContext: [useQuery] Invoking get-profile function for user ID:', supabaseUser.id);
      
      // Invoke the edge function
      const { data: profileDataFromFunction, error } = await supabase.functions.invoke('get-profile');

      if (error) {
        console.error('SessionContext: [useQuery] Error invoking get-profile function:', error);
        throw error;
      }

      if (!profileDataFromFunction) {
        console.warn('SessionContext: [useQuery] get-profile function returned null profile for user ID:', supabaseUser.id);
        return null;
      }
      
      console.log('SessionContext: [useQuery] Raw profileData from function:', profileDataFromFunction);

      // Map Supabase data to UserProfile interface
      const userMetadata = supabaseUser.user_metadata;
      const data = profileDataFromFunction; // Use the data from the function
      
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
      const user = currentSession?.user || null;
      setSupabaseUserState(user);

      // NOVO: Verifica se o usuário está em um fluxo de recuperação de senha
      const amr = (user as any)?.amr;
      const isRecovery = amr?.some((entry: { method: string }) => entry.method === 'recovery') ?? false;
      setIsAwaitingPasswordReset(isRecovery);
      console.log('SessionContext: AMR check. Is recovery flow?', isRecovery);

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
    <SessionContext.Provider value={{ session, user: supabaseUser, isLoading, isAwaitingPasswordReset }}>
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
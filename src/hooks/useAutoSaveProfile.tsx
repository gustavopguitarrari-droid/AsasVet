import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/context/UserContext';

const AUTO_SAVE_INTERVAL = 10000; // 10 segundos

export const useAutoSaveProfile = (currentUser: User | null) => {
  const lastSavedUserRef = useRef<User | null>(null);

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      lastSavedUserRef.current = null; // Reset if no user
      return;
    }

    // Initialize lastSavedUserRef if it's null or a different user
    if (!lastSavedUserRef.current || lastSavedUserRef.current.id !== currentUser.id) {
      lastSavedUserRef.current = { ...currentUser };
    }

    const intervalId = setInterval(async () => {
      if (!currentUser || !currentUser.id) return;

      // Compare current user state with last saved state
      const hasChanges = Object.keys(currentUser).some(key => {
        const userKey = key as keyof User;
        // Compare values, handling undefined/null consistently
        return (lastSavedUserRef.current?.[userKey] ?? null) !== (currentUser[userKey] ?? null);
      });

      if (hasChanges) {
        console.log('Auto-saving profile changes for user:', currentUser.id);
        try {
          // Prepare data for Supabase update, mapping context keys to DB column names
          const updates = {
            first_name: currentUser.name,
            last_name: currentUser.lastName,
            email: currentUser.email,
            avatar_url: currentUser.avatarUrl,
            role: currentUser.role,
            birthday: currentUser.birthday,
            gender: currentUser.gender,
            phone: currentUser.phone,
            crmv: currentUser.crmv,
            cpf: currentUser.cpf,
            company_name: currentUser.companyName,
            address_cep: currentUser.addressCep,
            address_street: currentUser.addressStreet,
            address_number: currentUser.addressNumber,
            address_complement: currentUser.addressComplement,
            address_neighborhood: currentUser.addressNeighborhood,
            address_city: currentUser.addressCity,
            address_state: currentUser.addressState,
            color_theme: currentUser.colorTheme,
            logo_url: currentUser.logoUrl, // Adicionado o campo logo_url aqui
            // updated_at is handled by a database trigger
          };

          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);

          if (error) {
            console.error('Auto-save failed:', error.message);
          } else {
            console.log('Profile auto-saved successfully.');
            lastSavedUserRef.current = { ...currentUser }; // Update last saved state
          }
        } catch (err: any) {
          console.error('Unhandled error during auto-save:', err.message);
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(intervalId); // Cleanup on unmount or currentUser change
  }, [currentUser]); // Re-run effect if currentUser object reference changes
};
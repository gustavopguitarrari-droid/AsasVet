"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Briefcase, Cake, Clock, Plus } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { format, parseISO, differenceInMonths, differenceInYears, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Import new editable components
import EditableField from "@/components/EditableField";
import EditableRoleField from "@/components/EditableRoleField";
import EditableBirthdayField from "@/components/EditableBirthdayField";
import ProfilePictureUploadDialog from "@/components/ProfilePictureUploadDialog"; // Importar o novo diálogo

import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importar useMutation e useQueryClient
import { supabase } from "@/integrations/supabase/client"; // Importar o cliente Supabase
import { showError, showSuccess } from "@/utils/toast"; // Importar toasts
import { useAutoSaveProfile } from "@/hooks/useAutoSaveProfile"; // Importar o novo hook de auto-save

const Profile = () => {
  const { user, setUser } = useUser();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Integrate auto-save hook
  useAutoSaveProfile(user);

  // Mutation para atualizar o perfil no Supabase
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { [key: string]: any }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Atualiza o contexto do usuário com os novos dados, convertendo null para undefined
      setUser((prevUser) => ({
        ...prevUser!,
        name: data.first_name || undefined,
        lastName: data.last_name || undefined,
        email: data.email || undefined,
        avatarUrl: data.avatar_url || undefined,
        role: data.role || undefined,
        birthday: data.birthday || undefined,
        gender: data.gender || undefined,
        phone: data.phone || undefined,
        crmv: data.crmv || undefined,
        cpf: data.cpf || undefined,
        companyName: data.company_name || undefined,
        addressCep: data.address_cep || undefined,
        addressStreet: data.address_street || undefined,
        addressNumber: data.address_number || undefined,
        addressComplement: data.address_complement || undefined,
        addressNeighborhood: data.address_neighborhood || undefined,
        addressCity: data.address_city || undefined,
        addressState: data.address_state || undefined,
        colorTheme: data.color_theme || undefined,
      }));
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] }); // Invalida o cache para rebuscar se necessário
      showSuccess("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      showError(`Erro ao atualizar perfil: ${error.message}`);
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhum usuário logado.</p>
      </div>
    );
  }

  // Handlers for individual field saves
  const handleSaveName = (newName: string) => {
    updateProfileMutation.mutate({ first_name: newName });
  };

  const handleSaveLastName = (newLastName: string) => {
    updateProfileMutation.mutate({ last_name: newLastName });
  };

  const handleSaveEmail = (newEmail: string) => {
    updateProfileMutation.mutate({ email: newEmail });
  };

  const handleSaveRole = (newRole: string) => {
    // Esta função não será chamada se o campo for readOnly, mas é mantida por segurança
    console.warn("Tentativa de salvar cargo diretamente do perfil. Ação bloqueada.");
    showError("A alteração de cargo não é permitida diretamente no perfil.");
  };

  const handleSaveBirthday = (newBirthday?: string) => {
    updateProfileMutation.mutate({ birthday: newBirthday });
  };

  const handleSaveAvatar = (newAvatarUrl: string) => {
    updateProfileMutation.mutate({ avatar_url: newAvatarUrl || null }); // Salva null se a URL for vazia
  };

  let timeInCompany = "N/A";
  if (user.registeredTime) {
    const registrationDate = parseISO(user.registeredTime);
    const now = new Date();
    const years = differenceInYears(now, registrationDate);
    const months = differenceInMonths(now, registrationDate) % 12;

    if (years > 0 && months > 0) {
      timeInCompany = `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months > 1 ? 'es' : ''}`;
    } else if (years > 0) {
      timeInCompany = `${years} ano${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      timeInCompany = `${months} mês${months > 1 ? 'es' : ''}`;
    } else {
      timeInCompany = "Menos de um mês";
    }
  }

  // Calcular as iniciais de forma mais robusta
  const firstNameInitial = user.name ? user.name.charAt(0) : '';
  const lastNameInitial = user.lastName ? user.lastName.charAt(0) : '';
  const initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="profile-header-art-bg text-primary-foreground p-6 flex flex-col items-center text-center">
          <Tooltip delayDuration={0}> {/* Adicionado Tooltip */}
            <TooltipTrigger asChild>
              <div
                className="relative group cursor-pointer"
                onClick={() => setIsUploadDialogOpen(true)} // Abre o diálogo de upload ao clicar no avatar
              >
                <Avatar className="h-28 w-28 mb-3 border-4 border-primary-foreground shadow-lg group-hover:border-primary transition-colors">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-primary-foreground text-primary text-4xl font-bold">
                      {initials} {/* Exibe as iniciais aqui */}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Adicionar/Mudar foto
            </TooltipContent>
          </Tooltip>
          <CardTitle className="text-3xl font-bold">{user.name} {user.lastName}</CardTitle>
          <p className="text-primary-foreground/80 text-lg">{user.email}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <EditableField
              label="Nome"
              value={user.name || ''} // Fornecer string vazia como fallback
              onSave={handleSaveName}
              icon={UserIcon}
            />
            <EditableField
              label="Sobrenome"
              value={user.lastName || ''} // Fornecer string vazia como fallback
              onSave={handleSaveLastName}
              icon={UserIcon}
            />
            <EditableField
              label="E-mail"
              value={user.email || ''} // Fornecer string vazia como fallback
              onSave={handleSaveEmail}
              icon={Mail}
              type="email"
            />
            <EditableRoleField
              label="Cargo"
              value={user.role || ''} // Fornecer string vazia como fallback
              onSave={handleSaveRole}
              readOnly={true} // Bloqueia a edição do cargo no perfil
            />
            <EditableBirthdayField
              label="Aniversário"
              value={user.birthday}
              onSave={handleSaveBirthday}
            />
            {/* Time in Company is not editable, so it remains a static display */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-4">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-base font-medium text-muted-foreground">Tempo na Empresa:</p>
              </div>
              <p className="text-base font-semibold">{timeInCompany}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfilePictureUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        onSave={handleSaveAvatar}
      />
    </div>
  );
};

export default Profile;
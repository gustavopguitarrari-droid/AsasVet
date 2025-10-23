"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Briefcase, Cake, Clock, Plus } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { format, parseISO, differenceInMonths, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Importar Tooltip components

// Import new editable components
import EditableField from "@/components/EditableField";
import EditableRoleField from "@/components/EditableRoleField";
import EditableBirthdayField from "@/components/EditableBirthdayField";
import ProfilePictureUploadDialog from "@/components/ProfilePictureUploadDialog"; // Importar o novo diálogo

const Profile = () => {
  const { user, setUser } = useUser();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false); // Novo estado para o diálogo de upload

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhum usuário logado.</p>
      </div>
    );
  }

  // Handlers for individual field saves
  const handleSaveName = (newName: string) => {
    setUser({ ...user, name: newName });
  };

  const handleSaveLastName = (newLastName: string) => {
    setUser({ ...user, lastName: newLastName });
  };

  const handleSaveEmail = (newEmail: string) => {
    setUser({ ...user, email: newEmail });
  };

  const handleSaveRole = (newRole: string) => {
    setUser({ ...user, role: newRole });
  };

  const handleSaveBirthday = (newBirthday?: string) => {
    setUser({ ...user, birthday: newBirthday });
  };

  const handleSaveAvatar = (newAvatarUrl: string) => {
    setUser({ ...user, avatarUrl: newAvatarUrl || undefined }); // Define como undefined se a URL for vazia
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

  // Calcular as iniciais
  const initials = `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

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
              value={user.name}
              onSave={handleSaveName}
              icon={UserIcon}
            />
            <EditableField
              label="Sobrenome"
              value={user.lastName}
              onSave={handleSaveLastName}
              icon={UserIcon}
            />
            <EditableField
              label="E-mail"
              value={user.email}
              onSave={handleSaveEmail}
              icon={Mail}
              type="email"
            />
            <EditableRoleField
              label="Cargo"
              value={user.role}
              onSave={handleSaveRole}
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
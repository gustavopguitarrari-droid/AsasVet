"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, Briefcase, Cake, Clock, Edit } from "lucide-react";
import { useUser } from "@/context/UserContext";
import ProfileForm, { ProfileFormValues } from "@/components/ProfileForm";
import { format, parseISO, differenceInMonths, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar o modo de edição

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Nenhum usuário logado.</p>
      </div>
    );
  }

  const handleSaveProfile = (data: ProfileFormValues) => {
    setUser({
      ...user,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      avatarUrl: data.avatarUrl || undefined,
      role: data.role,
      birthday: data.birthday ? format(data.birthday, "yyyy-MM-dd") : undefined,
    });
    setIsEditing(false); // Sai do modo de edição após salvar
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Sai do modo de edição sem salvar
  };

  const formattedBirthday = user.birthday ? format(parseISO(user.birthday), "dd/MM/yyyy", { locale: ptBR }) : "N/A";
  
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Meu Perfil</h2>
        {/* O botão "Editar Perfil" foi removido. A edição é ativada ao clicar nas informações. */}
      </div>

      <Card className="overflow-hidden"> {/* Adicionado overflow-hidden para cantos arredondados */}
        <CardHeader className="bg-primary text-primary-foreground p-6 flex flex-col items-center text-center">
          <Avatar className="h-28 w-28 mb-3 border-4 border-primary-foreground shadow-lg"> {/* Avatar maior, com borda */}
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-primary-foreground text-primary">
                <UserIcon className="h-14 w-14" />
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-3xl font-bold">{user.name} {user.lastName}</CardTitle>
          <p className="text-primary-foreground/80 text-lg">{user.email}</p>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <ProfileForm
              initialData={{
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl || "",
                role: user.role,
                birthday: user.birthday ? parseISO(user.birthday) : undefined,
              }}
              onSubmit={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="space-y-4">
              {/* Área clicável para entrar no modo de edição */}
              <div
                className="group cursor-pointer rounded-md transition-colors duration-200"
                onClick={() => setIsEditing(true)}
              >
                <div className="flex items-center justify-between p-3 border-b border-border group-hover:bg-accent/50">
                  <div className="flex items-center space-x-4">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <p className="text-base font-medium text-muted-foreground">Nome Completo:</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-semibold">{user.name} {user.lastName}</p>
                    <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-b border-border group-hover:bg-accent/50">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-base font-medium text-muted-foreground">E-mail:</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-semibold">{user.email}</p>
                    <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-b border-border group-hover:bg-accent/50">
                  <div className="flex items-center space-x-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <p className="text-base font-medium text-muted-foreground">Cargo:</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-semibold">{user.role}</p>
                    <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-b border-border group-hover:bg-accent/50">
                  <div className="flex items-center space-x-4">
                    <Cake className="h-5 w-5 text-primary" />
                    <p className="text-base font-medium text-muted-foreground">Aniversário:</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-semibold">{formattedBirthday}</p>
                    <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 group-hover:bg-accent/50"> {/* Sem borda inferior para o último item */}
                  <div className="flex items-center space-x-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-base font-medium text-muted-foreground">Tempo na Empresa:</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-semibold">{timeInCompany}</p>
                    <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
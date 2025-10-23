"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, Edit, Briefcase, Cake, Clock } from "lucide-react";
import { useUser } from "@/context/UserContext";
import ProfileEditDialog, { ProfileFormValues } from "@/components/ProfileEditDialog";
import { format, parseISO, differenceInMonths, differenceInYears } from "date-fns"; // Importar differenceInMonths e differenceInYears
import { ptBR } from "date-fns/locale";

const Profile = () => {
  const { user, setUser } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      gender: data.gender,
      avatarUrl: data.avatarUrl || undefined,
      role: data.role,
      birthday: data.birthday ? format(data.birthday, "yyyy-MM-dd") : undefined,
    });
  };

  const formattedBirthday = user.birthday ? format(parseISO(user.birthday), "dd/MM/yyyy", { locale: ptBR }) : "N/A";
  
  // Calcular o tempo na empresa
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
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Editar Perfil
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-center text-center pt-8">
          <Avatar className="h-32 w-32 mb-4">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-muted">
                <UserIcon className="h-16 w-16 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
          <CardTitle className="text-2xl font-bold">{user.name} {user.lastName}</CardTitle>
          <p className="text-muted-foreground">{user.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center space-x-4">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">Nome Completo:</p>
            <p className="flex-1 text-lg">{user.name} {user.lastName}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">E-mail:</p>
            <p className="flex-1 text-lg">{user.email}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">Gênero:</p>
            <p className="flex-1 text-lg capitalize">{user.gender}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">Cargo:</p>
            <p className="flex-1 text-lg">{user.role}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <Cake className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">Aniversário:</p>
            <p className="flex-1 text-lg">{formattedBirthday}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">Tempo na Empresa:</p>
            <p className="flex-1 text-lg">{timeInCompany}</p>
          </div>
        </CardContent>
      </Card>

      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={{
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          gender: user.gender,
          avatarUrl: user.avatarUrl || "",
          role: user.role,
          birthday: user.birthday ? parseISO(user.birthday) : undefined,
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, Edit } from "lucide-react"; // Usando UserIcon genérico
import { useUser } from "@/context/UserContext";
import ProfileEditDialog, { ProfileFormValues } from "@/components/ProfileEditDialog";

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
      name: data.name,
      email: data.email,
      gender: data.gender,
      avatarUrl: data.avatarUrl || undefined,
    });
  };

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
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center space-x-4">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">Nome:</p>
            <p className="flex-1 text-lg">{user.name}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium">E-mail:</p>
            <p className="flex-1 text-lg">{user.email}</p>
          </div>
          <Separator />
          <div className="flex items-center space-x-4">
            <UserIcon className="h-5 w-5 text-muted-foreground" /> {/* Usando UserIcon genérico para gênero */}
            <p className="text-lg font-medium">Gênero:</p>
            <p className="flex-1 text-lg capitalize">{user.gender}</p>
          </div>
        </CardContent>
      </Card>

      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={{
          name: user.name,
          email: user.email,
          gender: user.gender,
          avatarUrl: user.avatarUrl || "",
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;
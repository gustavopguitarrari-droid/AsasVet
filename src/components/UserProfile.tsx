"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Settings, UserCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/utils/toast";

const UserProfile = () => {
  const { user: appUser, setUser } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao deslogar:", error.message);
      if (error.message.includes("Auth session missing!")) {
        // A sessão já foi perdida. O usuário está efetivamente deslogado.
        // Apenas precisamos atualizar o estado da UI para refletir isso.
        console.warn("Tentativa de logout com sessão ausente. Forçando atualização da UI.");
        setUser(null); // Limpa o usuário do UserContext
        queryClient.clear(); // Limpa o cache do react-query
        navigate('/login', { replace: true }); // Navega para o login
        showSuccess("Você foi desconectado.");
      } else {
        showError(`Erro ao deslogar: ${error.message}`);
      }
    } else {
      // Em caso de sucesso, o listener onAuthStateChange no SessionContext cuidará de tudo.
      showSuccess("Você foi desconectado com sucesso.");
    }
  };

  if (!appUser) {
    return (
      <Button variant="ghost" onClick={() => navigate("/login")} className="rounded-lg">
        Login
      </Button>
    );
  }

  // Calcular as iniciais de forma mais robusta
  const firstNameInitial = appUser.name ? appUser.name.charAt(0) : '';
  const lastNameInitial = appUser.lastName ? appUser.lastName.charAt(0) : '';
  const initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {appUser.avatarUrl ? (
              <AvatarImage src={appUser.avatarUrl} alt={appUser.name} />
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-bold">
                {initials} {/* Exibe as iniciais aqui */}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-lg shadow-md" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{appUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {appUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="rounded-md"
          onSelect={() => navigate("/profile")} // Use onSelect for navigation
        >
          <UserCircle className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        {appUser.role === "Administrador" && ( // Renderiza "Configurações" apenas para Administradores
          <DropdownMenuItem 
            className="rounded-md"
            onSelect={() => navigate("/settings")} // Use onSelect for navigation
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center rounded-md">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
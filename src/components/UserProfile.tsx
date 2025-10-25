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
import { User as UserIcon, LogOut, Settings, UserCircle } from "lucide-react"; // Adicionado UserCircle para o link de perfil
import { useUser } from "@/context/UserContext";
import { Link, useNavigate } from "react-router-dom"; // Importar useNavigate
import { supabase } from "@/integrations/supabase/client"; // Importar o cliente Supabase

const UserProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao deslogar:", error.message);
      // Opcional: mostrar um toast de erro
    } else {
      console.log("Usuário deslogado!");
      // O SessionContext já lida com setUser(null) e o redirecionamento para /login
    }
  };

  if (!user) {
    return (
      <Button variant="ghost" onClick={() => navigate("/login")}>
        Login
      </Button>
    );
  }

  // Calcular as iniciais de forma mais robusta
  const firstNameInitial = user.name ? user.name.charAt(0) : '';
  const lastNameInitial = user.lastName ? user.lastName.charAt(0) : '';
  const initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-bold">
                {initials} {/* Exibe as iniciais aqui */}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end"> {/* Removido forceMount */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
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
import { useUser } from "@/context/UserContext"; // Importar useUser
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const { user: appUser, setUser } = useUser(); // Obter o usuário com o cargo do UserContext
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

  if (!appUser) { // Usar appUser aqui
    return (
      <Button variant="ghost" onClick={() => navigate("/login")} className="rounded-lg"> {/* Adicionado rounded-lg */}
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
      <DropdownMenuContent className="w-56 rounded-lg shadow-md" align="end"> {/* Adicionado rounded-lg e shadow-md */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{appUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {appUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-md"> {/* Adicionado rounded-md */}
          <Link to="/profile" className="flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        {appUser.role === "Administrador" && ( // Renderiza "Configurações" apenas para Administradores
          <DropdownMenuItem asChild className="rounded-md"> {/* Adicionado rounded-md */}
            <Link to="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center rounded-md"> {/* Adicionado rounded-md */}
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
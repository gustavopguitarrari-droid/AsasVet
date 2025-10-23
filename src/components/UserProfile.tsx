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
import { User as UserIcon } from "lucide-react"; // Renomeado para evitar conflito
import { useUser } from "@/context/UserContext"; // Importa o hook useUser
import { Link } from "react-router-dom"; // Importar Link para navegação

const UserProfile = () => {
  const { user, setUser } = useUser(); // Usa o contexto do usuário

  const handleLogout = () => {
    console.log("Usuário deslogado!");
    setUser(null); // Limpa os dados do usuário ao deslogar
    // Lógica de logout aqui (redirecionar para login, limpar tokens, etc.)
  };

  if (!user) {
    // Renderiza um botão de login ou um placeholder se não houver usuário
    return (
      <Button variant="ghost" onClick={() => console.log("Login clicked")}>
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
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
          <Link to="/profile">Perfil</Link> {/* Link para a nova página de perfil */}
        </DropdownMenuItem>
        <DropdownMenuItem>
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
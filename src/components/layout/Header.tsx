import React from "react";
import { useLocation } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeToggle from "@/components/ColorThemeToggle";

const Header = () => {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case "/painel":
        return "Painel";
      case "/clientes": // Rota atualizada para /clientes
        return "Clientes"; // Título atualizado
      case "/pets":
        return "Cadastro de animais";
      case "/appointments":
        return "Consultas";
      case "/medical-records":
        return "Agenda";
      case "/financeiro":
        return "Financeiro";
      case "/caixa":
        return "Caixa";
      case "/internacao":
        return "Internação";
      case "/veterinarios":
        return "Equipe";
      case "/estoque":
        return "Estoque";
      default:
        return "Simples Vet";
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-background p-4 shadow-sm">
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      <div className="flex items-center space-x-2">
        <ColorThemeToggle />
        <ThemeToggle />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
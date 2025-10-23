import React from "react";
import { useLocation } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle"; // Importar o ThemeToggle existente
import ColorThemeToggle from "@/components/ColorThemeToggle"; // Importar o novo ColorThemeToggle

const Header = () => {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case "/painel":
        return "Painel";
      case "/clients":
        return "Clientes";
      case "/pets":
        return "Cadastro de animais"; // Título atualizado aqui
      case "/appointments":
        return "Consultas";
      case "/medical-records":
        return "Agenda"; // Título atualizado
      case "/financeiro":
        return "Financeiro";
      case "/caixa":
        return "Caixa";
      case "/internacao":
        return "Internação";
      case "/veterinarios":
        return "Equipe"; // Título atualizado
      case "/estoque": // Novo título para Estoque
        return "Estoque";
      default:
        return "Simples Vet";
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-background p-4 shadow-sm">
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      <div className="flex items-center space-x-2">
        <ColorThemeToggle /> {/* Adicionado o seletor de tema de cor */}
        <ThemeToggle /> {/* Mantido o alternador de modo claro/escuro */}
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
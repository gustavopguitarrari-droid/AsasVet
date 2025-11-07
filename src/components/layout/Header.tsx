"use client";

import React from "react";
import { useLocation, Link } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeToggle from "@/components/ColorThemeToggle";
import LiveClockCalendar from "@/components/LiveClockCalendar";
import { usePageTitle } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";

interface HeaderProps { 
  // Removido: layoutDirection?: "horizontal" | "vertical";
  // Removido: isNavCollapsed: boolean; // Nova prop
  // Removido: onToggleNav: () => void; // Nova prop
}

const Header: React.FC<HeaderProps> = () => { // Props removidas
  const location = useLocation();
  const { pageTitle } = usePageTitle();

  const getTitle = () => {
    if (pageTitle) {
      return pageTitle;
    }
    if (location.pathname.startsWith("/consultation/")) {
      return "Consulta em Andamento";
    }
    switch (location.pathname) {
      case "/painel":
        return "Painel";
      case "/cadastro":
        return "Cadastro";
      case "/consultas":
        return "Consultas";
      case "/medical-records":
        return "Agenda";
      case "/financeiro":
        return "Financeiro";
      case "/internacao":
        return "Internação";
      case "/veterinarios":
        return "Equipe";
      case "/products":
        return "Produtos e Serviços";
      case "/estoque":
        return "Estoque";
      case "/profile":
        return "Perfil";
      case "/settings":
        return "Configurações";
      default:
        return "AsasVet";
    }
  };

  return (
    <header className={cn(
      "flex items-center justify-between border-b bg-background py-4 pr-4 shadow-sm", // Alterado p-4 para py-4 pr-4
      "rounded-bl-xl rounded-tr-xl" // Adicionado rounded-bl-xl e rounded-tr-xl
    )}>
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      <div className="flex items-center space-x-2">
        <LiveClockCalendar />
        <ColorThemeToggle />
        <ThemeToggle />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
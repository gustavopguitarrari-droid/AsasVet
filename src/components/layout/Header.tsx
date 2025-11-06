"use client";

import React from "react";
import { useLocation } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle"; // Importar o ThemeToggle existente
import ColorThemeToggle from "@/components/ColorThemeToggle"; // Importar o novo ColorThemeToggle
import LiveClockCalendar from "@/components/LiveClockCalendar"; // Importar o novo LiveClockCalendar
import { usePageTitle } from "@/context/PageTitleContext"; // NOVO: Importar usePageTitle
import { cn } from "@/lib/utils"; // Importar cn

interface HeaderProps {
  // NOVO: Adiciona a prop layoutDirection para controle condicional
  layoutDirection?: "horizontal" | "vertical"; 
}

const Header: React.FC<HeaderProps> = ({ layoutDirection }) => {
  const location = useLocation();
  const { pageTitle } = usePageTitle(); // NOVO: Obter o título do contexto

  const getTitle = () => {
    // Se um título específico da página for definido via contexto, use-o
    if (pageTitle) {
      return pageTitle;
    }
    // Caso contrário, use a lógica padrão baseada no pathname
    if (location.pathname.startsWith("/consultation/")) {
      return "Consulta em Andamento";
    }
    switch (location.pathname) {
      case "/painel":
        return "Painel";
      case "/cadastro": // Novo título para Cadastro
        return "Cadastro";
      case "/consultas":
        return "Consultas"; // Manter como base para a página de Consultas
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
      case "/products": // NEW: Title for Products page
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
      "flex items-center justify-between border-b bg-background p-4 shadow-sm",
      layoutDirection === "vertical" ? "h-16" : "h-auto"
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
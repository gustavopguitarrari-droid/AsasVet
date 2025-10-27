"use client";

import React from "react";
import { useLocation } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle"; // Importar o ThemeToggle existente
import ColorThemeToggle from "@/components/ColorThemeToggle"; // Importar o novo ColorThemeToggle
import LiveClockCalendar from "@/components/LiveClockCalendar"; // Importar o novo LiveClockCalendar

const Header = () => {
  const location = useLocation();
  const getTitle = () => {
    // Verifica se a rota começa com /consultation/
    if (location.pathname.startsWith("/consultation/")) {
      return "Consulta em Andamento";
    }
    switch (location.pathname) {
      case "/painel":
        return "Painel";
      case "/cadastro": // Novo título para Cadastro
        return "Cadastro";
      case "/consultas":
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
      case "/profile":
        return "Perfil";
      case "/settings":
        return "Configurações";
      default:
        return "AsasVet";
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-background p-4 shadow-sm">
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      <div className="flex items-center space-x-2">
        <LiveClockCalendar /> {/* Adicionado o LiveClockCalendar aqui */}
        <ColorThemeToggle />
        <ThemeToggle />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
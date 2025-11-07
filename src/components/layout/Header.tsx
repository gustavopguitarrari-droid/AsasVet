"use client";

import React from "react";
import { useLocation, Link } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeToggle from "@/components/ColorThemeToggle";
import LiveClockCalendar from "@/components/LiveClockCalendar";
import { usePageTitle } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";
import { allNavItems } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpToLine, ArrowDownToLine } from "lucide-react"; // Importar os ícones de seta para cima/baixo

interface HeaderProps { 
  layoutDirection?: "horizontal" | "vertical";
  isNavCollapsed: boolean; // Nova prop
  onToggleNav: () => void; // Nova prop
}

const Header: React.FC<HeaderProps> = ({ isNavCollapsed, onToggleNav }) => {
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
      "flex flex-col border-b bg-background p-4 shadow-sm",
      "h-auto"
    )}>
      <div className={cn(
        "flex items-center justify-between w-full",
        "mb-2"
      )}>
        <h1 className="text-2xl font-semibold">{getTitle()}</h1>
        <div className="flex items-center space-x-2">
          <LiveClockCalendar />
          <ColorThemeToggle />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>

      {/* Navegação horizontal */}
      <div className={cn(
        "flex items-center border-t pt-2 mt-2 border-muted-foreground/20 transition-all duration-300 ease-in-out",
        isNavCollapsed ? "h-14" : "h-auto", // Ajusta a altura do contêiner quando recolhido
        "bg-secondary" // Adiciona o fundo ao contêiner da navegação
      )}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleNav}
              className="h-10 w-10 flex-shrink-0 mr-2"
            >
              {isNavCollapsed ? (
                <ArrowDownToLine className="h-5 w-5" /> // Ícone para expandir
              ) : (
                <ArrowUpToLine className="h-5 w-5" /> // Ícone para recolher
              )}
              <span className="sr-only">{isNavCollapsed ? "Expandir Navegação" : "Recolher Navegação"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isNavCollapsed ? "Expandir Navegação" : "Recolher Navegação"}
          </TooltipContent>
        </Tooltip>

        <nav className={cn(
          "flex flex-row space-x-2 overflow-x-auto overflow-y-hidden whitespace-nowrap w-full px-2 py-1 transition-all duration-300 ease-in-out",
          isNavCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-screen opacity-100 pointer-events-auto"
        )}>
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "h-10 px-3 text-base text-foreground flex-shrink-0",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Link to={item.path} className="flex items-center">
                      <item.icon className="h-5 w-5 mr-2" strokeWidth={2} />
                      <span className="uppercase">{item.name}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{item.name}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
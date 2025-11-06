"use client";

import React from "react";
import { useLocation, Link } from "react-router-dom"; // Import Link
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";
import ColorThemeToggle from "@/components/ColorThemeToggle";
import LiveClockCalendar from "@/components/LiveClockCalendar";
import { usePageTitle } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";
import { allNavItems } from "./Sidebar"; // Import allNavItems
import { Button } from "@/components/ui/button"; // Import Button
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip

interface HeaderProps {
  layoutDirection?: "horizontal" | "vertical";
}

const Header: React.FC<HeaderProps> = ({ layoutDirection }) => {
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

  const isVerticalLayout = layoutDirection === "vertical";

  return (
    <header className={cn(
      "flex items-center justify-between border-b bg-background p-4 shadow-sm",
      isVerticalLayout ? "flex-col h-auto py-2" : "h-auto" // Ajusta o cabeçalho para layout vertical
    )}>
      <div className={cn(
        "flex items-center justify-between w-full",
        isVerticalLayout && "mb-2"
      )}>
        <h1 className="text-2xl font-semibold">{getTitle()}</h1>
        <div className="flex items-center space-x-2">
          <LiveClockCalendar />
          <ColorThemeToggle />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>

      {isVerticalLayout && (
        <nav className="flex flex-row space-x-2 overflow-x-auto overflow-y-hidden whitespace-nowrap w-full px-2 py-1 border-t pt-2 mt-2 border-muted-foreground/20">
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
      )}
    </header>
  );
};

export default Header;
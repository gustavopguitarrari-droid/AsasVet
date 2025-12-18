"use client";

import React from "react";
import { useLocation, Link } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ColorThemeToggle from "@/components/ColorThemeToggle";
import LiveClockCalendar from "@/components/LiveClockCalendar";
import { usePageTitle } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  onCashierClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCashierClick }) => {
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
      "flex items-center justify-between border-b bg-background p-4 shadow-sm",
      "rounded-bl-xl rounded-tr-xl"
    )}>
      <h1 className="text-2xl font-semibold">{getTitle()}</h1>
      <div className="flex items-center space-x-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              className="h-9 rounded-lg bg-green-600 text-white hover:bg-green-700"
              onClick={onCashierClick}
            >
              <ShoppingCart className="h-[1.2rem] w-[1.2rem] mr-2" />
              CAIXA
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Abrir Caixa
          </TooltipContent>
        </Tooltip>
        <LiveClockCalendar />
        <ColorThemeToggle />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
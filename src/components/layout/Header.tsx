"use client";

import React from "react";
import { useLocation, Link } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import ColorThemeToggle from "@/components/ColorThemeToggle";
import LiveClockCalendar from "@/components/LiveClockCalendar";
import { usePageTitle } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onCashierClick: () => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCashierClick, onMenuClick }) => {
  const location = useLocation();
  const { pageTitle } = usePageTitle();
  const isMobile = useIsMobile();

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
      <div className="flex items-center gap-2">
        {isMobile && (
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
        )}
        <h1 className="text-xl md:text-2xl font-semibold">{getTitle()}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              className="h-9 rounded-lg bg-green-600 text-white hover:bg-green-700"
              onClick={onCashierClick}
            >
              <ShoppingCart className="h-[1.2rem] w-[1.2rem] md:mr-2" />
              <span className="hidden md:inline">CAIXA</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Abrir Caixa
          </TooltipContent>
        </Tooltip>
        {!isMobile && <LiveClockCalendar />}
        <ColorThemeToggle />
        <UserProfile />
      </div>
    </header>
  );
};

export default Header;
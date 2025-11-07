"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users, 
  PawPrint, // Importado PawPrint
  CalendarDays,
  ClipboardList,
  DollarSign,
  Plus,
  Stethoscope,
  ArrowLeftToLine,
  ArrowRightToLine,
  ReceiptText,
  Package,
  Tag,
  // Settings, // Removido o ícone Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

export const allNavItems: NavItem[] = [
  { name: "Painel", icon: LayoutDashboard, path: "/painel" },
  { name: "Consultas", icon: ClipboardList, path: "/consultas" },
  { name: "Internação", icon: Plus, path: "/internacao" },
  { name: "Cadastro", icon: PawPrint, path: "/cadastro" },
  { name: "Agenda", icon: CalendarDays, path: "/medical-records" },
  { name: "Equipe", icon: Stethoscope, path: "/veterinarios" },
  { name: "Produtos", icon: Tag, path: "/products" },
  { name: "Estoque", icon: Package, path: "/estoque" },
  { name: "Financeiro", icon: DollarSign, path: "/financeiro" },
  // { name: "Configurações", icon: Settings, path: "/settings" }, // Removido o item de configurações
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user } = useUser();

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar text-sidebar-foreground",
      "transition-all duration-300 ease-in-out",
      "w-full", // Alterado para w-full para preencher o ResizablePanel
      "rounded-r-xl" // Adicionado rounded-r-xl para cantos arredondados
    )}>
      {/* Logo e Título */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border", // Adicionado border-sidebar-border
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <Link to="/painel" className="flex items-center">
          {/* Removido: <img src="/public/images/logooficial.png" alt="AsasVet Logo" className="h-8 w-auto" /> */}
          <PawPrint className={cn("h-10 w-10 text-sidebar-foreground", !isCollapsed && "mr-2")} strokeWidth={3} /> {/* Ícone sempre visível, ajusta margem */}
          {!isCollapsed && <span className="text-2xl font-bold text-sidebar-foreground whitespace-nowrap">AsasVet</span>}
        </Link>
      </div>

      {/* Itens de Navegação */}
      <nav className="flex-1 flex flex-col p-2 space-y-1 overflow-y-auto">
        {allNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          // Conteúdo do Link, garantindo que seja sempre um único elemento ou um Fragment
          const linkChildren = isCollapsed ? (
            <item.icon className="h-14 w-14" strokeWidth={3} />
          ) : (
            <>
              <item.icon className="h-14 w-14 mr-4" strokeWidth={3} />
              <span className="whitespace-nowrap">{item.name}</span>
            </>
          );

          const buttonContent = (
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start h-12 rounded-lg", // Aumentado h-10 para h-12
                "text-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", // Aumentado text-base para text-lg
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                isCollapsed ? "px-0 justify-center" : "px-3"
              )}
            >
              <Link to={item.path} className="flex items-center w-full">
                {linkChildren}
              </Link>
            </Button>
          );

          return isCollapsed ? (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          ) : (
            <React.Fragment key={item.name}>{buttonContent}</React.Fragment>
          );
        })}
      </nav>

      {/* Botão de Colapso */}
      <div className="p-2 border-t border-sidebar-border"> {/* Adicionado border-sidebar-border */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="w-full h-10 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" // Adicionado rounded-lg
            >
              {isCollapsed ? (
                <ArrowRightToLine className="h-5 w-5" strokeWidth={3} />
              ) : (
                <ArrowLeftToLine className="h-5 w-5" strokeWidth={3} />
              )}
              <span className="sr-only">{isCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}</span>
            </Button>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">{isCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;
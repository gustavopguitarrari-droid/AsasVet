"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users, 
  PawPrint,
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
  Settings,
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
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user: appUser } = useUser();

  const filteredNavItems = React.useMemo(() => {
    if (!appUser) {
      return [];
    }
    return allNavItems;
  }, [appUser]);

  return (
    <div className={cn(
      "relative flex flex-col h-full p-4 border-r shadow-sm transition-all duration-300 ease-in-out",
      "w-full sidebar-gradient-bg text-sidebar-foreground"
    )}>
      {/* Header do Sidebar: Logo/Título e Botão de Recolher */}
      <div className={cn(
        "flex items-center mb-6",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/painel" className={cn(
          "flex items-center text-sidebar-foreground cursor-pointer",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <img src="/public/images/logooficial.png" alt="AsasVet Logo" className={cn(
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "h-12 w-auto" : "h-16 w-auto",
            !isCollapsed && "mr-3"
          )} />
          {!isCollapsed && (
            <span className="text-2xl font-bold opacity-100 transition-opacity duration-300 ease-in-out">AsasVet</span>
          )}
        </Link>
        <Button
          variant="default"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-full",
            "border border-sidebar-border shadow-md",
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "hidden" : "block" // Esconde o botão quando recolhido
          )}
        >
          <ArrowLeftToLine className="h-4 w-4" />
        </Button>
      </div>

      {/* Botão de Recolher/Expandir (visível apenas quando recolhido) */}
      {isCollapsed && (
        <div className="flex justify-center mb-6">
          <Button
            variant="default"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "rounded-full",
              "border border-sidebar-border shadow-md",
              "transition-all duration-300 ease-in-out"
            )}
          >
            <ArrowRightToLine className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Itens de Navegação */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full text-sidebar-foreground",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "h-12 w-12 rounded-full flex items-center justify-center p-0" : "justify-start text-base py-2 px-3", // Ajustado tamanho e padding
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <Link to={item.path} className="flex items-center w-full">
                    <div className={cn(
                      "flex items-center justify-center flex-shrink-0",
                      isCollapsed ? "h-6 w-6" : "h-6 w-6 mr-3" // Ícone um pouco menor
                    )}>
                      <item.icon className="h-full w-full" strokeWidth={2} />
                    </div>
                    {!isCollapsed && (
                      <span className={cn(
                        isActive && "text-sidebar-primary-foreground",
                        "uppercase text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300 ease-in-out"
                      )}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
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
      "relative flex flex-col h-full p-4 border-r sidebar-gradient-bg text-sidebar-foreground shadow-sm transition-all duration-300 ease-in-out",
      isCollapsed ? "w-[80px]" : "w-[280px]"
    )}>
      {/* Logo e Título */}
      <Link to="/painel" className={cn(
        "flex items-center text-sidebar-foreground cursor-pointer mb-6",
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
                    isCollapsed ? "h-14 w-14 rounded-full flex items-center justify-center p-0" : "justify-start text-xl py-6 px-4",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <Link to={item.path} className="flex items-center w-full">
                    <div className={cn(
                      "flex items-center justify-center flex-shrink-0",
                      isCollapsed ? "h-8 w-8" : "h-8 w-8 mr-3"
                    )}>
                      <item.icon className="h-6 w-6" strokeWidth={2} />
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

      {/* Seção do Rodapé (apenas o botão de recolher permanece aqui) */}
      <div className={cn(
        "mt-auto pt-4 border-t border-sidebar-border flex flex-col",
        isCollapsed ? "items-center" : "items-stretch"
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-end", // Alinhado à direita quando expandido
          "mb-4"
        )}>
          <Button
            variant="default"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "rounded-full",
              "border border-sidebar-border shadow-md",
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "ml-0" : "ml-auto" // Ajusta a margem para centralizar/alinhar
            )}
          >
            {isCollapsed ? <ArrowRightToLine className="h-4 w-4" /> : <ArrowLeftToLine className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
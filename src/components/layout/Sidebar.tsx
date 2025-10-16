import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileText,
  Stethoscope,
  DollarSign,
  Bed,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  {
    name: "Painel",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Clientes",
    icon: Users,
    path: "/clients",
  },
  {
    name: "Animais",
    icon: PawPrint,
    path: "/pets",
  },
  {
    name: "Consultas",
    icon: CalendarDays,
    path: "/appointments",
  },
  {
    name: "Prontuários",
    icon: FileText,
    path: "/medical-records",
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
  },
  {
    name: "Caixa",
    icon: DollarSign,
    path: "/caixa",
  },
  {
    name: "Internação",
    icon: Bed,
    path: "/internacao",
  },
  {
    name: "Veterinários",
    icon: UserCog,
    path: "/veterinarios",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <div className="relative flex h-full flex-col overflow-y-auto border-r sidebar-gradient-bg p-4 text-sidebar-foreground shadow-sm">
      <div
        className={cn(
          "mb-6 flex items-center justify-center text-4xl font-bold text-sidebar-primary",
        )}
      >
        {!isCollapsed && "AsasVet"}{" "}
        <Stethoscope className={cn("h-9 w-9", !isCollapsed && "ml-2")} />
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Tooltip key={item.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "text-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  // Estilos quando NÃO recolhido
                  !isCollapsed && "w-full justify-start",
                  // Estilos quando RECOLHIDO: torna o botão redondo e centralizado
                  isCollapsed && "h-9 w-9 rounded-full mx-auto p-0",
                  location.pathname === item.path &&
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                )}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center",
                    isCollapsed && "justify-center w-full h-full" // Centraliza o conteúdo do link quando recolhido
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full",
                      "w-9 h-9", // Tamanho fixo para o círculo (ajustado para h-9 w-9)
                      !isCollapsed && "mr-3", // Margem à direita quando não recolhido
                      location.pathname === item.path
                        ? "bg-sidebar-primary" // Cor do círculo quando ativo
                        : "bg-sidebar-accent" // Cor padrão do círculo
                    )}
                  >
                    <item.icon className="h-6 w-6" /> {/* Ícone dentro do círculo */}
                  </div>
                  {!isCollapsed && item.name}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>

      {/* Theme Toggle no canto inferior esquerdo */}
      <div className={cn("mt-auto pt-4", isCollapsed ? "flex justify-center" : "flex justify-start")}>
        <ThemeToggle isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;
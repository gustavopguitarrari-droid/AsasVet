import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileText,
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
    activeBgClass: "bg-sidebar-item-bg-1",
  },
  {
    name: "Clientes",
    icon: Users,
    path: "/clients",
    activeBgClass: "bg-sidebar-item-bg-2",
  },
  {
    name: "Animais",
    icon: PawPrint,
    path: "/pets",
    activeBgClass: "bg-sidebar-item-bg-3",
  },
  {
    name: "Consultas",
    icon: CalendarDays,
    path: "/appointments",
    activeBgClass: "bg-sidebar-item-bg-4",
  },
  {
    name: "Prontuários",
    icon: FileText,
    path: "/medical-records",
    activeBgClass: "bg-sidebar-item-bg-5",
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
    activeBgClass: "bg-sidebar-item-bg-6",
  },
  {
    name: "Caixa",
    icon: DollarSign,
    path: "/caixa",
    activeBgClass: "bg-sidebar-item-bg-7",
  },
  {
    name: "Internação",
    icon: Bed,
    path: "/internacao",
    activeBgClass: "bg-sidebar-item-bg-8",
  },
  {
    name: "Veterinários",
    icon: UserCog,
    path: "/veterinarios",
    activeBgClass: "bg-sidebar-item-bg-9",
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
        <PawPrint className={cn("h-9 w-9", !isCollapsed && "ml-2")} strokeWidth={2.5} />
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Tooltip key={item.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "text-sidebar-foreground", // Cor do texto padrão
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", // Estado de hover para o botão
                  isCollapsed
                    ? "h-10 w-10 rounded-full flex items-center justify-center" // Estilo do botão quando recolhido
                    : "w-full justify-start text-xl", // Estilo do botão quando expandido
                  isCollapsed && location.pathname === item.path && item.activeBgClass, // Botão recolhido e ativo: o próprio botão recebe a cor de fundo
                  isCollapsed && location.pathname === item.path && "text-sidebar-primary-foreground", // Botão recolhido e ativo: cor do texto
                  !isCollapsed && location.pathname === item.path && "text-sidebar-primary-foreground" // Expandido e ativo: cor do texto
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      !isCollapsed && "w-10 h-10 rounded-full mr-3", // Tamanho e forma do div interno quando expandido
                      !isCollapsed && item.activeBgClass // SEMPRE aplica a cor de fundo específica quando expandido
                    )}
                  >
                    <item.icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  {!isCollapsed && (
                    <span className={cn(location.pathname === item.path && "text-sidebar-primary-foreground")}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>

      <div className={cn("mt-auto pt-4", isCollapsed ? "flex justify-center" : "flex justify-start")}>
        <ThemeToggle isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;
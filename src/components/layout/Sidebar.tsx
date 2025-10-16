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
                  "w-full justify-start text-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center",
                  location.pathname === item.path &&
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  // Sobrescreve a cor de fundo do botão para o item "Painel" quando ativo
                  location.pathname === "/dashboard" && item.path === "/dashboard" && "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full",
                      "w-10 h-10",
                      !isCollapsed && "mr-3",
                      // Lógica para a cor do círculo do ícone
                      location.pathname === item.path
                        ? item.path === "/dashboard"
                          ? "bg-blue-500" // Azul para o Painel quando ativo
                          : "bg-sidebar-primary" // Cor padrão para outros itens ativos
                        : "bg-sidebar-accent" // Cor padrão para itens inativos
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  {!isCollapsed && item.name}
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
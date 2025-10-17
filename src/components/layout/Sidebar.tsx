import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileText,
  DollarSign,
  Ambulance, // Ícone alterado de Bed para Ambulance
  UserCog,
  ArrowLeftToLine, // Importar ícones para o botão
  ArrowRightToLine, // Importar ícones para o botão
  ReceiptText, // Novo ícone para Caixa
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
    icon: ReceiptText, // Ícone atualizado para ReceiptText
    path: "/caixa",
    activeBgClass: "bg-sidebar-item-bg-7",
  },
  {
    name: "Internação",
    icon: Ambulance, // Ícone alterado para Ambulance
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
          "mb-6 flex items-center justify-center text-4xl font-bold text-white",
        )}
      >
        {!isCollapsed && "AsasVet"}{" "}
        <PawPrint className={cn("h-9 w-9 text-white", !isCollapsed && "ml-2")} strokeWidth={2.5} />
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Tooltip key={item.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "text-sidebar-foreground",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed
                    ? "h-10 w-10 rounded-full flex items-center justify-center"
                    : "w-full justify-start text-xl",
                  isCollapsed && item.activeBgClass,
                  isCollapsed && "text-sidebar-primary-foreground",
                  !isCollapsed && location.pathname === item.path && "text-sidebar-primary-foreground"
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      !isCollapsed && "w-10 h-10 rounded-full mr-3",
                      !isCollapsed && item.activeBgClass
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

      <div
        className={cn(
          "mt-auto pt-4 flex items-center",
          isCollapsed ? "justify-center space-x-2" : "justify-between"
        )}
      >
        <ThemeToggle isCollapsed={isCollapsed} />
        <Button
          variant="default"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-full",
            "bg-indigo-500 text-white hover:bg-indigo-600",
            "border border-border shadow-md",
            isCollapsed && "ml-2"
          )}
        >
          {isCollapsed ? <ArrowRightToLine className="h-4 w-4" /> : <ArrowLeftToLine className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays, // Usado para Agenda
  ClipboardList, // Novo ícone para Consultas
  DollarSign,
  Plus,
  Stethoscope,
  ArrowLeftToLine,
  ArrowRightToLine,
  ReceiptText,
  Package,
  HeartPulse, // Novo ícone para Enfermeiros
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import ThemeToggle from "@/components/ThemeToggle"; // Removido

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  {
    name: "Painel",
    icon: LayoutDashboard,
    path: "/dashboard",
    // activeBgClass: "bg-sidebar-item-bg-1", // Removido
  },
  {
    name: "Consultas",
    icon: ClipboardList, // Ícone atualizado para ClipboardList
    path: "/appointments",
    // activeBgClass: "bg-sidebar-item-bg-4", // Removido
  },
  {
    name: "Internação",
    icon: Plus,
    path: "/internacao",
    // activeBgClass: "bg-sidebar-item-bg-6", // Removido
  },
  {
    name: "Animais",
    icon: PawPrint,
    path: "/pets",
    // activeBgClass: "bg-sidebar-item-bg-3", // Removido
  },
  {
    name: "Equipe",
    icon: Stethoscope,
    path: "/veterinarios",
    // activeBgClass: "bg-sidebar-item-bg-9", // Removido
  },
  {
    name: "Enfermeiros", // Novo item de navegação
    icon: HeartPulse, // Ícone para Enfermeiros
    path: "/enfermeiros",
  },
  {
    name: "Agenda",
    icon: CalendarDays, // Ícone atualizado para CalendarDays
    path: "/medical-records",
    // activeBgClass: "bg-sidebar-item-bg-5", // Removido
  },
  {
    name: "Estoque",
    icon: Package,
    path: "/estoque",
    // activeBgClass: "bg-sidebar-item-bg-8", // Pode ser ajustado conforme a paleta
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
    // activeBgClass: "bg-sidebar-item-bg-2", // Removido
  },
  {
    name: "Caixa",
    icon: ReceiptText,
    path: "/caixa",
    // activeBgClass: "bg-sidebar-item-bg-7", // Removido
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <div className="relative flex h-full flex-col overflow-y-auto border-r sidebar-gradient-bg p-4 text-sidebar-foreground shadow-sm">
      <Link to="/dashboard" className="mb-6 flex items-center justify-center text-4xl font-bold text-white cursor-pointer">
        {!isCollapsed && "AsasVet"}{" "}
        <PawPrint className={cn("h-10 w-10 text-white", !isCollapsed && "ml-2")} strokeWidth={2.5} />
      </Link>
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
                    ? "h-12 w-12 rounded-full flex items-center justify-center" // Aumentado para h-12 w-12
                    : "w-full justify-start text-xl",
                  location.pathname === item.path && "bg-sidebar-primary text-sidebar-primary-foreground" // Usando cores dinâmicas
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      !isCollapsed && "w-12 h-12 rounded-full mr-3", // Aumentado para w-12 h-12
                      location.pathname === item.path && "bg-sidebar-primary" // Usando cores dinâmicas
                    )}
                  >
                    <item.icon className="h-7 w-7" strokeWidth={3} /> {/* Aumentado para h-7 w-7 e strokeWidth={3} */}
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
          isCollapsed ? "justify-center" : "justify-end"
        )}
      >
        <Button
          variant="default" // Usará a cor --primary do tema
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-full",
            "border border-border shadow-md",
            isCollapsed ? "ml-0" : "ml-auto"
          )}
        >
          {isCollapsed ? <ArrowRightToLine className="h-4 w-4" /> : <ArrowLeftToLine className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
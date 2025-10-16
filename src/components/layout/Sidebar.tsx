import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileText,
  Stethoscope,
  DollarSign, // Novo ícone para Financeiro/Caixa
  Bed, // Novo ícone para Internação
  UserCog, // Novo ícone para Veterinários
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle"; // Importa o ThemeToggle

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void; // Mantemos a prop, mas não a usamos diretamente aqui
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
        <Stethoscope className={cn("h-9 w-9", !isCollapsed && "ml-2")} strokeWidth={2.5} />
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
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" // Fundo e texto para item ativo
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", // Fundo e texto para hover
                  isCollapsed
                    ? "h-10 w-10 rounded-full flex items-center justify-center" // Quando recolhido: botão redondo e centralizado
                    : "w-full justify-start text-xl" // Quando expandido: largura total, alinhado à esquerda, texto maior
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      !isCollapsed && "w-10 h-10 rounded-full mr-3", // Apenas aplica tamanho, forma e margem quando expandido
                      !isCollapsed && (location.pathname === item.path
                        ? "bg-sidebar-primary" // Aplica fundo ao div interno apenas quando expandido
                        : "bg-sidebar-accent")
                    )}
                  >
                    <item.icon className="h-6 w-6" strokeWidth={2.5} />
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

      {/* O botão de recolher/expandir foi movido para o componente Layout.tsx */}
    </div>
  );
};

export default Sidebar;
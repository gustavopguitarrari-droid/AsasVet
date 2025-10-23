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
  // BookUser, // Removido: Ícone para a categoria Cadastros
  // ChevronDown, // Removido: Ícone para o menu expansível
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// Removido: import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string; // Path agora é obrigatório para todos os itens
  // subItems?: NavItem[]; // Removido: Não há mais sub-itens neste nível
}

const navItems: NavItem[] = [
  {
    name: "Painel",
    icon: LayoutDashboard,
    path: "/painel",
  },
  { name: "Animais", icon: PawPrint, path: "/pets" }, // Movido de volta para o nível superior
  { name: "Equipe", icon: Stethoscope, path: "/veterinarios" }, // Movido de volta para o nível superior
  { name: "Tutores", icon: Users, path: "/clients" }, // Movido de volta para o nível superior
  {
    name: "Consultas",
    icon: ClipboardList,
    path: "/consultas",
  },
  {
    name: "Internação",
    icon: Plus,
    path: "/internacao",
  },
  {
    name: "Agenda",
    icon: CalendarDays,
    path: "/medical-records",
  },
  {
    name: "Estoque",
    icon: Package,
    path: "/estoque",
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
  },
  {
    name: "Caixa",
    icon: ReceiptText,
    path: "/caixa",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  // Estados e efeitos relacionados a Collapsible foram removidos, pois não há mais menus expansíveis.

  return (
    <div className="relative flex h-full flex-col overflow-y-auto border-r sidebar-gradient-bg p-4 text-sidebar-foreground shadow-sm">
      <Link to="/painel" className="mb-6 flex items-center justify-center text-4xl font-bold text-white cursor-pointer">
        {!isCollapsed && "AsasVet"}{" "}
        <PawPrint className={cn("h-10 w-10 text-white", !isCollapsed && "ml-2")} strokeWidth={2.5} />
      </Link>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          // Agora todos os itens são renderizados como links diretos
          return (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "text-sidebar-foreground",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed
                      ? "h-14 w-14 rounded-full flex items-center justify-center"
                      : "w-full justify-start text-xl",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <Link to={item.path} className="flex items-center">
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        !isCollapsed && "w-14 h-14 rounded-full mr-3",
                        isActive && "bg-sidebar-primary"
                      )}
                    >
                      <item.icon className="h-8 w-8" strokeWidth={3.5} />
                    </div>
                    {!isCollapsed && (
                      <span className={cn(isActive && "text-sidebar-primary-foreground")}>
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
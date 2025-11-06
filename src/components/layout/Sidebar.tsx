import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users, 
  PawPrint, // Ícone de pata de animal
  CalendarDays, // Usado para Agenda
  ClipboardList, // Ícone para Consultas
  DollarSign,
  Plus,
  Stethoscope,
  ArrowLeftToLine,
  ArrowRightToLine,
  ReceiptText,
  Package,
  Tag, // NEW: Import Tag icon for Products
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext"; // Importar useUser
import ThemeToggle from "@/components/ThemeToggle"; // Importar ThemeToggle
import ColorThemeToggle from "@/components/ColorThemeToggle"; // Importar ColorThemeToggle
import LiveClockCalendar from "@/components/LiveClockCalendar"; // Importar LiveClockCalendar
import UserProfile from "@/components/UserProfile"; // Importar UserProfile

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

// Todos os itens de navegação disponíveis
const allNavItems: NavItem[] = [
  {
    name: "Painel",
    icon: LayoutDashboard,
    path: "/painel",
  },
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
    name: "Cadastro",
    icon: PawPrint,
    path: "/cadastro",
  },
  {
    name: "Agenda",
    icon: CalendarDays,
    path: "/medical-records",
  },
  { name: "Equipe", icon: Stethoscope, path: "/veterinarios" },
  {
    name: "Produtos", // NEW: Products item
    icon: Tag, // Using Tag icon
    path: "/products",
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
  // Removido o item "Caixa"
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  layoutDirection: "horizontal" | "vertical"; // NOVO: Prop para a direção do layout
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, layoutDirection }) => {
  const location = useLocation();
  const { user: appUser } = useUser(); // Obter o usuário com o cargo do UserContext

  // Filtra os itens de navegação para mostrar todos se o usuário estiver autenticado
  const filteredNavItems = React.useMemo(() => {
    if (!appUser) {
      return []; // Não mostra nada se o usuário não estiver carregado
    }
    return allNavItems; // Todos os usuários autenticados veem todos os itens
  }, [appUser]);

  const isVerticalLayout = layoutDirection === "vertical";

  return (
    <div className={cn(
      "relative flex h-full overflow-y-auto border-r sidebar-gradient-bg p-4 text-sidebar-foreground shadow-sm",
      isVerticalLayout ? "flex-row items-center justify-between w-full h-full overflow-x-auto overflow-y-hidden" : "flex-col"
    )}>
      <Link to="/painel" className={cn(
        "flex items-center text-sidebar-foreground cursor-pointer",
        isVerticalLayout ? "flex-shrink-0 mr-4" : "mb-6 justify-center"
      )}>
        <img src="/images/logooficial.png" alt="AsasVet Logo" className={cn(
          isVerticalLayout ? "h-16 w-auto" : (isCollapsed ? "h-20 w-auto" : "h-24 w-auto") // Aumentado para h-16, h-20, h-24
        )} />
      </Link>
      <nav className={cn(
        "flex-1",
        isVerticalLayout ? "flex flex-row space-x-2 overflow-x-auto overflow-y-hidden whitespace-nowrap px-2" : "space-y-2"
      )}>
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "text-sidebar-foreground",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isVerticalLayout ? "h-10 px-3 text-base" : (isCollapsed ? "h-14 w-14 rounded-full flex items-center justify-center" : "w-full justify-start text-xl"),
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <Link to={item.path} className={cn("flex items-center", isVerticalLayout && "flex-col justify-center h-full")}>
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        isVerticalLayout ? "h-6 w-6" : (!isCollapsed && "w-14 h-14 rounded-full mr-3"),
                        isActive && "bg-sidebar-primary"
                      )}
                    >
                      <item.icon className={cn(isVerticalLayout ? "h-5 w-5" : "h-8 w-8")} strokeWidth={isVerticalLayout ? 2 : 3.5} />
                    </div>
                    {!isCollapsed && (
                      <span className={cn(isActive && "text-sidebar-primary-foreground", isVerticalLayout && "text-xs mt-1", "uppercase")}>
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

      {isVerticalLayout ? (
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <LiveClockCalendar />
          <ColorThemeToggle />
          <ThemeToggle />
          <UserProfile />
        </div>
      ) : (
        <div
          className={cn(
            "mt-auto pt-4 flex items-center",
            isCollapsed ? "justify-center" : "justify-end"
          )}
        >
          <Button
            variant="default"
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
      )}
    </div>
  );
};

export default Sidebar;
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileText,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle"; // Importa o ThemeToggle

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  {
    name: "Dashboard",
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
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <div className="relative flex h-full flex-col overflow-y-auto border-r sidebar-gradient-bg p-4 text-sidebar-foreground shadow-sm">
      <div
        className={cn(
          "mb-6 flex items-center justify-center text-4xl font-bold text-sidebar-primary", // Aumentado para text-4xl
        )}
      >
        {!isCollapsed && "AsasVet"}{" "}
        <Stethoscope className={cn("h-9 w-9", !isCollapsed && "ml-2")} /> {/* Aumentado para h-9 w-9 */}
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Tooltip key={item.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start text-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", // Aumentado para text-xl
                  isCollapsed && "justify-center",
                  location.pathname === item.path &&
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                )}
              >
                <Link to={item.path} className="flex items-center">
                  <item.icon className={cn("h-8 w-8", !isCollapsed && "mr-3")} /> {/* Aumentado para h-8 w-8 */}
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

      {/* Botão de recolher/expandir a sidebar */}
      <Button
        variant="default"
        size="icon"
        onClick={onToggleCollapse}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full z-10",
          isCollapsed ? "left-0 right-0 mx-auto" : "right-4",
        )}
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default Sidebar;
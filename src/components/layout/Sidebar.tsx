import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileText,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const authItems = [
  {
    name: "Login",
    icon: LogIn,
    path: "/login",
  },
  {
    name: "Registrar",
    icon: UserPlus,
    path: "/register",
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-sidebar-background p-4 text-sidebar-foreground shadow-sm">
      <div className="mb-6 text-center text-2xl font-bold text-sidebar-primary">
        Simples Vet
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.name}
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              location.pathname === item.path &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            )}
          >
            <Link to={item.path}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto space-y-2 border-t pt-4">
        <p className="text-sm text-muted-foreground">Autenticação</p>
        {authItems.map((item) => (
          <Button
            key={item.name}
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              location.pathname === item.path &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            )}
          >
            <Link to={item.path}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
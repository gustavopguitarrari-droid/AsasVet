"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users, 
  PawPrint,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Plus,
  Stethoscope,
  ArrowLeftToLine,
  ArrowRightToLine,
  ReceiptText,
  Package,
  Tag,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

export const allNavItems: NavItem[] = [
  { name: "Painel", icon: LayoutDashboard, path: "/painel" },
  { name: "Consultas", icon: ClipboardList, path: "/consultas" },
  { name: "Internação", icon: Plus, path: "/internacao" },
  { name: "Cadastro", icon: PawPrint, path: "/cadastro" },
  { name: "Agenda", icon: CalendarDays, path: "/medical-records" },
  { name: "Equipe", icon: Stethoscope, path: "/veterinarios" },
  { name: "Produtos", icon: Tag, path: "/products" },
  { name: "Estoque", icon: Package, path: "/estoque" },
  { name: "Financeiro", icon: DollarSign, path: "/financeiro" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// O componente Sidebar agora é um componente vazio, pois a navegação é apenas superior.
const Sidebar: React.FC<SidebarProps> = () => {
  return null;
};

export default Sidebar;
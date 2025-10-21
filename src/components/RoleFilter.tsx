"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ListFilter, Stethoscope, User, Briefcase, GraduationCap } from "lucide-react"; // Importado GraduationCap

interface RoleOption {
  name: string;
  icon: React.ElementType;
  colorClass: string;
  value: string;
}

const roleOptions: RoleOption[] = [
  { name: "Todos", icon: ListFilter, colorClass: "bg-gray-500", value: "all" },
  { name: "Veterinário", icon: Stethoscope, colorClass: "bg-sidebar-item-bg-1", value: "Veterinário" },
  { name: "Recepcionista", icon: User, colorClass: "bg-sidebar-item-bg-4", value: "Recepcionista" },
  { name: "Gerente", icon: Briefcase, colorClass: "bg-sidebar-item-bg-3", value: "Gerente" },
  { name: "Estagiário", icon: GraduationCap, colorClass: "bg-sidebar-item-bg-7", value: "Estagiário" }, // Ícone atualizado aqui
  // Adicione mais cargos conforme necessário
];

interface RoleFilterProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
}

const RoleFilter: React.FC<RoleFilterProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {roleOptions.map((role) => (
        <Tooltip key={role.value} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full text-white transition-all duration-200",
                role.colorClass,
                selectedRole === role.value
                  ? "ring-2 ring-offset-2 ring-current scale-110"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => onSelectRole(role.value)}
            >
              <role.icon className="h-6 w-6" />
              <span className="sr-only">{role.name}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{role.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default RoleFilter;
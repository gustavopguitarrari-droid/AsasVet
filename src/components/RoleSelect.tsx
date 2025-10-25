"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Removido: import { FormControl } from "@/components/ui/form"; // Não é necessário aqui

interface RoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const mockRoles = [
  "Administrador", // Adicionado o cargo de Administrador
  "Veterinário",
  "Enfermeiro",
  "Recepcionista",
  "Gerente",
  "Estagiário",
  "Outro",
];

const RoleSelect: React.FC<RoleSelectProps> = ({ value, onValueChange }) => {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      {/* FormControl removido daqui */}
      <SelectTrigger>
        <SelectValue placeholder="Selecione o cargo" />
      </SelectTrigger>
      <SelectContent>
        {mockRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RoleSelect;
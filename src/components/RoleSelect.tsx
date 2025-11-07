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

// Removido 'Administrador' da lista de cargos disponíveis para seleção
const mockRoles = [
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
      <SelectTrigger className="rounded-lg">
        <SelectValue placeholder="Selecione o cargo" />
      </SelectTrigger>
      <SelectContent className="rounded-lg shadow-md">
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
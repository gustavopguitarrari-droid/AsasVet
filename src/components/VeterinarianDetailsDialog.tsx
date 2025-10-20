"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Stethoscope, User, Briefcase, Hospital, Mail, Phone, IdCard } from "lucide-react";

interface Veterinario {
  id: string;
  name: string;
  crmv: string;
  email: string;
  phone: string;
  role: string; // Adicionado campo de cargo
}

interface VeterinarianDetailsDialogProps {
  veterinarian: Veterinario | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mapeamento de cargos para ícones
const roleIconMap: { [key: string]: React.ElementType } = {
  Veterinário: Stethoscope,
  Recepcionista: User,
  Gerente: Briefcase,
  Estagiário: Hospital,
  Outros: IdCard, // Ícone padrão para outros cargos
};

const VeterinarianDetailsDialog: React.FC<VeterinarianDetailsDialogProps> = ({ veterinarian, isOpen, onClose }) => {
  if (!veterinarian) return null;

  const IconComponent = roleIconMap[veterinarian.role] || IdCard;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconComponent className="h-6 w-6 mr-2 text-muted-foreground" />
            Detalhes da Equipe: {veterinarian.name}
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre {veterinarian.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">ID:</p>
            <p className="col-span-2 text-sm">{veterinarian.id}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Nome:</p>
            <p className="col-span-2 text-sm font-bold">{veterinarian.name}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Cargo:</p>
            <p className="col-span-2 text-sm flex items-center">
              <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
              {veterinarian.role}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">CRMV:</p>
            <p className="col-span-2 text-sm">{veterinarian.crmv}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Email:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              {veterinarian.email}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Telefone:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              {veterinarian.phone}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VeterinarianDetailsDialog;
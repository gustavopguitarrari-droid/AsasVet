"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Stethoscope, User, Briefcase, Hospital, Mail, Phone, IdCard, Edit, Trash2, HeartPulse } from "lucide-react"; // Adicionado HeartPulse
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TeamMember } from "@/pages/Veterinarios"; // Importar a interface TeamMember

interface VeterinarianDetailsDialogProps {
  veterinarian: Omit<TeamMember, 'first_name' | 'last_name' | 'avatar_url'> & { name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string, memberName: string) => void;
  isAdmin: boolean;
  currentUserId?: string;
}

// Mapeamento de cargos para ícones
const roleIconMap: { [key: string]: React.ElementType } = {
  Administrador: Briefcase,
  Veterinário: Stethoscope,
  Recepcionista: User,
  Gerente: Briefcase,
  Estagiário: Hospital,
  Enfermeiro: HeartPulse, // Ícone atualizado para HeartPulse
  Outros: IdCard, // Ícone padrão para outros cargos
};

const VeterinarianDetailsDialog: React.FC<VeterinarianDetailsDialogProps> = ({
  veterinarian,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isAdmin,
  currentUserId,
}) => {
  if (!veterinarian) return null;

  const IconComponent = roleIconMap[veterinarian.role] || IdCard;

  // Converte o objeto 'veterinarian' para o formato 'TeamMember' para passar para onEdit
  const teamMemberData: TeamMember = {
    id: veterinarian.id,
    first_name: veterinarian.name.split(' ')[0] || '',
    last_name: veterinarian.name.split(' ').slice(1).join(' ') || '',
    email: veterinarian.email,
    phone: veterinarian.phone,
    crmv: veterinarian.crmv,
    role: veterinarian.role,
    avatar_url: null, // Não estamos exibindo avatar aqui, então pode ser null
  };

  const canEditOrDelete = isAdmin && veterinarian.id !== currentUserId;

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
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          {canEditOrDelete && (
            <>
              <Button variant="outline" onClick={() => onEdit(teamMemberData)} className="w-full sm:w-auto mb-2 sm:mb-0">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitleComponent>Tem certeza?</AlertDialogTitleComponent>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o membro da equipe{" "}
                      <span className="font-bold">{veterinarian.name}</span> e removerá seus dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooterComponent>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(veterinarian.id, veterinarian.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooterComponent>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VeterinarianDetailsDialog;
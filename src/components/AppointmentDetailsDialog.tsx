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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CalendarX, CalendarClock, Edit, Trash2, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react";
import AppointmentForm, { AppointmentFormValues } from "./AppointmentForm"; // Reutilizar o formulário de agendamento
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string;
  time: string;
  client: string;
  pet: string;
  species: string; // Adicionado campo de espécie
  service: string;
  veterinarian: string;
  status: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento"; // Adicionado 'Em Andamento'
}

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAppointment: Appointment) => void;
  onCancelAppointment: (appointmentId: string) => void;
}

// Mapeamento de espécies para ícones
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  onCancelAppointment,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false); // Reset editing state when dialog closes
    }
  }, [isOpen]);

  if (!appointment) return null;

  const getStatusBadgeVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Agendada":
        return "bg-sidebar-item-bg-1 text-white";
      case "Em Andamento": // Novo status
        return "bg-orange-500 text-white";
      case "Realizada":
        return "bg-green-500 text-white";
      case "Cancelada":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleFormSubmit = (data: AppointmentFormValues) => {
    // O formulário agora não inclui 'date' e 'status' diretamente para edição.
    // Preservamos os valores originais do 'appointment' e mesclamos com os dados do formulário.
    // A data será a original do appointment, pois o formulário de edição não a altera.
    // O status também será o original, pois o formulário de edição não o altera.
    onUpdate({
      ...appointment, // Mantém id, date, status e outros campos originais
      ...data,        // Sobrescreve os campos editáveis (client, pet, etc.)
      date: appointment.date, // Garante que a data original seja mantida
      status: appointment.status, // Garante que o status original seja mantido
    });
    setIsEditing(false);
    onClose();
  };

  const handleCancelClick = () => {
    if (window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
      onCancelAppointment(appointment.id);
      onClose();
    }
  };

  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Consulta" : `Detalhes da Consulta: ${appointment.pet}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações necessárias e salve."
              : `Informações completas sobre a consulta de ${appointment.pet}.`}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <AppointmentForm onSubmit={handleFormSubmit} initialData={appointment} />
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">ID:</p>
              <p className="col-span-2 text-sm">{appointment.id}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Data:</p>
              <p className="col-span-2 text-sm">{appointment.date}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Hora:</p>
              <p className="col-span-2 text-sm">{appointment.time}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Cliente:</p>
              <p className="col-span-2 text-sm font-bold">{appointment.client}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Animal:</p>
              <p className="col-span-2 text-sm">{appointment.pet}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Espécie:</p>
              <p className="col-span-2 text-sm flex items-center">
                <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                {appointment.species}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Serviço:</p>
              <p className="col-span-2 text-sm">{appointment.service}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Veterinário:</p>
              <p className="col-span-2 text-sm">{appointment.veterinarian}</p>
            </div>
            {/* O campo de Status foi removido daqui */}
          </div>
        )}

        {!isEditing && (
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto mb-2 sm:mb-0">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            {appointment.status !== "Cancelada" && (
              <Button variant="destructive" onClick={handleCancelClick} className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Cancelar Consulta
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;
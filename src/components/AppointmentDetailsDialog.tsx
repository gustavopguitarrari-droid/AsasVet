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
import AppointmentForm, { AppointmentFormValues } from "./AppointmentForm";
import { cn } from "@/lib/utils";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment atualizada
import { format } from "date-fns";

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
      case "Em Andamento":
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
    const appointmentDate = data.dateOption === "today"
      ? format(new Date(), "yyyy-MM-dd")
      : data.date ? format(data.date, "yyyy-MM-dd") : appointment.date; // Keep original date if not changed

    onUpdate({
      ...appointment,
      date: appointmentDate,
      time: data.time,
      client_name: data.client, // Mapear para client_name
      pet_name: data.pet,       // Mapear para pet_name
      species: data.species,
      service: data.service,
      veterinarian: data.veterinarian,
      // Status e completion_date/time são gerenciados por outras ações
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

  const isFinalized = appointment.status === "Realizada" || appointment.status === "Cancelada";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Consulta" : `Detalhes da Consulta: ${appointment.pet_name}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações necessárias e salve."
              : `Informações completas sobre a consulta de ${appointment.pet_name}.`}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <AppointmentForm
            onSubmit={handleFormSubmit}
            initialData={{
              time: appointment.time,
              client: appointment.client_name,
              pet: appointment.pet_name,
              species: appointment.species,
              service: appointment.service,
              veterinarian: appointment.veterinarian,
              date: appointment.date, // Passar a data como string
              status: appointment.status,
            }}
          />
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
              <p className="col-span-2 text-sm font-bold">{appointment.client_name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Animal:</p>
              <p className="col-span-2 text-sm">{appointment.pet_name}</p>
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
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Status:</p>
              <div className="col-span-2 text-sm">
                <Badge className={cn("text-white", getStatusBadgeVariant(appointment.status))}>
                  {appointment.status}
                </Badge>
              </div>
            </div>
            {isFinalized && appointment.completion_date && appointment.completion_time && (
              <>
                <Separator />
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium text-muted-foreground">Finalizado em:</p>
                  <p className="col-span-2 text-sm">{appointment.completion_date} às {appointment.completion_time}</p>
                </div>
              </>
            )}
          </div>
        )}

        {!isEditing && (
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto mb-2 sm:mb-0">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            {!isFinalized && (
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
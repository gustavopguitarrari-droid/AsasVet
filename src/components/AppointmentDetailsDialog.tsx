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
import { CalendarCheck, CalendarX, CalendarClock, Edit, Trash2, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Play, Horse } from "lucide-react";
import AppointmentForm, { AppointmentFormValues } from "./AppointmentForm";
import { cn } from "@/lib/utils";
import { Appointment } from "@/pages/Appointments";
import { format, parseISO, isValid } from "date-fns";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { ptBR } from "date-fns/locale"; // Importar ptBR

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAppointment: Appointment) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartAppointment: (appointmentId: string) => void;
}

const mockVeterinarians = [
  { id: "V001", name: "Dr. Ana Paula" },
  { id: "V002", name: "Dr. Carlos Eduardo" },
  { id: "V003", name: "Dra. Beatriz Lima" },
];

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Equino: Horse, // Usando MoreHorizontal como fallback
  Bovino: MoreHorizontal, // Usando MoreHorizontal como fallback
  Outros: MoreHorizontal,
};

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  onCancelAppointment,
  onStartAppointment,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!appointment) return null;

  const getStatusBadgeVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Agendada":
        return "bg-sidebar-item-bg-1 text-white"; // Mantém a cor, mas o texto será "Em espera"
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
    const appointmentDate = data.date ? format(data.date, "yyyy-MM-dd") : appointment.date;

    onUpdate({
      ...appointment,
      date: appointmentDate,
      time: data.time,
      client_name: data.client,
      pet_name: data.pet,
      species: data.species,
      service: data.service,
      veterinarian: appointment.veterinarian,
      status: appointment.status,
      // completion_timestamp não é alterado via formulário de edição
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

  const handleStartClick = () => {
    if (window.confirm("Tem certeza que deseja iniciar esta consulta?")) {
      onStartAppointment(appointment.id);
      onClose();
    }
  };

  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;

  const isFinalized = appointment.status === "Realizada" || appointment.status === "Cancelada";
  const isAgendada = appointment.status === "Agendada";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]"> {/* Aumentado o max-w aqui */}
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
            onCancel={() => setIsEditing(false)}
            initialData={{
              time: appointment.time,
              client: appointment.client_name,
              pet: appointment.pet_name,
              species: appointment.species,
              service: appointment.service,
              veterinarian: appointment.veterinarian || undefined,
              date: appointment.date,
              status: appointment.status,
              selectedClientId: "", // Não preenche aqui, o formulário busca
              selectedPetId: "",     // Não preenche aqui, o formulário busca
            }}
            allClients={[]} // Adicione a lista de clientes
            allPets={[]}    // Adicione a lista de pets
          />
        ) : (
          <div className="grid gap-4 py-4">
            {/* Oculta o ID quando não estiver editando */}
            {isEditing && (
              <div className="grid grid-cols-3 items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">ID:</p>
                <p className="col-span-2 text-sm">{appointment.id}</p>
              </div>
            )}
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
              <p className="col-span-2 text-sm">{appointment.veterinarian || "Não atribuído"}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Status:</p>
              <div className="col-span-2 text-sm">
                <Badge className={cn("text-white", getStatusBadgeVariant(appointment.status))}>
                  {appointment.status === "Agendada" ? "Em espera" : appointment.status}
                </Badge>
              </div>
            </div>
            {isFinalized && appointment.completion_timestamp && (
              <>
                <Separator />
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium text-muted-foreground">Finalizado em:</p>
                  <p className="col-span-2 text-sm">
                    {format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {!isEditing && (
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            {isAgendada && (
              <Button variant="default" onClick={handleStartClick} className="w-full sm:w-auto mb-2 sm:mb-0">
                <Play className="mr-2 h-4 w-4" /> Iniciar Consulta
              </Button>
            )}
            {/* Botão de Editar removido */}
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
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, History, CalendarCheck, CalendarX, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment

interface AppointmentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historyAppointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void; // Para reabrir o diálogo de detalhes
}

// Mapeamento de espécies para ícones (duplicado para evitar prop drilling excessivo)
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

// Função para obter a variante do badge de status (duplicado para evitar prop drilling excessivo)
const getStatusBadgeVariant = (status: Appointment["status"]) => {
  switch (status) {
    case "Agendada":
      return "bg-primary text-primary-foreground";
    case "Em Andamento":
      return "bg-orange-500 text-white";
    case "Realizada":
      return "bg-green-500 text-white";
    case "Cancelada":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const AppointmentHistoryDialog: React.FC<AppointmentHistoryDialogProps> = ({
  isOpen,
  onClose,
  historyAppointments,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredHistory = historyAppointments.filter((appointment) =>
    appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.veterinarian && appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())) ||
    appointment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.completion_date && appointment.completion_date.includes(searchTerm))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" /> Histórico de Consultas
          </DialogTitle>
          <DialogDescription>
            Visualize todas as consultas finalizadas ou canceladas.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar no histórico (paciente, tutor, serviço, status)..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Data Finalização</TableHead>
                <TableHead>Hora Finalização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((appointment) => {
                  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                  return (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                        {appointment.pet_name}
                      </TableCell>
                      <TableCell>{appointment.client_name}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-white", getStatusBadgeVariant(appointment.status))}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{appointment.veterinarian || "N/A"}</TableCell>
                      <TableCell>
                        {appointment.completion_date && isValid(parseISO(appointment.completion_date))
                          ? format(parseISO(appointment.completion_date), "dd/MM/yyyy", { locale: ptBR })
                          : "N/A"}
                      </TableCell>
                      <TableCell>{appointment.completion_time || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => onViewDetails(appointment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhuma consulta no histórico encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentHistoryDialog;
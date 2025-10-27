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
import { Search, History, CalendarCheck, CalendarX, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Eye, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid, differenceInSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/pages/Appointments";
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

interface AppointmentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historyAppointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onClearHistory: () => void;
  isClearingHistory: boolean;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

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
  onClearHistory,
  isClearingHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredHistory = historyAppointments.filter((appointment) =>
    appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.veterinarian && appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())) ||
    appointment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.completion_timestamp && format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy").includes(searchTerm))
  );

  // Ordenar por data de criação mais recente primeiro
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = parseISO(a.created_at);
    const dateB = parseISO(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  // Função auxiliar para formatar o tempo em HH:mm:ss
  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds < 0) return "N/A";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

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

        <div className="mt-4 flex-1 overflow-y-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Status</TableHead> {/* Nova coluna para status */}
                <TableHead>Finalização/Cancelamento</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tempo de Espera</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.length > 0 ? (
                sortedHistory.map((appointment) => {
                  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                  const isRealizada = appointment.status === 'Realizada';
                  const isCancelada = appointment.status === 'Cancelada';

                  // Calcular Duração da Consulta
                  const duration = isRealizada && appointment.start_time && appointment.completion_timestamp
                    ? (() => {
                        const start = parseISO(appointment.start_time);
                        const end = parseISO(appointment.completion_timestamp);
                        return isValid(start) && isValid(end) ? formatDuration(differenceInSeconds(end, start)) : "N/A";
                      })()
                    : "N/A";

                  // Calcular Tempo de Espera
                  const waitingTime = appointment.created_at && (appointment.start_time || appointment.completion_timestamp)
                    ? (() => {
                        const created = parseISO(appointment.created_at);
                        const referenceTime = isRealizada && appointment.start_time ? parseISO(appointment.start_time) : (isCancelada && appointment.completion_timestamp ? parseISO(appointment.completion_timestamp) : null);
                        return isValid(created) && isValid(referenceTime!) ? formatDuration(differenceInSeconds(referenceTime!, created)) : "N/A";
                      })()
                    : "N/A";

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                        {appointment.pet_name}
                      </TableCell>
                      <TableCell>{appointment.client_name}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.veterinarian || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-white", getStatusBadgeVariant(appointment.status))}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))
                          ? format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "N/A"}
                      </TableCell>
                      <TableCell>{duration}</TableCell>
                      <TableCell>{waitingTime}</TableCell>
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
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground"> {/* colSpan ajustado para 9 */}
                    Nenhuma consulta encontrada no histórico.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={historyAppointments.length === 0 || isClearingHistory}>
                {isClearingHistory ? "Limpando..." : "Limpar Histórico"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitleComponent>Tem certeza que deseja limpar o histórico?</AlertDialogTitleComponent>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todas as consultas com status "Realizada" ou "Cancelada" serão permanentemente excluídas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooterComponent>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Limpar Histórico
                </AlertDialogAction>
              </AlertDialogFooterComponent>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentHistoryDialog;
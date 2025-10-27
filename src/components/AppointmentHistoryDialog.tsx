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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("consultas");

  const filteredHistory = historyAppointments.filter((appointment) =>
    appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.veterinarian && appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())) ||
    appointment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.completion_timestamp && format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy").includes(searchTerm))
  );

  const completedAppointments = filteredHistory.filter(app => app.status === 'Realizada');
  const cancelledAppointments = filteredHistory.filter(app => app.status === 'Cancelada');

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="consultas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
              <CalendarCheck className="h-5 w-5 mr-2" /> Histórico de Consultas
            </TabsTrigger>
            <TabsTrigger value="espera" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
              <CalendarClock className="h-5 w-5 mr-2" /> Histórico de Espera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultas" className="mt-4 flex-1 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Veterinário</TableHead>
                  <TableHead>Finalização</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Tempo de Espera</TableHead> {/* Nova coluna aqui */}
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedAppointments.length > 0 ? (
                  completedAppointments.map((appointment) => {
                    const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                    const duration = appointment.start_time && appointment.completion_timestamp
                      ? (() => {
                          const start = parseISO(appointment.start_time);
                          const end = parseISO(appointment.completion_timestamp);
                          if (isValid(start) && isValid(end)) {
                            const durationSeconds = differenceInSeconds(end, start);
                            return formatDuration(durationSeconds);
                          }
                          return "N/A";
                        })()
                      : "N/A";

                    // Calcular o tempo de espera para consultas realizadas
                    const waitingTime = appointment.created_at && appointment.start_time
                      ? (() => {
                          const created = parseISO(appointment.created_at);
                          const started = parseISO(appointment.start_time);
                          if (isValid(created) && isValid(started)) {
                            const durationSeconds = differenceInSeconds(started, created);
                            return formatDuration(durationSeconds);
                          }
                          return "N/A";
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
                          {appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))
                            ? format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "N/A"}
                        </TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell>{waitingTime}</TableCell> {/* Exibir o tempo de espera aqui */}
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
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground"> {/* colSpan ajustado para 8 */}
                      Nenhuma consulta realizada encontrada no histórico.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="espera" className="mt-4 flex-1 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Veterinário</TableHead>
                  <TableHead>Cancelamento</TableHead>
                  <TableHead>Tempo de Espera</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancelledAppointments.length > 0 ? (
                  cancelledAppointments.map((appointment) => {
                    const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                    
                    // Calcular o tempo de espera para consultas canceladas
                    const waitingTime = appointment.created_at && appointment.completion_timestamp
                      ? (() => {
                          const created = parseISO(appointment.created_at);
                          const cancelled = parseISO(appointment.completion_timestamp);
                          if (isValid(created) && isValid(cancelled)) {
                            const durationSeconds = differenceInSeconds(cancelled, created);
                            return formatDuration(durationSeconds);
                          }
                          return "N/A";
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
                          {appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))
                            ? format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "N/A"}
                        </TableCell>
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
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Nenhuma consulta cancelada encontrada no histórico.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

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
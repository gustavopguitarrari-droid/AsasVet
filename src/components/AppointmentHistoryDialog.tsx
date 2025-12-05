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
import { Input } from "@/components/ui/input";
import { Search, History, CalendarCheck, CalendarX, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Eye, CalendarClock, FileText, Pill, User, Stethoscope, CalendarDays } from "lucide-react"; // Adicionado FileText e Pill
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment
import { Button } from "@/components/ui/button"; // Importar Button
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent, // Renomear para evitar conflito
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent, // Renomear para evitar conflito
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Importar Tabs
import { format, parseISO, isValid } from "date-fns"; // Importar format, parseISO, isValid
import { ptBR } from "date-fns/locale"; // Importar ptBR

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface AppointmentHistoryDialogProps { // Renomeado para AppointmentHistoryDialogProps
  isOpen: boolean;
  onClose: () => void;
  historyAppointments: Appointment[]; // Alterado para Appointment[]
  onViewDetails: (appointment: Appointment) => void; // Nova prop para ver detalhes
  onClearHistory: () => void; // Nova prop para limpar o histórico
  isClearingHistory: boolean; // Nova prop para indicar se a limpeza está em andamento
  onViewMedicalRecordPdf: (appointment: Appointment) => void; // NOVO: Prop para visualizar PDF do prontuário
  onViewRecipePdf: (appointment: Appointment) => void; // NOVO: Prop para visualizar PDF da receita
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Equino: MoreHorizontal, // Alterado de Horse para MoreHorizontal
  Bovino: MoreHorizontal,   // Alterado de Cow para MoreHorizontal
  Outros: MoreHorizontal,
};

const statusBadgeColorMap: Record<Appointment["status"], string> = { // Alterado para Appointment["status"]
  "Agendada": "bg-blue-500",
  "Em Andamento": "bg-orange-500",
  "Realizada": "bg-green-500",
  "Cancelada": "bg-red-500",
};

const AppointmentHistoryDialog: React.FC<AppointmentHistoryDialogProps> = ({
  isOpen,
  onClose,
  historyAppointments = [], // Adicionado valor padrão para evitar undefined
  onViewDetails,
  onClearHistory,
  isClearingHistory,
  onViewMedicalRecordPdf, // NOVO
  onViewRecipePdf, // NOVO
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"realizadas" | "canceladas">("realizadas"); // Tabs para realizadas e canceladas

  const filteredHistoryAppointments = historyAppointments.filter(appointment =>
    appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedAppointments = filteredHistoryAppointments.filter(appointment => appointment.status === "Realizada");
  const cancelledAppointments = filteredHistoryAppointments.filter(appointment => appointment.status === "Cancelada");

  const renderAppointmentList = (appointmentsToRender: Appointment[]) => {
    if (appointmentsToRender.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8 flex-1">
          Nenhuma consulta no histórico de {activeTab === "realizadas" ? "realizadas" : "canceladas"} que corresponda à sua busca.
        </p>
      );
    }
    return (
      <ul className="space-y-4 flex-1 overflow-y-auto pr-2">
        {appointmentsToRender.map((appointment) => {
          const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
          const statusColorClass = statusBadgeColorMap[appointment.status] || "bg-gray-500";
          const finalDate = appointment.completion_timestamp || appointment.date;

          return (
            <li key={appointment.id} className="flex items-center p-4 border rounded-md shadow-sm bg-card text-card-foreground">
              <IconComponent className={cn("h-6 w-6 mr-4 text-muted-foreground")} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <p className="font-bold text-lg">{appointment.pet_name}</p>
                <p className="text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" /> {appointment.client_name}
                </p>
                <p className="text-muted-foreground flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" /> {appointment.veterinarian}
                </p>
              </div>
              <div className="flex flex-col items-end ml-4">
                <Badge className={cn("text-white mb-1", statusColorClass)}>
                  {appointment.status === "Realizada" ? "Concluída" : "Cancelada"}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1" /> {finalDate ? format(parseISO(finalDate), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">Serviço: {appointment.service}</span>
                <div className="flex space-x-2 mt-2">
                  {appointment.medical_record_pdf_url && (
                    <Button variant="outline" size="sm" onClick={() => onViewMedicalRecordPdf(appointment)}>
                      <FileText className="h-4 w-4 mr-1" /> Prontuário
                    </Button>
                  )}
                  {(appointment.medical_records?.recipe_pdf_url || (appointment.medical_records?.prescriptions && appointment.medical_records.prescriptions.length > 0)) && (
                    <Button variant="outline" size="sm" onClick={() => onViewRecipePdf(appointment)}>
                      <Pill className="h-4 w-4 mr-1" /> Receita
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(appointment)}>
                    <Eye className="h-4 w-4 mr-1" /> Detalhes
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Consultas</DialogTitle>
          <DialogDescription>
            Visualize e busque por consultas realizadas ou canceladas.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar no histórico..."
            className="pl-9 border border-input rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "realizadas" | "canceladas")} className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 mb-4">
            <TabsTrigger value="realizadas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Realizadas ({completedAppointments.length})</TabsTrigger>
            <TabsTrigger value="canceladas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Canceladas ({cancelledAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="realizadas" className="flex-1 flex flex-col">
            {renderAppointmentList(completedAppointments)}
          </TabsContent>
          <TabsContent value="canceladas" className="flex-1 flex flex-col">
            {renderAppointmentList(cancelledAppointments)}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
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
                  Esta ação não pode ser desfeita. Todos os registros de consultas com status "Realizada" ou "Cancelada" serão permanentemente excluídos.
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
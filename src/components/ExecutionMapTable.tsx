"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Pill, Utensils, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog"; // Importar Dialog para envolver o formulário
import AddExecutionActionDialog, { AddExecutionActionFormValues } from "./AddExecutionActionDialog"; // Importar o novo diálogo
import { InternedPatient, ExecutionAction, RiskLevel } from "@/types/internment"; // Importar tipos

interface ExecutionMapTableProps {
  patients: InternedPatient[];
  selectedDate: Date; // A data selecionada no calendário pai
  executionActions: ExecutionAction[]; // Todas as ações de execução
  onAddAction: (action: Omit<ExecutionAction, "id" | "status">) => void; // Função para adicionar ação
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const speciesColorMap: { [key: string]: string } = {
  Cachorro: "text-sidebar-item-bg-1",
  Gato: "text-sidebar-item-bg-4",
  Pássaro: "text-sidebar-item-bg-3",
  Roedor: "text-sidebar-item-bg-7",
  Peixe: "text-sidebar-item-bg-5",
  Outros: "text-sidebar-item-bg-9",
};

const riskColorMap: Record<RiskLevel, string> = {
  "Sem risco": "bg-blue-500",
  "Baixo": "bg-green-500",
  "Médio": "bg-yellow-500",
  "Alto": "bg-orange-500",
  "Emergência": "bg-red-500",
};

const actionTypeIconMap: Record<ExecutionAction["type"], React.ElementType> = {
  Medicação: Pill,
  Parâmetro: Thermometer,
  Alimentação: Utensils,
  Outro: Plus,
};

const generateHourlySlots = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, "0")}`);
  }
  return hours;
};

const hourlySlots = generateHourlySlots();

const ExecutionMapTable: React.FC<ExecutionMapTableProps> = ({ patients, selectedDate, executionActions, onAddAction }) => {
  const [isAddActionDialogOpen, setIsAddActionDialogOpen] = React.useState(false);
  const [currentPatientForAction, setCurrentPatientForAction] = React.useState<InternedPatient | null>(null);
  const [currentHourForAction, setCurrentHourForAction] = React.useState<string>("00");

  const handleAddActionClick = (patient: InternedPatient, hour: string) => {
    setCurrentPatientForAction(patient);
    setCurrentHourForAction(hour);
    setIsAddActionDialogOpen(true);
  };

  const handleAddActionSubmit = (formData: AddExecutionActionFormValues) => {
    if (currentPatientForAction && selectedDate) {
      const newAction: Omit<ExecutionAction, "id" | "status"> = {
        patientId: currentPatientForAction.id,
        patientName: currentPatientForAction.petName,
        date: format(selectedDate, "yyyy-MM-dd"),
        scheduledTime: formData.scheduledTime,
        type: formData.type,
        description: formData.description,
        notes: formData.notes,
      };
      onAddAction(newAction);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-full divide-y divide-border">
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead className="sticky left-0 bg-secondary z-10 w-[250px] text-lg font-bold">Paciente</TableHead>
              {hourlySlots.map((hour) => (
                <TableHead key={hour} className="text-center w-[40px] p-1 text-sm font-semibold text-muted-foreground">
                  {hour}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((patient) => {
                const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
                const speciesTextColorClass = speciesColorMap[patient.species] || "text-muted-foreground";
                const riskStripeColorClass = riskColorMap[patient.risk];

                return (
                  <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors duration-150">
                    <TableCell className="sticky left-0 bg-card font-semibold py-4 w-[250px] border-r relative pl-6">
                      <div className={cn("absolute top-0 left-0 h-full w-2 rounded-l-md", riskStripeColorClass)}></div>

                      <div className="flex items-center mb-1">
                        <IconComponent className={cn("h-5 w-5 mr-2", speciesTextColorClass)} />
                        <span className="font-bold text-base">{patient.petName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-7">Baia: {patient.bayName}</p>
                      <p className="text-xs text-muted-foreground ml-7">Tutor: {patient.ownerName}</p>
                      <p className="text-xs text-muted-foreground ml-7">Vet: {patient.veterinarian}</p>
                    </TableCell>
                    {hourlySlots.map((hour) => {
                      const actionsForSlot = executionActions.filter(
                        (action) =>
                          action.patientId === patient.id &&
                          action.date === format(selectedDate, "yyyy-MM-dd") &&
                          action.scheduledTime.startsWith(hour)
                      );
                      return (
                        <TableCell key={`${patient.id}-${hour}`} className="text-center p-1.5 relative">
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 group relative rounded-md border-dashed border-muted-foreground/50 bg-background hover:bg-accent/50 transition-colors duration-200"
                                onClick={() => handleAddActionClick(patient, hour)}
                              >
                                <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                <span className="sr-only">Adicionar Ação</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Adicionar ação para {patient.petName} às {hour}:00
                            </TooltipContent>
                          </Tooltip>
                          {actionsForSlot.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              {actionsForSlot.map((action) => {
                                const ActionIcon = actionTypeIconMap[action.type] || Plus;
                                return (
                                  <Tooltip key={action.id} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="h-5 px-1.5 py-0.5 text-xs flex items-center justify-center mb-0.5 pointer-events-auto cursor-pointer">
                                        <ActionIcon className="h-3 w-3 mr-1" />
                                        {action.scheduledTime.substring(3)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="font-bold">{action.type}: {action.description}</p>
                                      <p className="text-xs text-muted-foreground">Agendado: {action.scheduledTime}</p>
                                      {action.notes && <p className="text-xs text-muted-foreground">Notas: {action.notes}</p>}
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={hourlySlots.length + 1} className="h-24 text-center text-muted-foreground">
                  Nenhum paciente internado para exibir no mapa de execução.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddActionDialogOpen} onOpenChange={setIsAddActionDialogOpen}>
        {currentPatientForAction && selectedDate && (
          <AddExecutionActionDialog
            isOpen={isAddActionDialogOpen}
            onClose={() => setIsAddActionDialogOpen(false)}
            patientId={currentPatientForAction.id}
            patientName={currentPatientForAction.petName}
            date={selectedDate}
            initialHour={currentHourForAction}
            onSubmit={handleAddActionSubmit}
          />
        )}
      </Dialog>
    </>
  );
};

export default ExecutionMapTable;
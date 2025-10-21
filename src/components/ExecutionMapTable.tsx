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
import { Plus, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Syringe, Utensils, Eye, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PatientAction } from "@/pages/Internacao";

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  bayName: string;
  petName: string;
  ownerName: string;
  reason: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta" | "Óbito";
  species: string;
  risk: RiskLevel;
}

interface ExecutionMapTableProps {
  patients: InternedPatient[];
  selectedDate: Date; // Changed to non-optional
  patientActions: PatientAction[];
  onAddActionClick: (patientId: string, patientName: string, date: Date, hour: string) => void;
  onViewActionsClick: (patientId: string, patientName: string, date: Date, hour: string) => void; // New prop
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

const actionTypeIconMap: Record<PatientAction["type"], React.ElementType> = {
  Medicação: Syringe,
  Alimentação: Utensils,
  Observação: Eye,
  Outro: FlaskConical,
};

const generateHourlySlots = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, "0")}`);
  }
  return hours;
};

const hourlySlots = generateHourlySlots();

const ExecutionMapTable: React.FC<ExecutionMapTableProps> = ({ patients, selectedDate, patientActions, onAddActionClick, onViewActionsClick }) => {
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-md border">
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
                    const actionsForSlot = patientActions.filter(
                      (action) =>
                        action.patientId === patient.id &&
                        action.date === formattedSelectedDate &&
                        action.hour === hour
                    );
                    const actionCount = actionsForSlot.length;

                    return (
                      <TableCell key={`${patient.id}-${hour}`} className="text-center p-1.5 relative">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          {actionCount > 0 ? (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 w-8 rounded-full font-bold text-primary-foreground bg-primary hover:bg-primary/90"
                                  onClick={() => onViewActionsClick(patient.id, patient.petName, selectedDate, hour)}
                                >
                                  {actionCount}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Ver {actionCount} ação(ões) para {patient.petName} às {hour}:00
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="h-8 w-8 flex items-center justify-center text-muted-foreground/50 text-sm">-</span>
                          )}
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 group relative rounded-md border-dashed border-muted-foreground/50 bg-background hover:bg-accent/50 transition-colors duration-200"
                                onClick={() => onAddActionClick(patient.id, patient.petName, selectedDate, hour)}
                              >
                                <Plus className="h-3 w-3 text-primary opacity-100 group-hover:opacity-100 transition-opacity duration-200" />
                                <span className="sr-only">Adicionar Ação</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Adicionar ação para {patient.petName} às {hour}:00
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
  );
};

export default ExecutionMapTable;
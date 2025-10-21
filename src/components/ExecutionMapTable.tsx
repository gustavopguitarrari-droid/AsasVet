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
import { Plus, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Syringe, Utensils, Eye, FlaskConical } from "lucide-react"; // Adicionado ícones para tipos de ação
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge"; // Importar Badge
import { format } from "date-fns";
import { PatientAction } from "@/pages/Internacao"; // Importar o tipo PatientAction

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  bayName: string; // Novo campo
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
  selectedDate: Date | undefined;
  patientActions: PatientAction[]; // Receber as ações
  onAddActionClick: (patientId: string, patientName: string, date: Date, hour: string) => void; // Callback para adicionar ação
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

// Mapeamento de cores para o nível de risco
const riskColorMap: Record<RiskLevel, string> = {
  "Sem risco": "bg-blue-500",
  "Baixo": "bg-green-500",
  "Médio": "bg-yellow-500",
  "Alto": "bg-orange-500",
  "Emergência": "bg-red-500",
};

// Mapeamento de ícones para tipos de ação
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

const ExecutionMapTable: React.FC<ExecutionMapTableProps> = ({ patients, selectedDate, patientActions, onAddActionClick }) => {
  const handleAddAction = (patient: InternedPatient, hour: string) => {
    if (selectedDate) {
      onAddActionClick(patient.id, patient.petName, selectedDate, hour);
    }
  };

  const formattedSelectedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-md border">
      <Table className="min-w-full divide-y divide-border">
        <TableHeader>
          <TableRow className="bg-secondary">
            <TableHead className="sticky left-0 bg-secondary z-10 w-[250px] text-lg font-bold">Paciente</TableHead> {/* Largura aumentada */}
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
                  <TableCell className="sticky left-0 bg-card font-semibold py-4 w-[250px] border-r relative pl-6"> {/* Largura aumentada, adicionado relative e ajustado padding-left */}
                    {/* Faixa de risco */}
                    <div className={cn("absolute top-0 left-0 h-full w-2 rounded-l-md", riskStripeColorClass)}></div>

                    <div className="flex items-center mb-1">
                      <IconComponent className={cn("h-5 w-5 mr-2", speciesTextColorClass)} />
                      <span className="font-bold text-base">{patient.petName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Baia: {patient.bayName}</p> {/* Exibindo o nome da baia */}
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

                    return (
                      <TableCell key={`${patient.id}-${hour}`} className="text-center p-1.5 relative">
                        {actionsForSlot.length > 0 ? (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            {actionsForSlot.map((action) => {
                              const ActionIcon = actionTypeIconMap[action.type] || FlaskConical;
                              return (
                                <Tooltip key={action.id} delayDuration={0}> {/* Usando action.id como key */}
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center">
                                      <ActionIcon className="h-4 w-4" />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    {action.type}: {action.description}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 group relative rounded-md border-dashed border-muted-foreground/50 bg-background hover:bg-accent/50 transition-colors duration-200"
                                  onClick={() => handleAddAction(patient, hour)}
                                >
                                  <Plus className="h-3 w-3 text-primary opacity-100 group-hover:opacity-100 transition-opacity duration-200" />
                                  <span className="sr-only">Adicionar Ação</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Adicionar mais ações para {patient.petName} às {hour}:00
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 group relative rounded-md border-dashed border-muted-foreground/50 bg-background hover:bg-accent/50 transition-colors duration-200"
                                onClick={() => handleAddAction(patient, hour)}
                              >
                                <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                <span className="sr-only">Adicionar Ação</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Adicionar ação para {patient.petName} às {hour}:00
                            </TooltipContent>
                          </Tooltip>
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
  );
};

export default ExecutionMapTable;
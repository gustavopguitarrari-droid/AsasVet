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
import { Plus, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge"; // Importar Badge

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
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

// Mapeamento de cores para o badge de status (mantido, mas não usado diretamente aqui)
const statusBadgeColorMap: Record<InternedPatient["status"], string> = {
  "Em Observação": "bg-blue-500",
  "Estável": "bg-green-500",
  "Crítico": "bg-red-500",
  "Alta": "bg-green-500",
  "Óbito": "bg-red-500",
};

const generateHourlySlots = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, "0")}`);
  }
  return hours;
};

const hourlySlots = generateHourlySlots();

const ExecutionMapTable: React.FC<ExecutionMapTableProps> = ({ patients }) => {
  const handleAddAction = (patientId: string, hour: string) => {
    console.log(`Adicionar ação para o paciente ${patientId} no horário ${hour}:00`);
    // Lógica para adicionar ação (medicação, alimentação, etc.)
  };

  return (
    <div className="overflow-x-auto rounded-md border">
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
              // const statusBadgeClass = statusBadgeColorMap[patient.status]; // Não é mais necessário aqui

              return (
                <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors duration-150">
                  <TableCell className="sticky left-0 bg-card font-semibold py-4 w-[250px] border-r relative pl-6"> {/* Largura aumentada, adicionado relative e ajustado padding-left */}
                    {/* Faixa de risco */}
                    <div className={cn("absolute top-0 left-0 h-full w-2 rounded-l-md", riskStripeColorClass)}></div>

                    <div className="flex items-center mb-1">
                      <IconComponent className={cn("h-5 w-5 mr-2", speciesTextColorClass)} />
                      <span className="font-bold text-base">{patient.petName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Tutor: {patient.ownerName}</p>
                    <p className="text-xs text-muted-foreground ml-7">Vet: {patient.veterinarian}</p>
                    {/* O Badge de status foi removido daqui */}
                  </TableCell>
                  {hourlySlots.map((hour) => (
                    <TableCell key={`${patient.id}-${hour}`} className="text-center p-1.5">
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 group relative rounded-md border-dashed border-muted-foreground/50 bg-background hover:bg-accent/50 transition-colors duration-200"
                            onClick={() => handleAddAction(patient.id, hour)}
                          >
                            <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <span className="sr-only">Adicionar Ação</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Adicionar ação para {patient.petName} às {hour}:00
                        </TooltipContent>
                      </Tooltip>
                      {/* Aqui você pode renderizar ações existentes para este paciente e horário */}
                    </TableCell>
                  ))}
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
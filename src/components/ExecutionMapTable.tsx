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

const generateHourlySlots = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, "0")}:00`);
  }
  return hours;
};

const hourlySlots = generateHourlySlots();

const ExecutionMapTable: React.FC<ExecutionMapTableProps> = ({ patients }) => {
  const handleAddAction = (patientId: string, hour: string) => {
    // Lógica para adicionar ação (medicação, alimentação, etc.)
    console.log(`Adicionar ação para o paciente ${patientId} no horário ${hour}`);
    // Aqui você pode abrir um diálogo para coletar mais informações
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="min-w-full divide-y divide-border">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10 w-[150px]">Paciente</TableHead>
            {hourlySlots.map((hour) => (
              <TableHead key={hour} className="text-center min-w-[100px]">
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

              return (
                <TableRow key={patient.id}>
                  <TableCell className="sticky left-0 bg-card font-medium flex items-center py-4 w-[150px]">
                    <IconComponent className={cn("h-5 w-5 mr-2", speciesTextColorClass)} />
                    {patient.petName}
                  </TableCell>
                  {hourlySlots.map((hour) => (
                    <TableCell key={`${patient.id}-${hour}`} className="text-center p-2">
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleAddAction(patient.id, hour)}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Adicionar Ação</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Adicionar ação para {patient.petName} às {hour}
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
              <TableCell colSpan={hourlySlots.length + 1} className="h-24 text-center">
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
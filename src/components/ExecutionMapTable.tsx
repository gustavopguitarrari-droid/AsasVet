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
          <TableRow className="bg-muted/20"> {/* Fundo sutil para o cabeçalho */}
            <TableHead className="sticky left-0 bg-background z-10 w-[150px] text-base font-semibold">Paciente</TableHead> {/* Texto maior e mais forte */}
            {hourlySlots.map((hour) => (
              <TableHead key={hour} className="text-center w-[40px] p-1 text-sm font-semibold"> {/* Horários um pouco maiores e mais fortes */}
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
                <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors duration-150"> {/* Efeito de hover na linha */}
                  <TableCell className="sticky left-0 bg-card font-medium flex items-center py-4 w-[150px]">
                    <IconComponent className={cn("h-5 w-5 mr-2", speciesTextColorClass)} />
                    {patient.petName}
                  </TableCell>
                  {hourlySlots.map((hour) => (
                    <TableCell key={`${patient.id}-${hour}`} className="text-center p-1.5"> {/* Padding um pouco maior */}
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 group relative rounded-sm" // Aumentado o tamanho do botão e arredondamento
                            onClick={() => handleAddAction(patient.id, hour)}
                          >
                            {/* Quadrado branco com borda */}
                            <div className="absolute inset-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm flex items-center justify-center group-hover:bg-gray-50 dark:group-hover:bg-gray-600 transition-colors duration-200"> {/* Efeito de hover no quadrado */}
                              {/* Ícone Plus que aparece no hover */}
                              <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" /> {/* Ícone maior e com cor primária no hover */}
                            </div>
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
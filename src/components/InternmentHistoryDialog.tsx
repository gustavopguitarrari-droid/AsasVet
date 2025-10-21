"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, User, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface InternmentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historyPatients: InternedPatient[];
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

const statusBadgeColorMap: Record<InternedPatient["status"], string> = {
  "Em Observação": "bg-blue-500",
  "Estável": "bg-green-500",
  "Crítico": "bg-red-500",
  "Alta": "bg-green-500",
  "Óbito": "bg-red-500",
};

const InternmentHistoryDialog: React.FC<InternmentHistoryDialogProps> = ({
  isOpen,
  onClose,
  historyPatients,
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const filteredHistoryPatients = historyPatients.filter(patient =>
    patient.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.bayName.toLowerCase().includes(searchTerm.toLowerCase()) // Incluindo busca por nome da baia
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Pacientes Internados</DialogTitle>
          <DialogDescription>
            Visualize e busque por pacientes que já tiveram alta ou óbito.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar no histórico..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredHistoryPatients.length > 0 ? (
          <ul className="space-y-4">
            {filteredHistoryPatients.map((patient) => {
              const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
              const statusColorClass = statusBadgeColorMap[patient.status] || "bg-gray-500";
              const finalDate = patient.expectedDischargeDate || patient.admissionDate;

              return (
                <li key={patient.id} className="flex items-center p-4 border rounded-md shadow-sm bg-card text-card-foreground">
                  <IconComponent className={cn("h-6 w-6 mr-4", speciesColorMap[patient.species])} />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <p className="font-bold text-lg">{patient.petName}</p>
                    <p className="text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" /> {patient.ownerName}
                    </p>
                    <p className="text-muted-foreground flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2" /> {patient.veterinarian}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <Badge className={cn("text-white mb-1", statusColorClass)}>
                      {patient.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1" /> {finalDate}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Baia: {patient.bayName}</span> {/* Exibindo o nome da baia */}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhum paciente no histórico de internações que corresponda à sua busca.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InternmentHistoryDialog;
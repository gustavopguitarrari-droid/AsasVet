"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Importar DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, User, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InternedPatient } from "@/pages/Internacao"; // Importar a interface atualizada
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

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternmentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historyPatients: InternedPatient[];
  onClearHistory: () => void; // Nova prop para limpar o histórico
  isClearingHistory: boolean; // Nova prop para indicar se a limpeza está em andamento
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
  onClearHistory,
  isClearingHistory,
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"alta" | "obito">("alta");

  const filteredHistoryPatients = historyPatients.filter(patient =>
    patient.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.bay_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dischargedPatients = filteredHistoryPatients.filter(patient => patient.status === "Alta");
  const deceasedPatients = filteredHistoryPatients.filter(patient => patient.status === "Óbito");

  const renderPatientList = (patientsToRender: InternedPatient[]) => {
    if (patientsToRender.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-8 flex-1">
          Nenhum paciente no histórico de {activeTab === "alta" ? "altas" : "óbitos"} que corresponda à sua busca.
        </p>
      );
    }
    return (
      <ul className="space-y-4 flex-1 overflow-y-auto pr-2">
        {patientsToRender.map((patient) => {
          const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
          const statusColorClass = statusBadgeColorMap[patient.status] || "bg-gray-500";
          const finalDate = patient.expected_discharge_date || patient.admission_date;

          return (
            <li key={patient.id} className="flex items-center p-4 border rounded-md shadow-sm bg-card text-card-foreground">
              <IconComponent className={cn("h-6 w-6 mr-4", speciesColorMap[patient.species])} />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <p className="font-bold text-lg">{patient.pet_name}</p>
                <p className="text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" /> {patient.owner_name}
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
                <span className="text-xs text-muted-foreground mt-1">Baia: {patient.bay_name}</span>
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "alta" | "obito")} className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 mb-4">
            <TabsTrigger value="alta" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Altas ({dischargedPatients.length})</TabsTrigger>
            <TabsTrigger value="obito" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Óbitos ({deceasedPatients.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="alta" className="flex-1 flex flex-col">
            {renderPatientList(dischargedPatients)}
          </TabsContent>
          <TabsContent value="obito" className="flex-1 flex flex-col">
            {renderPatientList(deceasedPatients)}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={historyPatients.length === 0 || isClearingHistory}>
                {isClearingHistory ? "Limpando..." : "Limpar Histórico"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitleComponent>Tem certeza que deseja limpar o histórico?</AlertDialogTitleComponent>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os registros de pacientes com status "Alta" ou "Óbito" serão permanentemente excluídos.
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

export default InternmentHistoryDialog;
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Edit, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, Stethoscope, User, FlaskConical, XCircle, CheckCircle } from "lucide-react"; // Adicionado XCircle e CheckCircle
import InternmentEditForm, { InternmentEditFormValues } from "./InternmentEditForm";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // Importar format para a data de alta/óbito

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  petName: string;
  ownerName: string;
  reason: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta" | "Óbito"; // Adicionado 'Óbito'
  species: string;
  risk: RiskLevel;
}

interface InternmentDetailsDialogProps {
  patient: InternedPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: InternedPatient) => void;
}

// Mapeamento de espécies para ícones
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

// Mapeamento de risco para classes de cor (as mesmas do RiskSelector)
const riskColorMap: Record<RiskLevel, string> = {
  "Sem risco": "bg-blue-500",
  "Baixo": "bg-green-500",
  "Médio": "bg-yellow-500",
  "Alto": "bg-orange-500",
  "Emergência": "bg-red-500",
};

const InternmentDetailsDialog: React.FC<InternmentDetailsDialogProps> = ({
  patient,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false); // Reset editing state when dialog closes
    }
  }, [isOpen]);

  if (!patient) return null;

  const getStatusBadgeVariant = (status: InternedPatient["status"]) => {
    switch (status) {
      case "Em Observação":
        return "bg-blue-500 text-white";
      case "Estável":
        return "bg-green-500 text-white";
      case "Crítico":
        return "bg-red-500 text-white";
      case "Alta":
        return "bg-gray-500 text-white";
      case "Óbito": // Novo status
        return "bg-black text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleFormSubmit = (data: InternmentEditFormValues) => {
    const updatedPatient: InternedPatient = {
      ...patient,
      petName: data.petName,
      ownerName: data.ownerName,
      reason: data.reason,
      admissionDate: format(data.admissionDate, "yyyy-MM-dd"),
      expectedDischargeDate: data.expectedDischargeDate ? format(data.expectedDischargeDate, "yyyy-MM-dd") : undefined,
      veterinarian: data.veterinarian,
      status: data.status,
      species: data.species,
      risk: data.risk,
    };
    onUpdate(updatedPatient);
    setIsEditing(false);
    onClose();
  };

  const handleRegisterDischarge = () => {
    if (window.confirm(`Tem certeza que deseja registrar a alta de ${patient.petName}?`)) {
      const updatedPatient: InternedPatient = {
        ...patient,
        status: "Alta",
        expectedDischargeDate: format(new Date(), "yyyy-MM-dd"), // Registrar data de alta como hoje
      };
      onUpdate(updatedPatient);
      onClose();
    }
  };

  const handleRegisterObito = () => {
    if (window.confirm(`Tem certeza que deseja registrar o óbito de ${patient.petName}? Esta ação não pode ser desfeita.`)) {
      const updatedPatient: InternedPatient = {
        ...patient,
        status: "Óbito",
        expectedDischargeDate: format(new Date(), "yyyy-MM-dd"), // Registrar data do óbito
      };
      onUpdate(updatedPatient);
      onClose();
    }
  };

  const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;

  const isFinalized = patient.status === "Alta" || patient.status === "Óbito";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconComponent className="h-6 w-6 mr-2 text-muted-foreground" />
            {isEditing ? "Editar Paciente Internado" : `Detalhes do Paciente: ${patient.petName}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações necessárias e salve."
              : `Informações completas sobre ${patient.petName}.`}
          </DialogDescription>
        </DialogHeader>

        {!isEditing && !isFinalized && ( // Mostrar botões apenas se não estiver editando e não estiver finalizado
          <div className="flex justify-end space-x-2 mb-4">
            <Button variant="default" onClick={handleRegisterDischarge} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 h-4 w-4" /> Registrar Alta
            </Button>
            <Button variant="destructive" onClick={handleRegisterObito}>
              <XCircle className="mr-2 h-4 w-4" /> Registrar Óbito
            </Button>
          </div>
        )}

        {isEditing ? (
          <InternmentEditForm initialData={patient} onSubmit={handleFormSubmit} onCancel={() => setIsEditing(false)} />
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">ID:</p>
              <p className="col-span-2 text-sm">{patient.id}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Nome do Animal:</p>
              <p className="col-span-2 text-sm font-bold">{patient.petName}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Tutor:</p>
              <p className="col-span-2 text-sm flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.ownerName}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Espécie:</p>
              <p className="col-span-2 text-sm flex items-center">
                <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.species}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Motivo:</p>
              <p className="col-span-2 text-sm">{patient.reason}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Veterinário:</p>
              <p className="col-span-2 text-sm flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.veterinarian}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Admissão:</p>
              <p className="col-span-2 text-sm flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.admissionDate}
              </p>
            </div>
            {patient.expectedDischargeDate && (
              <>
                <Separator />
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium text-muted-foreground">Previsão Alta:</p>
                  <p className="col-span-2 text-sm flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    {patient.expectedDischargeDate}
                  </p>
                </div>
              </>
            )}
            <Separator />
            {/* REMOVIDO: Bloco de Status */}
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Risco:</p>
              <p className="col-span-2 text-sm">
                <Badge className={cn(riskColorMap[patient.risk], "text-white")}>
                  {patient.risk}
                </Badge>
              </p>
            </div>
          </div>
        )}

        {!isEditing && !isFinalized && ( // O botão de editar também não aparece se o status for Alta ou Óbito
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InternmentDetailsDialog;
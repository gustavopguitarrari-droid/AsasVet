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
import { Edit, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, Stethoscope, User, FlaskConical, XCircle, CheckCircle } from "lucide-react";
import InternmentEditForm, { InternmentEditFormValues } from "./InternmentEditForm";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { InternedPatient } from "@/pages/Internacao"; // Importar a interface atualizada

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternmentDetailsDialogProps {
  patient: InternedPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: InternedPatient) => void;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

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
      setIsEditing(false);
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
      case "Óbito":
        return "bg-black text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleFormSubmit = (data: InternmentEditFormValues) => {
    const updatedPatient: InternedPatient = {
      ...patient,
      bay_name: data.bayName,
      pet_name: data.petName,
      owner_name: data.ownerName,
      reason: data.reason,
      admission_date: format(data.admissionDate, "yyyy-MM-dd"),
      expected_discharge_date: data.expectedDischargeDate ? format(data.expectedDischargeDate, "yyyy-MM-dd") : null,
      veterinarian: data.veterinarian,
      status: data.status,
      species: data.species,
      risk: data.risk,
    };
    console.log("InternmentDetailsDialog: Submitting form, updatedPatient:", updatedPatient); // Log para verificar
    onUpdate(updatedPatient);
    setIsEditing(false);
    onClose();
  };

  const handleRegisterDischarge = () => {
    if (window.confirm(`Tem certeza que deseja registrar a alta de ${patient.pet_name}?`)) {
      const updatedPatient: InternedPatient = {
        ...patient,
        status: "Alta",
        expected_discharge_date: format(new Date(), "yyyy-MM-dd"),
      };
      console.log("InternmentDetailsDialog: Registering discharge, updatedPatient:", updatedPatient); // Log para verificar
      onUpdate(updatedPatient);
      onClose();
    }
  };

  const handleRegisterObito = () => {
    if (window.confirm(`Tem certeza que deseja registrar o óbito de ${patient.pet_name}? Esta ação não pode ser desfeita.`)) {
      const updatedPatient: InternedPatient = {
        ...patient,
        status: "Óbito",
        expected_discharge_date: format(new Date(), "yyyy-MM-dd"),
      };
      console.log("InternmentDetailsDialog: Registering obito, updatedPatient:", updatedPatient); // Log para verificar
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
            {isEditing ? "Editar Paciente Internado" : `Detalhes do Paciente: ${patient.pet_name}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações necessárias e salve."
              : `Informações completas sobre ${patient.pet_name}.`}
          </DialogDescription>
        </DialogHeader>

        {!isEditing && !isFinalized && (
          <div className="flex justify-end space-x-2 mb-4">
            <Button variant="default" onClick={handleRegisterDischarge} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 h-4 w-4" /> Registrar Alta
            </Button>
            <Button variant="destructive" onClick={handleRegisterObito}>
              <XCircle className="mr-2 h-4 w-4" /> Registrar Óbito
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>
        )}

        {isEditing ? (
          <InternmentEditForm initialData={{
            ...patient,
            bayName: patient.bay_name,
            petName: patient.pet_name,
            ownerName: patient.owner_name,
            admissionDate: patient.admission_date,
            expectedDischargeDate: patient.expected_discharge_date,
          }} onSubmit={handleFormSubmit} onCancel={() => setIsEditing(false)} />
        ) : (
          <div className="grid gap-4 py-4">
            {/* Removido: Exibição do ID do paciente */}
            {/* <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">ID:</p>
              <p className="col-span-2 text-sm">{patient.id}</p>
            </div>
            <Separator /> */}
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Baia:</p>
              <p className="col-span-2 text-sm font-bold">{patient.bay_name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Nome do Animal:</p>
              <p className="col-span-2 text-sm font-bold">{patient.pet_name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Tutor:</p>
              <p className="col-span-2 text-sm flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {patient.owner_name}
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
                {patient.admission_date}
              </p>
            </div>
            {patient.expected_discharge_date && (
              <>
                <Separator />
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium text-muted-foreground">Previsão Alta:</p>
                  <p className="col-span-2 text-sm flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    {patient.expected_discharge_date}
                  </p>
                </div>
              </>
            )}
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">Risco:</p>
              <div className="col-span-2 text-sm"> {/* Alterado de <p> para <div> */}
                <Badge className={cn(riskColorMap[patient.risk as RiskLevel], "text-white")}>
                  {patient.risk}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InternmentDetailsDialog;
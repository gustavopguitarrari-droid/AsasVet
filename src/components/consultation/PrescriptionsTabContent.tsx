"use client";

import React, { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, Pill, FileText, ListPlus } from "lucide-react";
import { MedicalRecordFormValues } from "./MedicalRecordForm";
import { showSuccess, showError } from "@/utils/toast";

// Define a local type for the single prescription being added
interface SinglePrescriptionInput {
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface PrescriptionsTabContentProps {
  onGenerateRecipePdf: (prescriptions: MedicalRecordFormValues['prescriptions']) => void;
}

const PrescriptionsTabContent: React.FC<PrescriptionsTabContentProps> = ({ onGenerateRecipePdf }) => {
  const { control, getValues, trigger } = useFormContext<MedicalRecordFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "prescriptions",
  });

  const [newPrescriptionInput, setNewPrescriptionInput] = useState<SinglePrescriptionInput>({
    medication: "",
    dosage: "",
    frequency: "",
    instructions: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPrescriptionInput(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrescriptionToList = () => {
    // Basic validation for the new prescription input
    if (!newPrescriptionInput.medication.trim()) {
      showError("O nome do medicamento é obrigatório.");
      return;
    }
    if (!newPrescriptionInput.dosage.trim()) {
      showError("A dosagem é obrigatória.");
      return;
    }
    if (!newPrescriptionInput.frequency.trim()) {
      showError("A frequência é obrigatória.");
      return;
    }

    append(newPrescriptionInput); // Add the current input to the array
    setNewPrescriptionInput({ // Clear the input fields
      medication: "",
      dosage: "",
      frequency: "",
      instructions: "",
    });
    showSuccess("Prescrição adicionada à lista!");
    // Trigger validation for the main form's prescriptions field to update overall form validity
    trigger("prescriptions");
  };

  const handleRemovePrescription = (index: number) => {
    remove(index);
    showSuccess("Prescrição removida da lista.");
    trigger("prescriptions"); // Trigger validation
  };

  const handleGenerateRecipe = () => {
    if (!fields || fields.length === 0) {
      showError("Adicione prescrições à lista antes de gerar a receita.");
      return;
    }
    onGenerateRecipePdf(fields); // Call the prop to generate PDF
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center text-lg font-semibold">
        <Pill className="h-5 w-5 mr-2" /> Adicionar Nova Prescrição
      </Label>

      {/* Input fields for a single new prescription */}
      <div className="border p-4 rounded-md space-y-3 bg-muted/20">
        <div className="grid gap-2">
          <Label htmlFor="medication">Medicamento</Label>
          <Input
            id="medication"
            name="medication"
            placeholder="Nome do medicamento"
            value={newPrescriptionInput.medication}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dosage">Dosagem</Label>
            <Input
              id="dosage"
              name="dosage"
              placeholder="Ex: 5mg, 1 comprimido"
              value={newPrescriptionInput.dosage}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequência</Label>
            <Input
              id="frequency"
              name="frequency"
              placeholder="Ex: 12/12h, 1x ao dia"
              value={newPrescriptionInput.frequency}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="instructions">Instruções (Opcional)</Label>
          <Textarea
            id="instructions"
            name="instructions"
            placeholder="Instruções adicionais de uso..."
            rows={2}
            value={newPrescriptionInput.instructions}
            onChange={handleInputChange}
          />
        </div>
        <Button
          type="button"
          onClick={handleAddPrescriptionToList}
          className="w-full"
          disabled={
            !newPrescriptionInput.medication.trim() ||
            !newPrescriptionInput.dosage.trim() ||
            !newPrescriptionInput.frequency.trim()
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Acrescentar na Receita
        </Button>
      </div>

      <Label className="flex items-center text-lg font-semibold mt-6">
        <ListPlus className="h-5 w-5 mr-2" /> Prescrições na Lista
      </Label>
      {fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma prescrição adicionada à lista ainda.</p>
      ) : (
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative border p-4 rounded-md space-y-3 bg-card">
                <h4 className="text-md font-semibold text-muted-foreground">Prescrição #{index + 1}</h4>
                <p className="text-sm"><span className="font-medium">Medicamento:</span> {field.medication}</p>
                <p className="text-sm"><span className="font-medium">Dosagem:</span> {field.dosage}</p>
                <p className="text-sm"><span className="font-medium">Frequência:</span> {field.frequency}</p>
                {field.instructions && field.instructions.trim() !== '' && <p className="text-sm"><span className="font-medium">Instruções:</span> {field.instructions}</p>}
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemovePrescription(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remover Prescrição</span>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex space-x-2 mt-4">
        <Button
          type="button"
          onClick={handleGenerateRecipe}
          className="flex-1"
          disabled={fields.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" /> Gerar Receita
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionsTabContent;
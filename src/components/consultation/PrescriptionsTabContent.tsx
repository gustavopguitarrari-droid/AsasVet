"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, Pill } from "lucide-react";
import { MedicalRecordFormValues } from "./MedicalRecordForm";

const PrescriptionsTabContent: React.FC = () => {
  const { control } = useFormContext<MedicalRecordFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "prescriptions",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center text-lg font-semibold">
          <Pill className="h-5 w-5 mr-2" /> Prescrições
        </Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ medication: "", dosage: "", frequency: "", instructions: "" })}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Prescrição
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-muted-foreground text-sm">Nenhuma prescrição adicionada ainda.</p>
      )}
      <ScrollArea className="max-h-[300px] pr-4">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="relative border p-4 rounded-md space-y-3 bg-muted/20">
              <h4 className="text-md font-semibold text-muted-foreground">Prescrição #{index + 1}</h4>
              <FormField
                control={control}
                name={`prescriptions.${index}.medication`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do medicamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`prescriptions.${index}.dosage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosagem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 5mg, 1 comprimido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`prescriptions.${index}.frequency`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12/12h, 1x ao dia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={`prescriptions.${index}.instructions`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Instruções adicionais de uso..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remover Prescrição</span>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PrescriptionsTabContent;
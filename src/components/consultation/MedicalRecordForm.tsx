"use client";

import React from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form"; // Importar UseFormReturn
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Stethoscope, FlaskConical, ClipboardList, HeartPulse, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label"; // Importar o componente Label

// Esquema de validação para um item de prescrição
const prescriptionItemSchema = z.object({
  medication: z.string().min(1, "Nome do medicamento é obrigatório."),
  dosage: z.string().min(1, "Dosagem é obrigatória."),
  frequency: z.string().min(1, "Frequência é obrigatória."),
  instructions: z.string().optional(),
});

// Esquema de validação para o formulário completo do prontuário médico
const medicalRecordFormSchema = z.object({
  anamnesis: z.string().min(1, "A anamnese é obrigatória."), // Tornando obrigatório
  physicalExam: z.string().min(1, "O exame físico é obrigatório."), // Tornando obrigatório
  diagnosis: z.string().min(1, "O diagnóstico é obrigatório."), // Tornando obrigatório
  treatment: z.string().min(1, "O tratamento é obrigatório."), // Tornando obrigatório
  prescriptions: z.array(prescriptionItemSchema).optional(),
});

export type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

// Definir a interface para a instância do formulário que será exposta
export interface MedicalRecordFormInstance {
  handleSubmit: UseFormReturn<MedicalRecordFormValues>['handleSubmit'];
  trigger: UseFormReturn<MedicalRecordFormValues>['trigger'];
  formState: UseFormReturn<MedicalRecordFormValues>['formState'];
  getValues: UseFormReturn<MedicalRecordFormValues>['getValues'];
}

interface MedicalRecordFormProps {
  initialData?: MedicalRecordFormValues;
  onSubmit: (data: MedicalRecordFormValues) => void;
  isSubmitting: boolean;
  formRef?: React.Ref<MedicalRecordFormInstance>; // Nova prop para expor a instância do formulário
  onValidationChange?: (isValid: boolean) => void; // Nova prop para notificar sobre a validade
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ initialData, onSubmit, isSubmitting, formRef, onValidationChange }) => {
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      anamnesis: initialData?.anamnesis || "",
      physicalExam: initialData?.physicalExam || "",
      diagnosis: initialData?.diagnosis || "",
      treatment: initialData?.treatment || "",
      prescriptions: initialData?.prescriptions || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  });

  // Expor a instância do formulário através do ref
  React.useImperativeHandle(formRef, () => ({
    handleSubmit: form.handleSubmit,
    trigger: form.trigger,
    formState: form.formState,
    getValues: form.getValues,
  }));

  // Notificar o componente pai sobre as mudanças na validade do formulário
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(form.formState.isValid);
    }
  }, [form.formState.isValid, onValidationChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" /> Prontuário Médico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="anamnesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" /> Anamnese
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Histórico do paciente, queixas principais..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physicalExam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <HeartPulse className="h-4 w-4 mr-2 text-muted-foreground" /> Exame Físico
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Resultados do exame físico..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FlaskConical className="h-4 w-4 mr-2 text-muted-foreground" /> Diagnóstico
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Diagnóstico da condição do paciente..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Pill className="h-4 w-4 mr-2 text-muted-foreground" /> Tratamento
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Plano de tratamento e recomendações..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        control={form.control}
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
                          control={form.control}
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
                          control={form.control}
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
                        control={form.control}
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

            <Separator />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Salvando Prontuário..." : "Salvar Prontuário"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MedicalRecordForm;
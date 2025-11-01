"use client";

import React from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form"; // Importar FormProvider
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Importar Tabs
import { ClipboardList, Stethoscope, HeartPulse, FlaskConical, Pill } from "lucide-react"; // Importar ícones

// Importar os novos componentes de conteúdo das abas
import AnamnesisTabContent from "./AnamnesisTabContent";
import PhysicalExamTabContent from "./AnamnesisTabContent"; // Reutilizando para o exemplo
import DiagnosisTabContent from "./DiagnosisTabContent";
import TreatmentTabContent from "./TreatmentTabContent";
import PrescriptionsTabContent from "./PrescriptionsTabContent";

// Esquema de validação para um item de prescrição
const prescriptionItemSchema = z.object({
  medication: z.string().min(1, "Nome do medicamento é obrigatório."),
  dosage: z.string().min(1, "Dosagem é obrigatória."),
  frequency: z.string().min(1, "Frequência é obrigatória."),
  instructions: z.string().optional(),
});

// Esquema de validação para o formulário completo do prontuário médico
const medicalRecordFormSchema = z.object({
  anamnesis: z.string().min(1, "A anamnese é obrigatória."),
  physicalExam: z.string().min(1, "O exame físico é obrigatório."),
  diagnosis: z.string().min(1, "O diagnóstico é obrigatório."),
  treatment: z.string().min(1, "O tratamento é obrigatório."),
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
  formRef?: React.Ref<MedicalRecordFormInstance>;
  onValidationChange?: (isValid: boolean) => void;
  onGenerateRecipePdf: (prescriptions: MedicalRecordFormValues['prescriptions']) => void; // NOVO: Prop para gerar PDF
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ initialData, onSubmit, isSubmitting, formRef, onValidationChange, onGenerateRecipePdf }) => {
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      anamnesis: initialData?.anamnesis || `Queixa principal:\nHistórico da doença atual:\nHistórico médico pregresso:\nVacinação:\nAlimentação:\nAmbiente:\nComportamento:`,
      physicalExam: initialData?.physicalExam || `Estado geral:\nTemperatura:\nFrequência cardíaca:\nFrequência respiratória:\nMucosas:\nLinfonodos:\nPalpação abdominal:\nSistema locomotor:\nSistema nervoso:\nPele e anexos:`,
      diagnosis: initialData?.diagnosis || `Diagnóstico diferencial:\nHipótese diagnóstica principal:\nExames complementares solicitados:`,
      treatment: initialData?.treatment || `Plano terapêutico:\nMedicações (se não for usar a aba de prescrições):\nOrientações ao tutor:\nPróximo retorno:`,
      prescriptions: initialData?.prescriptions || [],
    },
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
        <FormProvider {...form}> {/* Envolve o formulário com FormProvider */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="anamnesis" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1">
                <TabsTrigger value="anamnesis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm py-2 font-bold flex items-center">
                  <Stethoscope className="h-4 w-4 mr-1" /> Anamnese
                </TabsTrigger>
                <TabsTrigger value="physicalExam" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm py-2 font-bold flex items-center">
                  <HeartPulse className="h-4 w-4 mr-1" /> Exame Físico
                </TabsTrigger>
                <TabsTrigger value="diagnosis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm py-2 font-bold flex items-center">
                  <FlaskConical className="h-4 w-4 mr-1" /> Suspeita
                </TabsTrigger>
                <TabsTrigger value="treatment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm py-2 font-bold flex items-center">
                  <Pill className="h-4 w-4 mr-1" /> Tratamento
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm py-2 font-bold flex items-center">
                  <Pill className="h-4 w-4 mr-1" /> Prescrições
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 p-4 border rounded-md bg-muted/20">
                <TabsContent value="anamnesis">
                  <AnamnesisTabContent />
                </TabsContent>
                <TabsContent value="physicalExam">
                  <PhysicalExamTabContent />
                </TabsContent>
                <TabsContent value="diagnosis">
                  <DiagnosisTabContent />
                </TabsContent>
                <TabsContent value="treatment">
                  <TreatmentTabContent />
                </TabsContent>
                <TabsContent value="prescriptions">
                  <PrescriptionsTabContent onGenerateRecipePdf={onGenerateRecipePdf} /> {/* Passa a prop aqui */}
                </TabsContent>
              </div>
            </Tabs>

            <Separator />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Salvando Prontuário..." : "Salvar Prontuário"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default MedicalRecordForm;
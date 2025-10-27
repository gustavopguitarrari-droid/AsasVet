"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, Edit, Save, FlaskConical, Stethoscope, Microscope, HeartPulse, Pill } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PrescriptionItemForm, { PrescriptionItemFormValues, prescriptionSchema } from './PrescriptionItemForm';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export const medicalRecordSchema = z.object({
  anamnesis: z.string().optional(),
  physical_exam: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescriptions: z.array(prescriptionSchema).optional(),
});

export type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordFormProps {
  initialData?: MedicalRecordFormValues;
  onSubmit: (data: MedicalRecordFormValues) => void;
  isSubmitting: boolean;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: initialData || {
      anamnesis: '',
      physical_exam: '',
      diagnosis: '',
      treatment: '',
      prescriptions: [],
    },
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItemFormValues[]>(initialData?.prescriptions || []);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);

  useEffect(() => {
    form.reset(initialData);
    setPrescriptions(initialData?.prescriptions || []);
  }, [initialData, form]);

  useEffect(() => {
    form.setValue('prescriptions', prescriptions);
  }, [prescriptions, form]);

  const handleAddPrescription = (data: PrescriptionItemFormValues) => {
    setPrescriptions(prev => [...prev, { ...data, id: uuidv4() }]);
  };

  const handleEditPrescription = (id: string) => {
    setEditingPrescriptionId(id);
  };

  const handleSaveEditedPrescription = (data: PrescriptionItemFormValues) => {
    setPrescriptions(prev => prev.map(item => (item.id === data.id ? data : item)));
    setEditingPrescriptionId(null);
  };

  const handleCancelEditPrescription = () => {
    setEditingPrescriptionId(null);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (data: MedicalRecordFormValues) => {
    onSubmit({ ...data, prescriptions });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="anamnesis" className="w-full">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <TabsList className="w-full justify-start h-auto p-1">
              <TabsTrigger value="anamnesis" className="flex items-center text-base py-2">
                <FlaskConical className="mr-2 h-4 w-4" /> Anamnese
              </TabsTrigger>
              <TabsTrigger value="physical_exam" className="flex items-center text-base py-2">
                <Stethoscope className="mr-2 h-4 w-4" /> Exame Físico
              </TabsTrigger>
              <TabsTrigger value="diagnosis" className="flex items-center text-base py-2">
                <Microscope className="mr-2 h-4 w-4" /> Diagnóstico
              </TabsTrigger>
              <TabsTrigger value="treatment" className="flex items-center text-base py-2">
                <HeartPulse className="mr-2 h-4 w-4" /> Tratamento
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center text-base py-2">
                <Pill className="mr-2 h-4 w-4" /> Prescrições
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="anamnesis" className="mt-4">
            <FormField
              control={form.control}
              name="anamnesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anamnese</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o histórico do paciente, queixas principais, etc."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="physical_exam" className="mt-4">
            <FormField
              control={form.control}
              name="physical_exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exame Físico</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os achados do exame físico (temperatura, mucosas, palpação, etc.)."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-4">
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o diagnóstico provável ou definitivo."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="treatment" className="mt-4">
            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de Tratamento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o plano de tratamento, procedimentos realizados, orientações ao tutor."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Nova Prescrição</h3>
            <PrescriptionItemForm onSave={handleAddPrescription} />

            <Separator />

            <h3 className="text-lg font-semibold">Prescrições Atuais ({prescriptions.length})</h3>
            <ScrollArea className={cn("h-[250px] rounded-md border p-4", prescriptions.length === 0 && "flex items-center justify-center")}>
              {prescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma prescrição adicionada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((item) => (
                    <div key={item.id} className="p-3 border rounded-md bg-card">
                      {editingPrescriptionId === item.id ? (
                        <PrescriptionItemForm
                          initialData={item}
                          onSave={handleSaveEditedPrescription}
                          onCancel={handleCancelEditPrescription}
                          isEditing
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.medication} - {item.dosage}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.frequency} via {item.route}
                            </p>
                            {item.notes && <p className="text-xs text-muted-foreground italic mt-1">{item.notes}</p>}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPrescription(item.id!)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleRemovePrescription(item.id!)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remover</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-5 w-5" />
            {isSubmitting ? "Salvando Prontuário..." : "Salvar Prontuário"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MedicalRecordForm;
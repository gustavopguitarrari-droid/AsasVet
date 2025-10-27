"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save, XCircle } from 'lucide-react';

export const prescriptionSchema = z.object({
  id: z.string().optional(), // Optional for new items
  medication: z.string().min(1, "O nome do medicamento é obrigatório."),
  dosage: z.string().min(1, "A dosagem é obrigatória."),
  frequency: z.string().min(1, "A frequência é obrigatória."),
  route: z.string().min(1, "A via de administração é obrigatória."),
  notes: z.string().optional(),
});

export type PrescriptionItemFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionItemFormProps {
  initialData?: PrescriptionItemFormValues;
  onSave: (data: PrescriptionItemFormValues) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const PrescriptionItemForm: React.FC<PrescriptionItemFormProps> = ({ initialData, onSave, onCancel, isEditing }) => {
  const form = useForm<PrescriptionItemFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData || {
      medication: '',
      dosage: '',
      frequency: '',
      route: '',
      notes: '',
    },
  });

  const handleSubmit = (data: PrescriptionItemFormValues) => {
    onSave(data);
    if (!isEditing) {
      form.reset(); // Clear form for new entry
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 p-4 border rounded-md bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="medication"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Amoxicilina" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosagem</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 250mg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequência</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SID">SID (Uma vez ao dia)</SelectItem>
                    <SelectItem value="BID">BID (Duas vezes ao dia)</SelectItem>
                    <SelectItem value="TID">TID (Três vezes ao dia)</SelectItem>
                    <SelectItem value="QID">QID (Quatro vezes ao dia)</SelectItem>
                    <SelectItem value="A cada 6h">A cada 6h</SelectItem>
                    <SelectItem value="A cada 8h">A cada 8h</SelectItem>
                    <SelectItem value="A cada 12h">A cada 12h</SelectItem>
                    <SelectItem value="Conforme Necessário">Conforme Necessário</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Via de Adm.</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a via" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Oral">Oral</SelectItem>
                    <SelectItem value="IV">Intravenosa (IV)</SelectItem>
                    <SelectItem value="SC">Subcutânea (SC)</SelectItem>
                    <SelectItem value="IM">Intramuscular (IM)</SelectItem>
                    <SelectItem value="Tópica">Tópica</SelectItem>
                    <SelectItem value="Outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Instruções adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
          <Button type="submit">
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isEditing ? "Salvar Alterações" : "Adicionar Prescrição"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PrescriptionItemForm;
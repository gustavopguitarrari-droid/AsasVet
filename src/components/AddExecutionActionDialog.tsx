"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ExecutionAction } from "@/types/internment";

const formSchema = z.object({
  type: z.enum(["Medicação", "Parâmetro", "Alimentação", "Outro"], {
    required_error: "O tipo de ação é obrigatório.",
  }),
  description: z.string().min(1, "A descrição da ação é obrigatória."),
  scheduledTime: z.string().min(1, "O horário agendado é obrigatório."),
  notes: z.string().optional(),
});

export type AddExecutionActionFormValues = z.infer<typeof formSchema>;

interface AddExecutionActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  date: Date; // Data da execução
  initialHour: string; // Horário inicial para a ação
  onSubmit: (data: AddExecutionActionFormValues) => void;
}

const AddExecutionActionDialog: React.FC<AddExecutionActionDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  date,
  initialHour,
  onSubmit,
}) => {
  const form = useForm<AddExecutionActionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Medicação",
      description: "",
      scheduledTime: `${initialHour}:00`, // Formato HH:mm
      notes: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        type: "Medicação",
        description: "",
        scheduledTime: `${initialHour}:00`,
        notes: "",
      });
    }
  }, [isOpen, initialHour, form]);

  const handleSubmit = (data: AddExecutionActionFormValues) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Adicionar Ação para {patientName}</DialogTitle>
          <DialogDescription>
            Agendar uma medicação, parâmetro ou alimentação para {format(date, "dd/MM/yyyy", { locale: ptBR })}.
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Ação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de ação" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Medicação">Medicação</SelectItem>
                  <SelectItem value="Parâmetro">Parâmetro</SelectItem>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 200mg Amoxicilina, Temperatura, Ração úmida" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Agendado</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionais sobre a ação..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit">Adicionar Ação</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AddExecutionActionDialog;
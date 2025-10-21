"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogContent, Dialog } from "@/components/ui/dialog";

const formSchema = z.object({
  description: z.string().min(1, "A descrição da ação é obrigatória."),
  type: z.enum(["Medicação", "Alimentação", "Observação", "Outro"], {
    required_error: "O tipo de ação é obrigatório.",
  }),
});

export type PatientActionFormValues = z.infer<typeof formSchema>;

interface AddPatientActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientActionFormValues) => void;
  patientName: string;
  date: Date;
  hour: string;
}

const AddPatientActionDialog: React.FC<AddPatientActionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  date,
  hour,
}) => {
  const form = useForm<PatientActionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      type: "Medicação",
    },
  });

  const handleFormSubmit = (data: PatientActionFormValues) => {
    onSubmit(data);
    form.reset(); // Limpa o formulário após o envio
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Ação para {patientName}</DialogTitle>
          <DialogDescription>
            Agendamento para {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"} às {hour || "Hora inválida"}:00
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Ação</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Administrar 5ml de antibiótico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <SelectItem value="Alimentação">Alimentação</SelectItem>
                    <SelectItem value="Observação">Observação</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
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
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientActionDialog;
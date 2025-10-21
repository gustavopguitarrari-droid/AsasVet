"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusCircle, Trash2 } from "lucide-react";

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
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const singleActionSchema = z.object({
  description: z.string().min(1, "A descrição da ação é obrigatória."),
  type: z.enum(["Medicação", "Alimentação", "Observação", "Outro"], {
    required_error: "O tipo de ação é obrigatório.",
  }),
});

const formSchema = z.object({
  actions: z.array(singleActionSchema).min(1, "Adicione pelo menos uma ação."),
});

export type MultiplePatientActionsFormValues = z.infer<typeof formSchema>;
export type SinglePatientActionFormValue = z.infer<typeof singleActionSchema>;

interface AddMultiplePatientActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SinglePatientActionFormValue[]) => void;
  patientName: string;
  date: Date;
  hour: string;
}

const AddMultiplePatientActionsDialog: React.FC<AddMultiplePatientActionsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  date,
  hour,
}) => {
  const form = useForm<MultiplePatientActionsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actions: [{ description: "", type: "Medicação" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const handleFormSubmit = (data: MultiplePatientActionsFormValues) => {
    onSubmit(data.actions);
    form.reset({ actions: [{ description: "", type: "Medicação" }] }); // Reset form with one empty action
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Ações para {patientName}</DialogTitle>
          <DialogDescription>
            Agendamento para {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"} às {hour || "Hora inválida"}:00
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-4 -mr-4"> {/* Added negative margin to counteract scrollbar width */}
              <div className="space-y-6 p-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-md space-y-4 relative">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Ação</span>
                      </Button>
                    )}
                    <FormField
                      control={form.control}
                      name={`actions.${index}.description`}
                      render={({ field: actionField }) => (
                        <FormItem>
                          <FormLabel>Descrição da Ação {index + 1}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ex: Administrar 5ml de antibiótico" {...actionField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`actions.${index}.type`}
                      render={({ field: actionField }) => (
                        <FormItem>
                          <FormLabel>Tipo de Ação {index + 1}</FormLabel>
                          <Select onValueChange={actionField.onChange} defaultValue={actionField.value}>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ description: "", type: "Medicação" })}
              className="mt-4 w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Mais Ações
            </Button>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button type="submit">Salvar Ações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMultiplePatientActionsDialog;
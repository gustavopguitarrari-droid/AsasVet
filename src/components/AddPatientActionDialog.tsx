"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Corrigido de '*s z' para '* as z'
import { format, isValid, addDays, parseISO, isEqual, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Syringe, Utensils, Eye, FlaskConical } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PatientAction } from "@/pages/Internacao";

const formSchema = z.object({
  description: z.string().min(1, "A descrição da ação é obrigatória."),
  type: z.enum(["Medicação", "Alimentação", "Observação", "Outro"], {
    required_error: "O tipo de ação é obrigatória.",
  }),
  frequency: z.enum(["SID", "BID", "TID", "QID", "Outro"]).optional(),
  durationInDays: z.number().min(1, "A duração deve ser de pelo menos 1 dia.").default(1),
  quantity: z.string().optional(),
  route: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "Medicação") {
    if (!data.quantity || data.quantity.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A quantidade é obrigatória para medicação.",
        path: ["quantity"],
      });
    }
    if (!data.route || data.route.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A via de administração é obrigatória para medicação.",
        path: ["route"],
      });
    }
  }
});

export type PatientActionFormValues = z.infer<typeof formSchema>;

interface AddPatientActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAllActions: (actions: PatientAction[]) => void;
  patientId: string;
  patientName: string;
  date: Date;
  initialHour: string;
  allActionsForCurrentPatient: PatientAction[];
}

const actionTypeIconMap: Record<PatientActionFormValues["type"], React.ElementType> = {
  Medicação: Syringe,
  Alimentação: Utensils,
  Observação: Eye,
  Outro: FlaskConical,
};

const getHoursForFrequency = (initialHour: string, frequency: PatientAction["frequency"]): string[] => {
  const startHour = parseInt(initialHour, 10);
  let hours: number[] = [];

  switch (frequency) {
    case "SID":
      hours = [startHour];
      break;
    case "BID":
      hours = [startHour, (startHour + 12) % 24];
      break;
    case "TID":
      hours = [startHour, (startHour + 8) % 24, (startHour + 16) % 24];
      break;
    case "QID":
      hours = [startHour, (startHour + 6) % 24, (startHour + 12) % 24, (startHour + 18) % 24];
      break;
    case "Outro":
    default:
      hours = [startHour];
      break;
  }
  return Array.from(new Set(hours))
    .sort((a, b) => a - b)
    .map(h => h.toString().padStart(2, '0'));
};

const generateUniqueActionId = () => `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const AddPatientActionDialog: React.FC<AddPatientActionDialogProps> = ({
  isOpen,
  onClose,
  onSaveAllActions,
  patientId,
  patientName,
  date,
  initialHour,
  allActionsForCurrentPatient,
}) => {
  const form = useForm<PatientActionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      type: "Medicação",
      frequency: "SID",
      durationInDays: 1,
      quantity: "",
      route: "",
    },
  });

  const [editedActions, setEditedActions] = useState<PatientAction[]>([]);

  useEffect(() => {
    if (isOpen) {
      console.log("AddPatientActionDialog: useEffect - allActionsForCurrentPatient received:", allActionsForCurrentPatient);
      // Garante que editedActions seja sempre um array, mesmo que allActionsForCurrentPatient seja undefined/null
      setEditedActions(allActionsForCurrentPatient || []); 
      form.reset({
        description: "",
        type: "Medicação",
        frequency: "SID",
        durationInDays: 1,
        quantity: "",
        route: "",
      });
    }
  }, [isOpen, form, allActionsForCurrentPatient]);

  const frequencyWatch = form.watch("frequency");
  const typeWatch = form.watch("type");

  const handleAddAction = (data: PatientActionFormValues) => {
    const duration = data.frequency === "Outro" ? 1 : data.durationInDays;
    const newActions: PatientAction[] = [];

    for (let i = 0; i < duration; i++) {
      const currentDate = addDays(date, i);
      const formattedCurrentDate = format(currentDate, "yyyy-MM-dd");
      const scheduledHours = getHoursForFrequency(initialHour, data.frequency);

      scheduledHours.forEach(hour => {
        newActions.push({
          id: generateUniqueActionId(),
          user_id: "", // Will be filled by mutation
          patient_id: patientId,
          date: formattedCurrentDate,
          hour: hour,
          description: data.description,
          type: data.type,
          is_completed: false,
          frequency: data.frequency,
          quantity: data.type === "Medicação" ? data.quantity : null,
          route: data.type === "Medicação" ? data.route : null,
          created_at: new Date().toISOString(),
        });
      });
    }

    setEditedActions(prevActions => {
      const existingActionsToKeep = prevActions.filter(action => {
        const isSamePatient = action.patient_id === patientId;
        const isSameType = action.type === data.type;
        const isSameFrequency = action.frequency === data.frequency;

        const actionDateObj = parseISO(action.date);
        const startDate = date;
        const endDate = addDays(date, duration - 1);

        const isWithinNewSeriesRange = isSamePatient && isSameType && isSameFrequency &&
                                       (isEqual(actionDateObj, startDate) || isAfter(actionDateObj, startDate)) &&
                                       (isEqual(actionDateObj, endDate) || isBefore(actionDateObj, endDate));

        return !isWithinNewSeriesRange;
      });

      return [...existingActionsToKeep, ...newActions];
    });

    form.reset({
      description: "",
      type: "Medicação",
      frequency: "SID",
      durationInDays: 1,
      quantity: "",
      route: "",
    });
  };

  const handleRemoveAction = (actionToRemove: PatientAction) => {
    setEditedActions((prev) => prev.filter((action) => action.id !== actionToRemove.id));
  };

  const handleSaveAndClose = () => {
    onSaveAllActions(editedActions);
  };

  const handleCancelAndClose = () => {
    onClose();
  };

  // Garante que editedActions seja um array antes de chamar reduce
  const actionsGroupedByDateAndHour = (editedActions || []).reduce((acc, action) => {
    const dateKey = action.date;
    const hourKey = action.hour;

    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    if (!acc[dateKey][hourKey]) {
      acc[dateKey][hourKey] = [];
    }
    acc[dateKey][hourKey].push(action);
    return acc;
  }, {} as Record<string, Record<string, PatientAction[]>>);

  const sortedDates = Object.keys(actionsGroupedByDateAndHour).sort();

  try {
    return (
      <Dialog open={isOpen} onOpenChange={handleCancelAndClose}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Ações para {patientName}</DialogTitle>
            <DialogDescription>
              Agendamento a partir de {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"} às {initialHour}:00.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto pr-2"> {/* Adicionado ScrollArea aqui */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddAction)} className="space-y-4">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

                    {typeWatch === "Medicação" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 5ml" {...field} />
                              </FormControl>
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
                              <FormControl>
                                <Input placeholder="Ex: Oral, IV, SC" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

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
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {frequencyWatch !== "Outro" && (
                      <FormField
                        control={form.control}
                        name="durationInDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duração (dias)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                                // Garante que o valor seja um número ou 1 como fallback
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Adicionar/Atualizar Ação
                    </Button>
                  </form>
                </Form>
              </div>

              <div className="space-y-4 flex flex-col">
                <h3 className="text-lg font-semibold">Ações Agendadas para o Paciente</h3>
                <ScrollArea className="flex-1 rounded-md border p-4">
                  {editedActions.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhuma ação adicionada ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {sortedDates.map(dateKey => (
                        <div key={dateKey} className="border-b pb-2 last:border-b-0">
                          <p className="font-bold text-md mb-2">
                            {format(parseISO(dateKey), "PPP", { locale: ptBR })}
                          </p>
                          <div className="space-y-2">
                            {Object.keys(actionsGroupedByDateAndHour[dateKey]).sort().map(hour => (
                              <div key={`${dateKey}-${hour}`} className="mb-2">
                                <p className="font-semibold text-sm mb-1">{hour}:00</p>
                                {actionsGroupedByDateAndHour[dateKey][hour].map((action) => {
                                  const ActionIcon = actionTypeIconMap[action.type] || FlaskConical;
                                  return (
                                    <div key={action.id} className="flex items-center justify-between p-2 border rounded-md bg-card mb-1">
                                      <div className="flex items-center">
                                        <ActionIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                        <p className="font-medium text-sm">
                                          {action.description}
                                          {action.type === "Medicação" && action.quantity && action.route && (
                                            <span className="text-xs text-muted-foreground ml-2">
                                              ({action.quantity} - {action.route})
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {action.frequency && (
                                          <Badge variant="secondary" className="text-xs">{action.frequency}</Badge>
                                        )}
                                        <Badge variant="secondary" className="mr-2">{action.type}</Badge>
                                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleRemoveAction(action)}>
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Remover</span>
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancelAndClose} type="button">
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveAndClose} disabled={editedActions.length === 0}>
              Salvar Todas as Ações ({editedActions.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  } catch (error) {
    console.error("Error rendering AddPatientActionDialog:", error);
    return (
      <Dialog open={isOpen} onOpenChange={handleCancelAndClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro ao Carregar Ações</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Ocorreu um erro ao tentar carregar o diálogo de ações. Por favor, verifique o console do navegador para mais detalhes.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={handleCancelAndClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
};

export default AddPatientActionDialog;
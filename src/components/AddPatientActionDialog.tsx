"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isValid } from "date-fns";
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
import { cn } from "@/lib/utils"; // Import cn for utility classes
import { PatientAction } from "@/pages/Internacao"; // Import PatientAction type

const formSchema = z.object({
  description: z.string().min(1, "A descrição da ação é obrigatória."),
  type: z.enum(["Medicação", "Alimentação", "Observação", "Outro"], {
    required_error: "O tipo de ação é obrigatório.",
  }),
  frequency: z.enum(["SID", "BID", "TID", "QID", "Outro"]).optional(), // Novo campo de frequência
});

export type PatientActionFormValues = z.infer<typeof formSchema>;

interface AddPatientActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAllActions: (actions: PatientAction[]) => void; // Agora espera PatientAction[]
  patientId: string; // Novo: ID do paciente
  patientName: string;
  date: Date;
  initialHour: string; // Novo: Horário inicial da célula clicada
  allActionsForPatientOnDate: PatientAction[]; // Novo: Todas as ações do paciente para o dia
}

// Mapeamento de ícones para tipos de ação (reutilizado de ExecutionMapTable)
const actionTypeIconMap: Record<PatientActionFormValues["type"], React.ElementType> = {
  Medicação: Syringe,
  Alimentação: Utensils,
  Observação: Eye,
  Outro: FlaskConical,
};

// Helper para gerar horas com base na frequência
const getHoursForFrequency = (initialHour: string, frequency: PatientAction["frequency"]): string[] => {
  const startHour = parseInt(initialHour, 10);
  let hours: number[] = [];

  switch (frequency) {
    case "SID": // Uma vez ao dia, no horário inicial
      hours = [startHour];
      break;
    case "BID": // Duas vezes ao dia, 12 horas de diferença
      hours = [startHour, (startHour + 12) % 24];
      break;
    case "TID": // Três vezes ao dia, aproximadamente 8 horas de diferença
      hours = [startHour, (startHour + 8) % 24, (startHour + 16) % 24];
      break;
    case "QID": // Quatro vezes ao dia, aproximadamente 6 horas de diferença
      hours = [startHour, (startHour + 6) % 24, (startHour + 12) % 24, (startHour + 18) % 24];
      break;
    case "Outro": // Apenas no horário inicial
    default:
      hours = [startHour];
      break;
  }
  // Garante horas únicas e ordenadas, formatadas como "HH"
  return Array.from(new Set(hours))
    .sort((a, b) => a - b)
    .map(h => h.toString().padStart(2, '0'));
};

const AddPatientActionDialog: React.FC<AddPatientActionDialogProps> = ({
  isOpen,
  onClose,
  onSaveAllActions,
  patientId,
  patientName,
  date,
  initialHour,
  allActionsForPatientOnDate,
}) => {
  const form = useForm<PatientActionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      type: "Medicação",
      frequency: "SID", // Valor padrão para frequência
    },
  });

  const [currentDayActions, setCurrentDayActions] = useState<PatientAction[]>([]);

  // Inicializa currentDayActions com todas as ações do dia quando o diálogo abre
  useEffect(() => {
    if (isOpen) {
      setCurrentDayActions(allActionsForPatientOnDate);
      form.reset({
        description: "",
        type: "Medicação",
        frequency: "SID",
      });
    }
  }, [isOpen, form, allActionsForPatientOnDate]);

  const handleAddActionToCart = (data: PatientActionFormValues) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const scheduledHours = getHoursForFrequency(initialHour, data.frequency);

    // Cria as novas ações baseadas na frequência
    const newActionsForFrequency: PatientAction[] = scheduledHours.map(hour => ({
      id: `temp-${Date.now()}-${Math.random()}`, // ID temporário, será substituído no pai
      patientId: patientId,
      date: formattedDate,
      hour: hour,
      description: data.description,
      type: data.type,
      isCompleted: false,
      frequency: data.frequency,
    }));

    setCurrentDayActions(prevActions => {
      // Filtra as ações existentes para remover aquelas que serão substituídas
      // (mesmo paciente, mesma data, mesmo tipo e mesma frequência)
      const filteredPrevActions = prevActions.filter(action =>
        !(
          action.patientId === patientId &&
          action.date === formattedDate &&
          action.type === data.type &&
          action.frequency === data.frequency
        )
      );
      // Adiciona as novas ações geradas pela frequência
      return [...filteredPrevActions, ...newActionsForFrequency];
    });

    form.reset({
      description: "",
      type: "Medicação",
      frequency: "SID",
    });
  };

  const handleRemoveFromCart = (actionToRemove: PatientAction) => {
    setCurrentDayActions((prev) => prev.filter((action) => action.id !== actionToRemove.id));
  };

  const handleSaveAndClose = () => {
    onSaveAllActions(currentDayActions);
    onClose();
  };

  const handleCancelAndClose = () => {
    onClose();
  };

  // Agrupa as ações por hora para exibição
  const actionsGroupedByHour = currentDayActions.reduce((acc, action) => {
    const hour = action.hour;
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(action);
    return acc;
  }, {} as Record<string, PatientAction[]>);

  const sortedHours = Object.keys(actionsGroupedByHour).sort();

  return (
    <Dialog open={isOpen} onOpenChange={handleCancelAndClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Ações para {patientName}</DialogTitle>
          <DialogDescription>
            Agendamento para {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"}.
            Horário inicial clicado: {hour}:00
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Left side: Form to add new action */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddActionToCart)} className="space-y-4">
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
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar/Atualizar Ação
                </Button>
              </form>
            </Form>
          </div>

          {/* Right side: Actions in cart */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-lg font-semibold">Ações Agendadas para o Dia</h3>
            <ScrollArea className="flex-1 rounded-md border p-4">
              {currentDayActions.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma ação adicionada ainda.</p>
              ) : (
                <div className="space-y-4">
                  {sortedHours.map(hour => (
                    <div key={hour} className="border-b pb-2 last:border-b-0">
                      <p className="font-bold text-md mb-2">{hour}:00</p>
                      <div className="space-y-2">
                        {actionsGroupedByHour[hour].map((action, index) => {
                          const ActionIcon = actionTypeIconMap[action.type] || FlaskConical;
                          return (
                            <div key={action.id} className="flex items-center justify-between p-2 border rounded-md bg-card">
                              <div className="flex items-center">
                                <ActionIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                <p className="font-medium text-sm">{action.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {action.frequency && (
                                  <Badge variant="secondary" className="text-xs">{action.frequency}</Badge>
                                )}
                                <Badge variant="secondary" className="mr-2">{action.type}</Badge>
                                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleRemoveFromCart(action)}>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remover</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancelAndClose} type="button">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveAndClose} disabled={currentDayActions.length === 0}>
            Salvar Todas as Ações ({currentDayActions.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientActionDialog;
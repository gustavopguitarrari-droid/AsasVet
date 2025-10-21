"use client";

import React, { useState, useEffect } from "react";
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
  onSaveAllActions: (actions: PatientActionFormValues[]) => void;
  patientName: string;
  date: Date;
  hour: string;
}

// Mapeamento de ícones para tipos de ação (reutilizado de ExecutionMapTable)
const actionTypeIconMap: Record<PatientActionFormValues["type"], React.ElementType> = {
  Medicação: Syringe,
  Alimentação: Utensils,
  Observação: Eye,
  Outro: FlaskConical,
};

const AddPatientActionDialog: React.FC<AddPatientActionDialogProps> = ({
  isOpen,
  onClose,
  onSaveAllActions,
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

  const [currentActionsInCart, setCurrentActionsInCart] = useState<PatientActionFormValues[]>([]);

  // Reset cart and form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentActionsInCart([]);
      form.reset({
        description: "",
        type: "Medicação",
      });
    }
  }, [isOpen, form]);

  const handleAddActionToCart = (data: PatientActionFormValues) => {
    setCurrentActionsInCart((prev) => [...prev, data]);
    form.reset({
      description: "",
      type: "Medicação", // Reset to default type
    });
  };

  const handleRemoveFromCart = (indexToRemove: number) => {
    setCurrentActionsInCart((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveAndClose = () => {
    onSaveAllActions(currentActionsInCart);
    setCurrentActionsInCart([]); // Clear cart after saving
    onClose();
  };

  const handleCancelAndClose = () => {
    setCurrentActionsInCart([]); // Clear cart on cancel
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancelAndClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Ações para {patientName}</DialogTitle>
          <DialogDescription>
            Agendamento para {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"} às {hour || "Hora inválida"}:00
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Left side: Form to add new action */}
          <div className="space-y-4 overflow-y-auto pr-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddActionToCart)} className="space-y-4">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar à Lista
                </Button>
              </form>
            </Form>
          </div>

          {/* Right side: Actions in cart */}
          <div className="space-y-4 flex flex-col">
            <h3 className="text-lg font-semibold">Ações para {format(date, "dd/MM", { locale: ptBR })} às {hour}:00</h3>
            <ScrollArea className="flex-1 rounded-md border p-4">
              {currentActionsInCart.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma ação adicionada ainda.</p>
              ) : (
                <div className="space-y-2">
                  {currentActionsInCart.map((action, index) => {
                    const ActionIcon = actionTypeIconMap[action.type] || FlaskConical;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-card">
                        <div className="flex items-center">
                          <ActionIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                          <p className="font-medium text-sm">{action.description}</p>
                        </div>
                        <Badge variant="secondary" className="mr-2">{action.type}</Badge>
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleRemoveFromCart(index)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancelAndClose} type="button">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveAndClose} disabled={currentActionsInCart.length === 0}>
            Salvar Todas as Ações ({currentActionsInCart.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientActionDialog;
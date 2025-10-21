"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Syringe, Utensils, Eye, FlaskConical, CheckCircle, Edit } from "lucide-react"; // Importar o ícone Edit
import { cn } from "@/lib/utils";
import { PatientAction } from "@/pages/Internacao"; // Importar o tipo PatientAction

interface ConfirmPatientActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmActions: (updatedActions: PatientAction[]) => void;
  patientName: string;
  date: Date;
  hour: string;
  actionsForSlot: PatientAction[];
  onEditActionsClick: (patientId: string, patientName: string, date: Date, hour: string, initialActions: PatientAction[]) => void; // Nova prop
  patientId: string; // Adicionado para passar ao onEditActionsClick
}

// Mapeamento de ícones para tipos de ação
const actionTypeIconMap: Record<PatientAction["type"], React.ElementType> = {
  Medicação: Syringe,
  Alimentação: Utensils,
  Observação: Eye,
  Outro: FlaskConical,
};

const ConfirmPatientActionsDialog: React.FC<ConfirmPatientActionsDialogProps> = ({
  isOpen,
  onClose,
  onConfirmActions,
  patientName,
  date,
  hour,
  actionsForSlot,
  onEditActionsClick, // Recebe a nova prop
  patientId, // Recebe o ID do paciente
}) => {
  const [currentActionsStatus, setCurrentActionsStatus] = useState<PatientAction[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentActionsStatus(actionsForSlot);
    }
  }, [isOpen, actionsForSlot]);

  const handleCheckboxChange = (actionId: string, checked: boolean) => {
    setCurrentActionsStatus((prevStatus) =>
      prevStatus.map((action) =>
        action.id === actionId ? { ...action, isCompleted: checked } : action
      )
    );
  };

  const handleConfirm = () => {
    onConfirmActions(currentActionsStatus);
    onClose();
  };

  const handleEditClick = () => {
    onEditActionsClick(patientId, patientName, date, hour, actionsForSlot); // Chama a função de edição
    onClose(); // Fecha o diálogo atual
  };

  const allActionsCompleted = currentActionsStatus.every(action => action.isCompleted);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="relative"> {/* Adicionado relative para posicionar o botão */}
          <DialogTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> Confirmar Ações para {patientName}
          </DialogTitle>
          <DialogDescription>
            Marque as ações concluídas para {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"} às {hour || "Hora inválida"}:00.
          </DialogDescription>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8" // Posição no canto superior direito
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar Ações</span>
          </Button>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20 mb-4">
          {currentActionsStatus.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">Nenhuma ação agendada para este horário.</p>
          ) : (
            <div className="space-y-3">
              {currentActionsStatus.map((action) => {
                const ActionIcon = actionTypeIconMap[action.type] || FlaskConical;
                return (
                  <div
                    key={action.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md border",
                      action.isCompleted ? "bg-green-50 text-green-800 border-green-200" : "bg-card"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <Checkbox
                        id={`action-${action.id}`}
                        checked={action.isCompleted}
                        onCheckedChange={(checked) => handleCheckboxChange(action.id, checked as boolean)}
                        className="mr-3"
                      />
                      <ActionIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                      <label
                        htmlFor={`action-${action.id}`}
                        className={cn(
                          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                          action.isCompleted && "line-through text-muted-foreground"
                        )}
                      >
                        {action.description}
                      </label>
                    </div>
                    <Badge variant="secondary" className="ml-4">{action.type}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={currentActionsStatus.length === 0}>
            <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPatientActionsDialog;
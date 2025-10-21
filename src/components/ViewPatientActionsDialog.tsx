"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Syringe, Utensils, Eye, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { PatientAction } from "@/pages/Internacao"; // Import the PatientAction type

interface ViewPatientActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  date: Date;
  hour: string;
  actions: PatientAction[];
}

// Mapeamento de ícones para tipos de ação (reutilizado de ExecutionMapTable)
const actionTypeIconMap: Record<PatientAction["type"], React.ElementType> = {
  Medicação: Syringe,
  Alimentação: Utensils,
  Observação: Eye,
  Outro: FlaskConical,
};

const ViewPatientActionsDialog: React.FC<ViewPatientActionsDialogProps> = ({
  isOpen,
  onClose,
  patientName,
  date,
  hour,
  actions,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ações para {patientName}</DialogTitle>
          <DialogDescription>
            Ações agendadas para {date instanceof Date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : "Data inválida"} às {hour || "Hora inválida"}:00
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20 mb-4">
          <div className="space-y-3">
            {actions.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhuma ação agendada para este horário.</p>
            ) : (
              actions.map((action) => {
                const ActionIcon = actionTypeIconMap[action.type] || FlaskConical;
                return (
                  <div key={action.id} className="flex items-start space-x-3 p-3 rounded-md border bg-card">
                    <ActionIcon className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="font-medium">{action.description}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {action.type}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPatientActionsDialog;
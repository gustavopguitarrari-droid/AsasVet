"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X, Edit, Cake } from 'lucide-react';
import { cn } from "@/lib/utils";
import BirthdayPicker from './BirthdayPicker'; // Reutilizando o componente BirthdayPicker existente
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Importar Tooltip

interface EditableBirthdayFieldProps {
  label: string;
  value?: string; // YYYY-MM-DD string or undefined
  onSave: (newValue?: string) => void; // YYYY-MM-DD string or undefined
  className?: string;
}

const EditableBirthdayField: React.FC<EditableBirthdayFieldProps> = ({
  label,
  value,
  onSave,
  className,
}) => {
  const initialDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(initialDate);

  const handleSave = () => {
    onSave(tempDate ? format(tempDate, "yyyy-MM-dd") : undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempDate(initialDate); // Reset to original value
    setIsEditing(false);
  };

  const displayValue = value && isValid(parseISO(value)) ? format(parseISO(value), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

  return (
    <div className={cn("group flex items-center justify-between p-3 border rounded-lg transition-colors shadow-sm", className)}>
      <div className="flex items-center space-x-4">
        <Cake className="h-5 w-5 text-primary" />
        <Label className="text-base font-medium text-muted-foreground">{label}:</Label>
      </div>
      {isEditing ? (
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <BirthdayPicker value={tempDate} onChange={setTempDate} />
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 text-green-600 hover:bg-green-100 rounded-lg">
                <Check className="h-4 w-4" />
                <span className="sr-only">Salvar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="rounded-lg shadow-md">Salvar</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 text-destructive hover:bg-destructive-100 rounded-lg">
                <X className="h-4 w-4" />
                <span className="sr-only">Cancelar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="rounded-lg shadow-md">Cancelar</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="text-base font-semibold">{displayValue}</p>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="rounded-lg shadow-md">Editar</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default EditableBirthdayField;
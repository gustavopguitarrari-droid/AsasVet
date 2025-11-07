"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X, Edit } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Importar Tooltip

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  icon: React.ElementType;
  type?: "text" | "email";
  className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  icon: Icon,
  type = "text",
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value); // Reset to original value
    setIsEditing(false);
  };

  return (
    <div className={cn("group flex items-center justify-between p-3 border rounded-lg transition-colors shadow-sm", className)}>
      <div className="flex items-center space-x-4">
        <Icon className="h-5 w-5 text-primary" />
        <Label className="text-base font-medium text-muted-foreground">{label}:</Label>
      </div>
      {isEditing ? (
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="max-w-[150px] h-8 rounded-lg"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
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
          <p className="text-base font-semibold">{value}</p>
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

export default EditableField;
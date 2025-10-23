"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X, Edit, Briefcase } from 'lucide-react';
import { cn } from "@/lib/utils";
import RoleSelect from './RoleSelect'; // Reutilizando o componente RoleSelect existente

interface EditableRoleFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

const EditableRoleField: React.FC<EditableRoleFieldProps> = ({
  label,
  value,
  onSave,
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
    <div className={cn("group flex items-center justify-between p-3 border rounded-md transition-colors", className)}>
      <div className="flex items-center space-x-4">
        <Briefcase className="h-5 w-5 text-primary" />
        <Label className="text-base font-medium text-muted-foreground">{label}:</Label>
      </div>
      {isEditing ? (
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <RoleSelect value={tempValue} onValueChange={setTempValue} />
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 text-green-600 hover:bg-green-100">
            <Check className="h-4 w-4" />
            <span className="sr-only">Salvar</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 text-destructive hover:bg-destructive-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Cancelar</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="text-base font-semibold">{value}</p>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditableRoleField;
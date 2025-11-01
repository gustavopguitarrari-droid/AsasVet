"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical } from "lucide-react";
import { MedicalRecordFormValues } from "./MedicalRecordForm";

const DiagnosisTabContent: React.FC = () => {
  const { control } = useFormContext<MedicalRecordFormValues>();

  return (
    <FormField
      control={control}
      name="diagnosis"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <FlaskConical className="h-4 w-4 mr-2 text-muted-foreground" /> Suspeita
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder={`Diagnóstico diferencial:\nHipótese diagnóstica principal:\nExames complementares solicitados:`} 
              rows={8} 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DiagnosisTabContent;
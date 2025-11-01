"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope } from "lucide-react";
import { MedicalRecordFormValues } from "./MedicalRecordForm";

const AnamnesisTabContent: React.FC = () => {
  const { control } = useFormContext<MedicalRecordFormValues>();

  return (
    <FormField
      control={control}
      name="anamnesis"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" /> Anamnese
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder={`Queixa principal:\nHistórico da doença atual:\nHistórico médico pregresso:\nVacinação:\nAlimentação:\nAmbiente:\nComportamento:`} 
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

export default AnamnesisTabContent;
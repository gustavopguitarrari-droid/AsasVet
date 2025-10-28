"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Pill } from "lucide-react";
import { MedicalRecordFormValues } from "./MedicalRecordForm";

const TreatmentTabContent: React.FC = () => {
  const { control } = useFormContext<MedicalRecordFormValues>();

  return (
    <FormField
      control={control}
      name="treatment"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <Pill className="h-4 w-4 mr-2 text-muted-foreground" /> Tratamento
          </FormLabel>
          <FormControl>
            <Textarea placeholder="Plano de tratamento e recomendações..." rows={8} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TreatmentTabContent;
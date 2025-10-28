"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { HeartPulse } from "lucide-react";
import { MedicalRecordFormValues } from "./MedicalRecordForm";

const PhysicalExamTabContent: React.FC = () => {
  const { control } = useFormContext<MedicalRecordFormValues>();

  return (
    <FormField
      control={control}
      name="physicalExam"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <HeartPulse className="h-4 w-4 mr-2 text-muted-foreground" /> Exame Físico
          </FormLabel>
          <FormControl>
            <Textarea placeholder="Resultados do exame físico..." rows={8} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PhysicalExamTabContent;
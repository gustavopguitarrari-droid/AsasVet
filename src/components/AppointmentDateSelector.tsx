"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AppointmentFormValues } from "./AppointmentForm";

const AppointmentDateSelector: React.FC = () => {
  const { control, watch, setValue } = useFormContext<AppointmentFormValues>();
  const dateOption = watch("dateOption");
  const selectedDate = watch("date");

  React.useEffect(() => {
    // Se a opção for "today" e houver uma data específica selecionada, limpe-a.
    // Ou se a opção for "specific" e não houver data, defina a data atual como padrão.
    if (dateOption === "today") {
      setValue("date", undefined);
    } else if (dateOption === "specific" && !selectedDate) {
      setValue("date", new Date());
    }
  }, [dateOption, selectedDate, setValue]);

  return (
    <FormItem className="space-y-3">
      <FormLabel>Data da Consulta</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={(value: "today" | "specific") => setValue("dateOption", value)}
          value={dateOption}
          className="flex flex-col space-y-1"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="today" />
            </FormControl>
            <label htmlFor="today" className="font-normal cursor-pointer">Hoje (Em espera)</label> {/* CORREÇÃO AQUI */}
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="specific" />
            </FormControl>
            <label htmlFor="specific" className="font-normal cursor-pointer">Agendar para outra data específica</label> {/* CORREÇÃO AQUI */}
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormMessage />

      {dateOption === "specific" && (
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-4">
              <FormLabel>Selecione a Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormItem>
  );
};

export default AppointmentDateSelector;
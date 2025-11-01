"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BirthdayPickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
}

const BirthdayPicker: React.FC<BirthdayPickerProps> = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {/* Conteúdo do botão envolvido em uma única div */}
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={ptBR}
          captionLayout="dropdown-buttons" // Adiciona dropdowns para mês e ano
          fromYear={1900} // Define o ano inicial para seleção
          toYear={new Date().getFullYear()} // Define o ano final como o ano atual
        />
      </PopoverContent>
    </Popover>
  );
};

export default BirthdayPicker;
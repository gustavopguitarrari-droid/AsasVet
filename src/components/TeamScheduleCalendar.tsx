"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { DayPicker, DateFormatter } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Importa os estilos base do react-day-picker

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Veterinario {
  id: string;
  name: string;
  crmv: string;
  email: string;
  phone: string;
  role: string;
}

interface TeamScheduleCalendarProps {
  veterinarians: Veterinario[];
}

const TeamScheduleCalendar: React.FC<TeamScheduleCalendarProps> = ({ veterinarians }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingDaySchedule, setEditingDaySchedule] = useState<string[]>([]);
  
  // Estado para armazenar a escala, usando Map para melhor performance e clareza
  const [schedule, setSchedule] = useState<Map<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem('teamSchedule');
      if (savedSchedule) {
        try {
          // Converte a string JSON de volta para um Map
          return new Map(JSON.parse(savedSchedule));
        } catch (e) {
          console.error("Erro ao carregar a escala do localStorage:", e);
        }
      }
    }
    // Retorna um Map vazio se não houver dados salvos ou se houver erro
    return new Map<string, string[]>();
  });

  // Efeito para salvar a escala no localStorage sempre que ela mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Converte o Map para um array de arrays para poder ser serializado em JSON
      localStorage.setItem('teamSchedule', JSON.stringify(Array.from(schedule.entries())));
    }
  }, [schedule]);

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDay(day);
      const dayKey = format(day, "yyyy-MM-dd");
      setEditingDaySchedule(schedule.get(dayKey) || []);
      setIsDialogOpen(true);
    }
  };

  const handleAddRemoveVet = (vetName: string) => {
    if (!selectedDay) return;

    const dayKey = format(selectedDay, "yyyy-MM-dd");
    const currentVets = new Set(schedule.get(dayKey) || []);

    if (currentVets.has(vetName)) {
      currentVets.delete(vetName);
    } else {
      currentVets.add(vetName);
    }

    const newSchedule = new Map(schedule);
    if (currentVets.size > 0) {
      newSchedule.set(dayKey, Array.from(currentVets));
    } else {
      newSchedule.delete(dayKey); // Remove a entrada se não houver veterinários para o dia
    }
    setSchedule(newSchedule);
    setEditingDaySchedule(Array.from(currentVets)); // Atualiza o estado do diálogo imediatamente
  };

  // Componente de cabeçalho personalizado para navegação entre meses
  const CustomCaption: React.FC<{
    displayMonth: Date;
    goToMonth: (month: Date) => void;
    locale: Locale;
  }> = ({ displayMonth, goToMonth, locale }) => {
    const handlePrevMonth = () => goToMonth(subMonths(displayMonth, 1));
    const handleNextMonth = () => goToMonth(addMonths(displayMonth, 1));

    return (
      <div className="flex justify-between items-center p-2">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(displayMonth, "MMMM yyyy", { locale })}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Conteúdo personalizado para cada dia do calendário
  const DayContent: DateFormatter = (day) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const vetsOnDuty = schedule.get(dayKey) || [];

    return (
      <div className="relative h-full w-full flex flex-col items-center justify-start p-1">
        <span className="text-sm font-medium">{format(day, "d")}</span>
        <div className="flex flex-wrap justify-center gap-0.5 mt-1">
          {vetsOnDuty.map((vetName, index) => (
            <Badge key={index} variant="secondary" className="text-[0.6rem] h-auto px-1 py-0.5 leading-none">
              {vetName.split(' ')[0]} {/* Mostra apenas o primeiro nome */}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="rounded-md border p-4 bg-background shadow-sm">
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={handleDayClick}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          showOutsideDays
          fixedWeeks
          locale={ptBR}
          components={{
            Caption: CustomCaption,
            DayContent: DayContent,
          }}
          classNames={{
            root: "p-3 w-full",
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell:
              "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected].day-range-middle)]:rounded-none [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-full w-full p-0 font-normal aria-selected:opacity-100",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground",
              "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground",
              "data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
              "data-[outside]:bg-accent/50 data-[outside]:text-muted-foreground data-[outside]:data-[selected]:bg-accent/50 data-[outside]:data-[selected]:text-muted-foreground"
            ),
            day_range_start: "day-range-start",
            day_range_end: "day-range-end",
            day_range_middle: "day-range-middle",
            day_hidden: "invisible",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Escala para {selectedDay ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR }) : ""}</DialogTitle>
            <DialogDescription>
              Selecione os veterinários que trabalharão neste dia.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-wrap gap-2">
              {veterinarians.map((vet) => (
                <Button
                  key={vet.id}
                  variant={editingDaySchedule.includes(vet.name) ? "default" : "outline"}
                  onClick={() => handleAddRemoveVet(vet.name)}
                  className={cn(
                    "flex items-center gap-1",
                    editingDaySchedule.includes(vet.name) ? "bg-primary text-primary-foreground" : ""
                  )}
                >
                  {vet.name.split(' ')[0]}
                  {editingDaySchedule.includes(vet.name) ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamScheduleCalendar;
"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
// Removendo a importação de estilos padrão do react-day-picker
// import "react-day-picker/dist/style.css"; 

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
  const [editingDaySchedule, setEditingDaySchedule] = useState<string[]>([]); // Vets assigned to the selected day
  const [schedule, setSchedule] = useState<Map<string, string[]>>(() => {
    // Initialize schedule from localStorage or with mock data
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem('teamSchedule');
      if (savedSchedule) {
        try {
          return new Map(JSON.parse(savedSchedule));
        } catch (e) {
          console.error("Failed to parse saved schedule from localStorage", e);
        }
      }
    }
    // Mock initial schedule if no saved data or parsing failed
    const initialSchedule = new Map<string, string[]>();
    const today = new Date();
    const nextMonthDay = addMonths(today, 1);
    const twoMonthsLaterDay = addMonths(today, 2);

    if (veterinarians.length >= 2) {
      initialSchedule.set(format(today, "yyyy-MM-dd"), [veterinarians[0].name, veterinarians[1].name]);
    }
    if (veterinarians.length >= 1) {
      initialSchedule.set(format(nextMonthDay, "yyyy-MM-dd"), [veterinarians[2]?.name || veterinarians[0].name]);
    }
    if (veterinarians.length >= 2) {
      initialSchedule.set(format(twoMonthsLaterDay, "yyyy-MM-dd"), [veterinarians[0].name, veterinarians[2]?.name || veterinarians[1].name]);
    }
    return initialSchedule;
  });

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      newSchedule.delete(dayKey);
    }
    setSchedule(newSchedule);
    setEditingDaySchedule(Array.from(currentVets)); // Update dialog's state immediately
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
          // Removendo todas as props 'components' e 'classNames'
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
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

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

interface CustomTeamCalendarProps {
  veterinarians: Veterinario[];
}

const CustomTeamCalendar: React.FC<CustomTeamCalendarProps> = ({ veterinarians }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingDaySchedule, setEditingDaySchedule] = useState<string[]>([]);

  const [schedule, setSchedule] = useState<Map<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem('teamSchedule');
      if (savedSchedule) {
        try {
          return new Map(JSON.parse(savedSchedule));
        } catch (e) {
          console.error("Erro ao carregar a escala do localStorage:", e);
        }
      }
    }
    return new Map<string, string[]>();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('teamSchedule', JSON.stringify(Array.from(schedule.entries())));
    }
  }, [schedule]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const emptyDaysBefore = Array.from({ length: startingDayOfWeek }).map((_, i) => null);

  const handleDayClick = (day: Date | null) => {
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
    setEditingDaySchedule(Array.from(currentVets));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="rounded-md border p-4 bg-background shadow-sm">
        <div className="flex justify-between items-center p-2 mb-4">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
          {weekdays.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDaysBefore.map((_, index) => (
            <div key={`empty-${index}`} className="h-28 w-full"></div> {/* Alterado de h-24 para h-28 */}
          ))}
          {daysInMonth.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const vetsOnDuty = schedule.get(dayKey) || [];
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isCurrentDay = isToday(day);

            return (
              <Button
                key={dayKey}
                variant="ghost"
                className={cn(
                  "h-28 w-full flex flex-col items-center justify-start p-1 text-sm font-normal relative", // Alterado de h-24 para h-28
                  "hover:bg-accent hover:text-accent-foreground",
                  isCurrentDay && "bg-accent text-accent-foreground",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                )}
                onClick={() => handleDayClick(day)}
              >
                <span className="font-medium">{format(day, "d")}</span>
                <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                  {vetsOnDuty.map((vetName, index) => (
                    <Badge key={index} variant="secondary" className="text-[0.6rem] h-auto px-1 py-0.5 leading-none">
                      {vetName}
                    </Badge>
                  ))}
                </div>
              </Button>
            );
          })}
        </div>
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
                  {vet.name}
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

export default CustomTeamCalendar;
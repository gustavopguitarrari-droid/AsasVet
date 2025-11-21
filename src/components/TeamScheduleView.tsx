"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/pages/Veterinarios";
import CustomCalendarCaption from "./CustomCalendarCaption";

interface TeamScheduleViewProps {
  veterinarians: TeamMember[];
  organizationId: string;
}

const TeamScheduleView: React.FC<TeamScheduleViewProps> = ({ veterinarians, organizationId }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const scheduledVetsForDay = useMemo(() => {
    if (typeof window === 'undefined' || !organizationId) return [];

    const localStorageKey = `teamSchedule_${organizationId}`;
    const savedSchedule = localStorage.getItem(localStorageKey);
    if (!savedSchedule) return [];

    try {
      const scheduleMap = new Map<string, string[]>(JSON.parse(savedSchedule));
      const dayKey = format(selectedDate, "yyyy-MM-dd");
      const vetNamesOnDuty = scheduleMap.get(dayKey) || [];
      
      return veterinarians.filter(vet => vetNamesOnDuty.includes(`${vet.first_name} ${vet.last_name}`));
    } catch (e) {
      console.error("Erro ao carregar a escala do localStorage:", e);
      return [];
    }
  }, [selectedDate, veterinarians, organizationId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Escala do Dia</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => setSelectedDate(day || new Date())}
              initialFocus
              locale={ptBR}
              components={{ Caption: (props) => <CustomCalendarCaption {...props} /> }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Veterinários na escala para {format(selectedDate, "dd/MM/yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledVetsForDay.length > 0 ? (
            <ul className="space-y-3">
              {scheduledVetsForDay.map(vet => (
                <li key={vet.id} className="flex items-center p-3 border rounded-md bg-card">
                  <Stethoscope className="h-5 w-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">{vet.first_name} {vet.last_name}</p>
                    <p className="text-sm text-muted-foreground">{vet.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum veterinário na escala para este dia. Você pode definir a escala na aba "Equipe".
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamScheduleView;
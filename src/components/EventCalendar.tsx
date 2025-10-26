"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Importação adicionada

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: "Consulta" | "Cirurgia" | "Vacina" | "Exame" | "Retorno" | "Outros";
  status?: "Agendada" | "Cancelada"; // Adicionado status
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onAddEventClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void; // Nova prop
}

const categoryColorMap: Record<CalendarEvent["category"], string> = {
  Consulta: "bg-event-consulta",
  Cirurgia: "bg-event-cirurgia",
  Vacina: "bg-event-vacina",
  Exame: "bg-event-exame",
  Retorno: "bg-event-retorno",
  Outros: "bg-event-outros",
};

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onAddEventClick, onEventClick }) => {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date());

  const eventsForSelectedDay = selectedDay
    ? events
        .filter((event) => isSameDay(event.date, selectedDay))
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const modifiers = {
    events: events.map((event) => event.date),
  };

  const modifiersClassNames = {
    events: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 lg:max-w-[600px]">
        <CardHeader>
          <CardTitle>Calendário de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            locale={ptBR}
            className="rounded-md border shadow-md w-full"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            footer={
              selectedDay && (
                <div className="mt-4 text-center">
                  <Button onClick={() => onAddEventClick(selectedDay)}>
                    Adicionar Agendamento em {format(selectedDay, "PPP", { locale: ptBR })}
                  </Button>
                </div>
              )
            }
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            Agendamentos para{" "}
            {selectedDay ? format(selectedDay, "PPP", { locale: ptBR }) : "Nenhum dia selecionado"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsForSelectedDay.length > 0 ? (
            <div className="space-y-3">
              {eventsForSelectedDay.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-md shadow-sm text-white cursor-pointer", // Adicionado cursor-pointer
                    categoryColorMap[event.category],
                    event.status === "Cancelada" && "opacity-50 line-through" // Estilo para cancelado
                  )}
                  onClick={() => onEventClick(event)} // Adicionado onClick
                >
                  <span className="font-bold text-lg">{event.time}</span>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white">
                      {event.category}
                    </Badge>
                  </div>
                  {event.status === "Cancelada" && (
                    <Badge variant="destructive" className="bg-red-700 text-white">
                      Cancelado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum agendamento para este dia.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCalendar;
"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react"; // Importar CheckCircle

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: "Consulta" | "Cirurgia" | "Vacina" | "Exame" | "Retorno" | "Outros";
  status?: "Agendada" | "Cancelada" | "Realizada"; // Adicionado status "Realizada"
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onAddEventClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void; // Nova prop
  searchTerm: string; // NOVO: Adicionar searchTerm
}

const categoryColorMap: Record<CalendarEvent["category"], string> = {
  Consulta: "bg-event-consulta",
  Cirurgia: "bg-event-cirurgia",
  Vacina: "bg-event-vacina",
  Exame: "bg-event-exame",
  Retorno: "bg-event-retorno",
  Outros: "bg-event-outros",
};

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onAddEventClick, onEventClick, searchTerm }) => {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date());

  const eventsForSelectedDay = React.useMemo(() => {
    if (!selectedDay) return [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return events
      .filter((event) => isSameDay(event.date, selectedDay))
      .filter((event) =>
        event.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        event.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        event.time.includes(lowerCaseSearchTerm)
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDay, searchTerm]); // Adicionar searchTerm como dependência

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
            // REMOVIDO: O footer com o botão de adicionar agendamento
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
              {eventsForSelectedDay.map((event) => {
                const isCancelled = event.status === "Cancelada";
                const isRealizada = event.status === "Realizada";

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-md shadow-sm text-white",
                      categoryColorMap[event.category],
                      (isCancelled || isRealizada) && "opacity-70" // Reduz a opacidade se cancelado ou realizado
                    )}
                  >
                    <span className="font-bold text-lg">{event.time}</span>
                    <div className="flex-1">
                      <p className={cn("font-medium", (isCancelled || isRealizada) && "line-through text-white/80")}>
                        {event.title}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white">
                        {event.category}
                      </Badge>
                    </div>
                    {isCancelled ? (
                      <Badge variant="destructive" className="bg-red-700 text-white">
                        Cancelado
                      </Badge>
                    ) : isRealizada ? (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" /> Realizada
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o clique no botão propague para o div pai
                          onEventClick(event);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Cancelar Agendamento</span>
                      </Button>
                    )}
                  </div>
                );
              })}
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
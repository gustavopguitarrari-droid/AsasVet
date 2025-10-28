"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Mock de eventos (reutilizado de AgendamentosMedicos para demonstração)
const mockEvents: CalendarEvent[] = [
  { id: "E001", title: "Consulta Rex", date: new Date(2024, 9, 28), time: "10:00", category: "Consulta" },
  { id: "E002", title: "Vacina Miau", date: new Date(2024, 9, 28), time: "14:30", category: "Vacina" },
  { id: "E003", title: "Cirurgia Pingo", date: new Date(2024, 9, 29), time: "09:00", category: "Cirurgia" },
  { id: "E004", title: "Exame Bob", date: new Date(2024, 10, 5), time: "11:00", category: "Exame" },
  { id: "E005", title: "Retorno Luna", date: new Date(2024, 10, 5), time: "16:00", category: "Retorno" },
  { id: "E006", title: "Consulta Thor", date: new Date(2024, 10, 6), time: "10:00", category: "Consulta" },
  { id: "E007", title: "Vacina Max", date: new Date(2024, 10, 7), time: "11:00", category: "Vacina" },
  { id: "E008", title: "Exame Dory", date: new Date(2024, 10, 8), time: "14:00", category: "Exame" },
  { id: "E009", title: "Cirurgia Shadow", date: new Date(2024, 10, 9), time: "08:00", category: "Cirurgia" },
  { id: "E010", title: "Retorno Rocky", date: new Date(2024, 10, 10), time: "17:00", category: "Retorno" },
];

// Mapeamento de cores para as categorias de eventos (já definido em globals.css)
const categoryColorMap: Record<CalendarEvent["category"], string> = {
  Consulta: "bg-event-consulta",
  Cirurgia: "bg-event-cirurgia",
  Vacina: "bg-event-vacina",
  Exame: "bg-event-exame",
  Retorno: "bg-event-retorno",
  Outros: "bg-event-outros",
};

const UpcomingEventsCard: React.FC = () => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { locale: ptBR });
  const endOfCurrentWeek = endOfWeek(today, { locale: ptBR });

  const eventsToday = mockEvents
    .filter(event => isSameDay(event.date, today))
    .sort((a, b) => a.time.localeCompare(b.time));

  const eventsThisWeek = mockEvents
    .filter(event => isWithinInterval(event.date, { start: today, end: endOfCurrentWeek }) && !isSameDay(event.date, today))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

  const renderEventList = (eventsToRender: CalendarEvent[]) => {
    if (eventsToRender.length === 0) {
      return <p className="text-muted-foreground text-sm">Nenhum evento agendado.</p>;
    }
    return (
      <div className="space-y-3">
        {eventsToRender.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-2 rounded-md border bg-card">
            <div className="flex flex-col">
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(event.date, "dd/MM", { locale: ptBR })} às {event.time}
              </p>
            </div>
            <Badge className={cn("text-white", categoryColorMap[event.category])}>
              {event.category}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="text-md font-semibold mb-3">Eventos de Hoje ({eventsToday.length})</h3>
        {renderEventList(eventsToday)}
        
        <h3 className="text-md font-semibold mt-6 mb-3">Eventos desta Semana ({eventsThisWeek.length})</h3>
        {renderEventList(eventsThisWeek)}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/components/EventCalendar"; // Import the interface

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
  // Define o início e o fim da semana, começando no domingo (0)
  const startOfCurrentWeek = startOfWeek(today, { locale: ptBR });
  const endOfCurrentWeek = endOfWeek(today, { locale: ptBR });

  const upcomingEvents = mockEvents
    .filter(event => isWithinInterval(event.date, { start: today, end: endOfCurrentWeek }))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

  return (
    <Card className="col-span-full bg-gray-100 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Próximos Eventos (Esta Semana)</CardTitle>
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-4">
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
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
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum evento agendado para esta semana.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;
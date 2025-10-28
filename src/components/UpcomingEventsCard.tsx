"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query"; // Importar useQuery
import { supabase } from "@/integrations/supabase/client"; // Importar supabase
import { useUser } from "@/context/UserContext"; // Importar useUser
import { CalendarEvent } from "@/components/EventCalendar"; // Importar a interface CalendarEvent

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
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  // Query para buscar eventos do Supabase
  const { data: events = [], isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['upcomingEvents', userId], // Chave de query única
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'Agendada') // Apenas eventos agendados
        .gte('date', format(new Date(), 'yyyy-MM-dd')) // Apenas eventos a partir de hoje
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error("Erro ao buscar eventos para o card 'Próximos Eventos':", error);
        throw error;
      }
      // Mapeia os dados do Supabase para o formato CalendarEvent
      return data.map(event => ({
        id: event.id,
        title: event.title,
        date: parseISO(event.date), // Converte a string ISO para objeto Date
        time: event.time,
        category: event.category as CalendarEvent["category"],
        status: (event.status || "Agendada") as CalendarEvent["status"],
      }));
    },
    enabled: !!userId, // Só executa a query se o userId estiver disponível
  });

  const today = new Date();
  const endOfCurrentWeek = endOfWeek(today, { locale: ptBR });

  const eventsToday = events
    .filter(event => isSameDay(event.date, today))
    .sort((a, b) => a.time.localeCompare(b.time));

  const eventsThisWeek = events
    .filter(event => isWithinInterval(event.date, { start: today, end: endOfCurrentWeek }) && !isSameDay(event.date, today))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

  const renderEventList = (eventsToRender: CalendarEvent[]) => {
    if (isLoading) {
      return <p className="text-center text-muted-foreground text-sm">Carregando eventos...</p>;
    }
    if (error) {
      return <p className="text-center text-destructive text-sm">Erro ao carregar eventos.</p>;
    }
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
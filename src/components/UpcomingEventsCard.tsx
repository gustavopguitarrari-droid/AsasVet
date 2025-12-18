"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle, Stethoscope } from "lucide-react"; // Importar Stethoscope
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { CalendarEvent } from "@/components/EventCalendar";
import { showSuccess, showError } from "@/utils/toast";
import { TeamMember } from "@/pages/Veterinarios"; // Importar TeamMember

// Mapeamento de cores para as categorias de eventos (já definido em globals.css)
const categoryColorMap: Record<CalendarEvent["category"], string> = {
  Consulta: "bg-event-consulta",
  Cirurgia: "bg-event-cirurgia",
  Vacina: "bg-event-vacina",
  Exame: "bg-event-exame",
  Retorno: "bg-event-retorno",
  Outros: "bg-event-outros",
};

interface UpcomingEventsCardProps {
  className?: string;
}

const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ className }) => {
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;
  const queryClient = useQueryClient();

  // Query para buscar eventos do Supabase
  const { data: events = [], isLoading: isLoadingEvents, error: eventsError } = useQuery<CalendarEvent[]>({
    queryKey: ['upcomingEvents', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('status', 'Cancelada')
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error("Erro ao buscar eventos para o card 'Próximos Eventos':", error);
        throw error;
      }
      return data.map(event => ({
        id: event.id,
        title: event.title,
        date: parseISO(event.date),
        time: event.time,
        category: event.category as CalendarEvent["category"],
        status: (event.status || "Agendada") as CalendarEvent["status"],
        assigned_to_id: event.assigned_to_id, // Adicionar assigned_to_id
      }));
    },
    enabled: !!organizationId,
  });

  // Query para buscar veterinários
  const { data: veterinarians = [], isLoading: isLoadingVets } = useQuery<TeamMember[]>({
    queryKey: ['teamMembersForUpcomingEvents', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('organization_id', organizationId)
        .in('role', ['Veterinário', 'Administrador']);
      if (error) {
        console.error("Erro ao buscar veterinários para o card 'Próximos Eventos':", error);
        throw error;
      }
      return data;
    },
    enabled: !!organizationId,
  });

  const vetMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const vet of veterinarians) {
      map.set(vet.id, `${vet.first_name} ${vet.last_name}`);
    }
    return map;
  }, [veterinarians]);

  // Mutação para atualizar o status do evento
  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, newStatus }: { eventId: string; newStatus: CalendarEvent["status"] }) => {
      if (!organizationId) throw new Error("Organization ID not available.");
      const { data, error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId)
        .eq('organization_id', organizationId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] });
      showSuccess("Evento confirmado como realizado!");
    },
    onError: (err) => {
      showError(`Erro ao confirmar evento: ${err.message}`);
    },
  });

  const handleConfirmEvent = (eventId: string) => {
    updateEventStatusMutation.mutate({ eventId, newStatus: "Realizada" });
  };

  const today = new Date();
  const endOfCurrentWeek = endOfWeek(today, { locale: ptBR });

  const eventsToday = events
    .filter(event => isSameDay(event.date, today))
    .sort((a, b) => a.time.localeCompare(b.time));

  const eventsThisWeek = events
    .filter(event => isWithinInterval(event.date, { start: today, end: endOfCurrentWeek }) && !isSameDay(event.date, today))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

  const renderEventList = (eventsToRender: CalendarEvent[]) => {
    if (isLoadingEvents || isLoadingVets) {
      return <p className="text-center text-muted-foreground text-sm">Carregando eventos...</p>;
    }
    if (eventsError) {
      return <p className="text-center text-destructive text-sm">Erro ao carregar eventos.</p>;
    }
    if (eventsToRender.length === 0) {
      return <p className="text-muted-foreground text-sm">Nenhum evento agendado.</p>;
    }
    return (
      <div className="space-y-3">
        {eventsToRender.map((event) => {
          const isCompleted = event.status === "Realizada";
          const vetName = event.assigned_to_id ? vetMap.get(event.assigned_to_id) : null;
          return (
            <div
              key={event.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md border bg-card",
                isCompleted && "opacity-70"
              )}
            >
              <div className="flex flex-col">
                <p className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
                  {event.title}
                </p>
                <p className={cn("text-sm text-muted-foreground", isCompleted && "line-through")}>
                  {format(event.date, "dd/MM", { locale: ptBR })} às {event.time}
                </p>
                {vetName && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {vetName}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-white", categoryColorMap[event.category])}>
                  {event.category}
                </Badge>
                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:bg-green-100"
                    onClick={() => handleConfirmEvent(event.id)}
                    disabled={updateEventStatusMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Confirmar Evento</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
        <CalendarDays className="h-5 w-5 text-current" />
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
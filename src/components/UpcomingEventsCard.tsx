"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle } from "lucide-react"; // Importar CheckCircle
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Importar Button
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Importar useMutation e useQueryClient
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { CalendarEvent } from "@/components/EventCalendar";
import { showSuccess, showError } from "@/utils/toast"; // Importar toasts

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
  const organizationId = appUser?.organizationId; // Usar organizationId
  const queryClient = useQueryClient(); // Inicializar queryClient

  // Query para buscar eventos do Supabase
  const { data: events = [], isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['upcomingEvents', organizationId], // Alterado para organizationId
    queryFn: async () => {
      if (!organizationId) return []; // Alterado para organizationId
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .neq('status', 'Cancelada') // Excluir eventos cancelados
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
      }));
    },
    enabled: !!organizationId, // Habilitar query apenas se organizationId estiver disponível
  });

  // Mutação para atualizar o status do evento
  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, newStatus }: { eventId: string; newStatus: CalendarEvent["status"] }) => {
      if (!organizationId) throw new Error("Organization ID not available."); // Alterado para organizationId
      const { data, error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId)
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents', organizationId] }); // Invalida a query para refetch
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] }); // Invalida a query da agenda principal
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
        {eventsToRender.map((event) => {
          const isCompleted = event.status === "Realizada";
          return (
            <div
              key={event.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md border text-white", // Adicionado text-white aqui
                categoryColorMap[event.category], // Aplicado o background da categoria aqui
                isCompleted && "opacity-70" // Reduz a opacidade se o evento estiver completo
              )}
            >
              <div className="flex flex-col">
                <p className={cn("font-medium", isCompleted && "line-through text-white/80")}> {/* Ajustado a cor do texto para concluído */}
                  {event.title}
                </p>
                <p className={cn("text-sm text-white/80", isCompleted && "line-through")}> {/* Ajustado a cor do texto para concluído */}
                  {format(event.date, "dd/MM", { locale: ptBR })} às {event.time}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-white/20 text-white"> {/* Badge com fundo branco semi-transparente */}
                  {event.category}
                </Badge>
                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20" // Ajustado as cores do botão
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
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddEventDialog, { EventFormValues } from "@/components/AddEventDialog";
import EventCalendar, { CalendarEvent } from "@/components/EventCalendar";
import { format, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";

const AgendamentosMedicos = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [defaultDateForNewEvent, setDefaultDateForNewEvent] = React.useState<Date | undefined>(undefined);

  // Query para buscar eventos do Supabase
  const { data: events = [], isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['events', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId); // Filtra por user_id para RLS
      if (error) throw error;
      // Mapeia os dados do Supabase para o formato CalendarEvent
      return data.map(event => ({
        id: event.id,
        title: event.title,
        date: parseISO(event.date), // Converte string de data para objeto Date
        time: event.time,
        category: event.category as CalendarEvent["category"],
      }));
    },
    enabled: !!userId, // Só executa a query se o userId estiver disponível
  });

  // Mutação para adicionar um novo evento
  const addEventMutation = useMutation({
    mutationFn: async (newEventData: EventFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: userId,
          title: newEventData.title,
          date: format(newEventData.date, "yyyy-MM-dd"), // Formata Date para string YYYY-MM-DD
          time: newEventData.time,
          category: newEventData.category,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', userId] }); // Invalida a query para rebuscar os eventos
      showSuccess("Agendamento adicionado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar agendamento: ${err.message}`);
    },
  });

  const handleAddEvent = (data: EventFormValues) => {
    addEventMutation.mutate(data);
  };

  const handleOpenDialogWithDate = (date: Date) => {
    setDefaultDateForNewEvent(date);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando agenda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar agenda: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Agenda</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialogWithDate(new Date())}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <AddEventDialog onSubmit={handleAddEvent} onCancel={() => setIsDialogOpen(false)} defaultDate={defaultDateForNewEvent} />
          </DialogContent>
        </Dialog>
      </div>

      <EventCalendar events={events} onAddEventClick={handleOpenDialogWithDate} />
    </div>
  );
};

export default AgendamentosMedicos;